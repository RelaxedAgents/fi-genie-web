"""Main FastAPI application for Financial AI Assistant."""

# CRITICAL: Disable SSL verification BEFORE any imports
import os
import ssl

# Completely disable SSL verification
ssl._create_default_https_context = ssl._create_unverified_context

# Set environment variables to completely disable SSL verification
os.environ["PYTHONHTTPSVERIFY"] = "0"
os.environ["REQUESTS_CA_BUNDLE"] = ""
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["SSL_CERT_FILE"] = ""
os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = ""
os.environ["GRPC_SSL_CIPHER_SUITES"] = "ALL"
os.environ["GOOGLE_API_USE_CLIENT_CERTIFICATE"] = "false"
os.environ["GOOGLE_API_USE_MTLS_ENDPOINT"] = "never"
os.environ["GRPC_TLS_DISABLE_VERIFICATION"] = "1"

# Now load other configurations
from dotenv import load_dotenv
load_dotenv()

import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import asyncio

from config.settings import settings
from services.gemini_service import GeminiService
from services import PerplexityService, MCPClient
from memory import MemoryManager
from agent import (
    OrchestratorAgent,
    FinancialDataAgent,
    MarketResearchAgent,
    AdvisoryAgent
)
from api.routers import chat_router, streaming_router

# Configure logging with enhanced format including exception info
logging.basicConfig(
    level=logging.DEBUG if os.getenv("DEBUG", "false").lower() == "true" else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Create a custom formatter that includes stack traces
class ExceptionFormatter(logging.Formatter):
    def format(self, record):
        result = super().format(record)
        if record.exc_info:
            # Include the stack trace
            import traceback
            result += "\n" + "".join(traceback.format_exception(*record.exc_info))
        return result

# Apply the custom formatter to all handlers
for handler in logging.root.handlers:
    handler.setFormatter(ExceptionFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s'
    ))

logger = logging.getLogger(__name__)

# Set specific loggers to appropriate levels
logging.getLogger("agent.base_agent").setLevel(logging.DEBUG)
logging.getLogger("agent.orchestrator_agent").setLevel(logging.DEBUG)


