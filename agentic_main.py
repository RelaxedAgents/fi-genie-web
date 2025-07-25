"""Main application with complete agentic flow."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Import agents
from agents.orchestrator_agent import OrchestratorAgent
from agents.data_agent import DataIntelligenceAgent
from agents.advisory_agent import FinancialAdvisoryAgent

# Import services
from services.mcp_service import MCPClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Financial AI Assistant - Agentic Flow",
    description="Multi-agent financial assistant with Fi MCP and Perplexity integration",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentQueryRequest(BaseModel):
    """Request model for agent queries."""
    user_id: str
    query: str
    phone_number: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class PerplexityClient:
    """Simple Perplexity client."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0,
            verify=False  # For testing
        )
    
    async def search(self, query: str, **kwargs) -> Dict[str, Any]:
        """Async search using Perplexity."""
        payload = {
            "model": kwargs.get("model", "sonar-pro"),
            "messages": [
                {
                    "role": "user",
                    "content": query
                }
            ],
            "max_tokens": kwargs.get("max_tokens", 500),
            "temperature": kwargs.get("temperature", 0.1),
            "return_citations": kwargs.get("return_citations", True),
            "return_related_questions": kwargs.get("return_related_questions", True),
            "search_recency_filter": kwargs.get("search_recency_filter", "week")
        }
        
        try:
            response = await self.client.post(
                "https://api.perplexity.ai/chat/completions",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Perplexity search failed: {str(e)}")
            return {"error": str(e)}


class FinancialAssistantOrchestrator:
    """Main orchestrator for the multi-agent system."""
    
    def __init__(self):
        # Initialize orchestrator agent
        self.orchestrator = OrchestratorAgent()
        
        # Initialize clients
        self.mcp_client = None
        self.perplexity_client = None
        
        # Agent instances (created per request)
        self.agents = {}
        
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize external service clients."""
        # Initialize MCP client
        mcp_url = os.getenv("FI_MCP_BASE_URL")
        if mcp_url:
            self.mcp_client = MCPClient(mcp_url, "0000000000")  # Default phone
            logger.info(f"MCP client initialized with URL: {mcp_url}")
        
        # Initialize Perplexity client
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key:
            self.perplexity_client = PerplexityClient(perplexity_key)
            logger.info("Perplexity client initialized")
    
    def _get_or_create_agents(self, phone_number: str) -> Dict[str, Any]:
        """Get or create agent instances for a phone number."""
        # Update MCP client phone number
        if self.mcp_client:
            self.mcp_client.phone_number = phone_number
        
        # Create agents
        agents = {}
        
        # Data Intelligence Agent
        if self.mcp_client:
            agents["data_intelligence"] = DataIntelligenceAgent(self.mcp_client)
        
        # Financial Advisory Agent
        if self.perplexity_client:
            agents["financial_advisory"] = FinancialAdvisoryAgent(self.perplexity_client)
        
        return agents
    
    async def process_query(self, request: AgentQueryRequest) -> Dict[str, Any]:
        """Process a user query through the agent system."""
        try:
            # Step 1: Orchestrator classifies intent and determines routing
            orchestrator_result = await self.orchestrator.process(request.query)
            
            if orchestrator_result["status"] == "error":
                return orchestrator_result
            
            # Step 2: Get or create agents for this user
            phone = request.phone_number or os.getenv("FI_MCP_PHONE_NUMBER", "9999999999")
            agents = self._get_or_create_agents(phone)
            
            # Step 3: Execute required agents
            agent_results = {}
            final_response = ""
            
            for agent_name in orchestrator_result["required_agents"]:
                if agent_name in agents:
                    logger.info(f"Executing agent: {agent_name}")
                    
                    # Prepare context for agent
                    agent_context = request.context or {}
                    agent_context["orchestrator_result"] = orchestrator_result
                    agent_context["previous_results"] = agent_results
                    
                    # Execute agent
                    result = await agents[agent_name].process(request.query, agent_context)
                    agent_results[agent_name] = result
                    
                    # Accumulate responses
                    if result.get("status") == "success" and result.get("response"):
                        if final_response:
                            final_response += "\n\n"
                        final_response += result["response"]
                else:
                    logger.warning(f"Agent {agent_name} not available")
            
            # Step 4: Prepare final response
            return {
                "status": "success",
                "query": request.query,
                "intent": orchestrator_result["intent"],
                "agents_used": orchestrator_result["required_agents"],
                "response": final_response or "I couldn't process your request. Please try again.",
                "agent_results": agent_results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in orchestrator: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "response": f"I encountered an error: {str(e)}"
            }


# Initialize the orchestrator
orchestrator = FinancialAssistantOrchestrator()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Financial AI Assistant - Agentic Flow",
        "version": "2.0.0",
        "endpoints": {
            "query": "/agent/query",
            "health": "/health",
            "agents": "/agents"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "mcp": orchestrator.mcp_client is not None,
            "perplexity": orchestrator.perplexity_client is not None,
            "orchestrator": True
        }
    }


@app.get("/agents")
async def list_agents():
    """List available agents and their capabilities."""
    # Get sample agents to show capabilities
    sample_agents = orchestrator._get_or_create_agents("0000000000")
    
    agent_info = {
        "orchestrator": orchestrator.orchestrator.get_capabilities()
    }
    
    for name, agent in sample_agents.items():
        agent_info[name] = agent.get_capabilities()
    
    return {
        "agents": agent_info,
        "total": len(agent_info)
    }


@app.post("/agent/query")
async def agent_query(request: AgentQueryRequest):
    """Main endpoint for agent queries."""
    return await orchestrator.process_query(request)


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))  # Different port from test_main
    
    # Run the application
    uvicorn.run(
        "agentic_main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