# Global instances
app_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services and agents on startup."""
    try:
        logger.info("Initializing Financial AI Assistant...")
        
        # Initialize services
        logger.info("Initializing services...")
        memory_manager = MemoryManager(
            mem0_base_url=os.getenv("MEM0_BASE_URL", "https://mem0-server-sbizyecxta-el.a.run.app")
        )
        
        gemini_service = GeminiService(
            project_id=os.getenv("GCP_PROJECT_ID"),
            location=os.getenv("GCP_LOCATION", "us-central1"),
            provider="direct",  # Force direct API mode
            api_key=os.getenv("GEMINI_API_KEY")
        )
        
        mcp_client = MCPClient(
            base_url=os.getenv("FI_MCP_BASE_URL"),
            phone_number=os.getenv("FI_MCP_PHONE_NUMBER", "2222222222")
        )
        
        perplexity_service = PerplexityService(
            api_key=os.getenv("PERPLEXITY_API_KEY")
        )
        
        # Initialize agents with custom temperatures if specified
        logger.info("Initializing agents...")
        
        # Create agent-specific models with custom temperatures
        financial_model = gemini_service.create_agent_model(
            temperature=float(os.getenv("FINANCIAL_AGENT_TEMPERATURE", "0.5"))
        )
        market_model = gemini_service.create_agent_model(
            temperature=float(os.getenv("MARKET_AGENT_TEMPERATURE", "0.7"))
        )
        advisory_model = gemini_service.create_agent_model(
            temperature=float(os.getenv("ADVISORY_AGENT_TEMPERATURE", "0.8"))
        )
        
        financial_agent = FinancialDataAgent(
            memory_manager=memory_manager,
            gemini_service=financial_model,
            mcp_client=mcp_client
        )
        
        market_agent = MarketResearchAgent(
            memory_manager=memory_manager,
            gemini_service=market_model,
            perplexity_client=perplexity_service
        )
        
        advisory_agent = AdvisoryAgent(
            memory_manager=memory_manager,
            gemini_service=advisory_model
        )
        
        # Initialize orchestrator with sub-agents
        # Create a properly configured model for the orchestrator
        orchestrator_model = gemini_service.create_agent_model(
            temperature=0.7,
            max_tokens=8192
        )
        
        orchestrator = OrchestratorAgent(
            memory_manager=memory_manager,
            gemini_service=orchestrator_model,
            sub_agents={
                "financial_data": financial_agent,
                "market_research": market_agent,
                "advisory": advisory_agent
            }
        )
        
        # Store in app state
        app_state.update({
            "orchestrator": orchestrator,
            "memory_manager": memory_manager,
            "services": {
                "gemini": gemini_service,
                "mcp": mcp_client,
                "perplexity": perplexity_service
            },
            "agents": {
                "financial_data": financial_agent,
                "market_research": market_agent,
                "advisory": advisory_agent
            }
        })
        
        logger.info("Financial AI Assistant initialized successfully!")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}", exc_info=True)
        raise
    
    yield
    
    # Cleanup
    logger.info("Shutting down Financial AI Assistant...")


# Initialize FastAPI app
app = FastAPI(
    title="Financial AI Assistant",
    description="AI-powered financial assistant with memory and multi-agent orchestration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Include routers
app.include_router(chat_router.router, prefix="/chat", tags=["Chat"])
app.include_router(streaming_router.router, prefix="/stream", tags=["Streaming"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Financial AI Assistant API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "chat": {
                "query": "/chat/query",
                "history": "/chat/history/{user_id}",
                "context": "/chat/context/{user_id}"
            },
            "streaming": {
                "query": "/stream/query",
                "events": "/stream/events"
            },
            "agents": {
                "list": "/agents",
                "capabilities": "/agents/{agent_name}/capabilities"
            }
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    try:
        # Check if all services are initialized
        if not app_state:
            return {
                "status": "initializing",
                "message": "Services are still initializing"
            }
        
        # Check memory service
        memory_healthy = await app_state["memory_manager"].mem0_client.health_check()
        
        # Check MCP service
        mcp_healthy = await app_state["services"]["mcp"].health_check()
        
        return {
            "status": "healthy",
            "services": {
                "memory": "healthy" if memory_healthy else "unhealthy",
                "mcp": "healthy" if mcp_healthy else "unhealthy",
                "orchestrator": "healthy" if app_state.get("orchestrator") else "unhealthy"
            },
            "agents_loaded": list(app_state.get("agents", {}).keys())
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.get("/agents", tags=["Agents"])
async def list_agents():
    """List all available agents and their capabilities."""
    agents_info = {}
    
    for name, agent in app_state.get("agents", {}).items():
        agents_info[name] = agent.get_capabilities()
    
    # Add orchestrator
    if "orchestrator" in app_state:
        agents_info["orchestrator"] = app_state["orchestrator"].get_capabilities()
    
    return {
        "agents": agents_info,
        "total": len(agents_info)
    }


@app.get("/agents/{agent_name}/capabilities", tags=["Agents"])
async def get_agent_capabilities(agent_name: str):
    """Get capabilities of a specific agent."""
    agents = app_state.get("agents", {})
    
    if agent_name == "orchestrator" and "orchestrator" in app_state:
        return app_state["orchestrator"].get_capabilities()
    
    if agent_name not in agents:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_name}' not found"
        )
    
    return agents[agent_name].get_capabilities()


@app.post("/chat/query", tags=["Chat"])
async def chat_query(request: Dict[str, Any]):
    """
    Process a chat query through the orchestrator.
    
    Request body:
    {
        "query": "Your financial question",
        "user_id": "user123",
        "session_id": "session456" (optional)
    }
    """
    query = request.get("query")
    user_id = request.get("user_id", "default_user")
    session_id = request.get("session_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    try:
        orchestrator = app_state.get("orchestrator")
        if not orchestrator:
            raise HTTPException(
                status_code=503,
                detail="Orchestrator not initialized"
            )
        
        # Process query through orchestrator
        result = await orchestrator.process(
            query=query,
            user_id=user_id,
            session_id=session_id
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing query: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


@app.post("/stream/query", tags=["Streaming"])
async def stream_query(request: Dict[str, Any]):
    """
    Stream a query response with progress updates.
    
    Request body:
    {
        "query": "Your financial question",
        "user_id": "user123",
        "session_id": "session456" (optional)
    }
    """
    query = request.get("query")
    user_id = request.get("user_id", "default_user")
    session_id = request.get("session_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    async def generate():
        """Generate SSE events."""
        try:
            orchestrator = app_state.get("orchestrator")
            if not orchestrator:
                yield f"data: {{'type': 'error', 'message': 'Orchestrator not initialized'}}\n\n"
                return
            
            # Stream events from orchestrator
            async for event in orchestrator.aquery_stream_events(
                query=query,
                user_id=user_id,
                context={"session_id": session_id}
            ):
                import json
                yield f"data: {json.dumps(event)}\n\n"
            
            # Send completion event
            yield f"data: {{'type': 'complete', 'status': 'success'}}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}", exc_info=True)
            yield f"data: {{'type': 'error', 'message': '{str(e)}'}}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


@app.get("/chat/context/{user_id}", tags=["Chat"])
async def get_user_context(user_id: str):
    """Get user context from memory."""
    try:
        memory_manager = app_state.get("memory_manager")
        if not memory_manager:
            raise HTTPException(
                status_code=503,
                detail="Memory manager not initialized"
            )
        
        context = await memory_manager.get_user_context(user_id)
        return context.dict()
        
    except Exception as e:
        logger.error(f"Error getting user context: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user context: {str(e)}"
        )


# Export app state for use in routers
app.state.app_state = app_state


# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8080))
    uvicorn.run(
        "api.main_v2:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
