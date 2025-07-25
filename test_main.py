"""Simple test application for Financial AI Assistant."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import os
from datetime import datetime
import httpx
import json
from dotenv import load_dotenv

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
    title="Financial AI Assistant - Test",
    description="Test API for Fi MCP and Perplexity integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    """Chat request model."""
    user_id: str
    query: str
    phone_number: Optional[str] = None


class MCPClient:
    """Simple MCP client for testing."""
    
    def __init__(self, base_url: str, phone_number: str):
        self.base_url = base_url
        self.phone_number = phone_number
        self.client = httpx.Client(timeout=30.0)
    
    def call_tool(self, tool_name: str, arguments: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call a tool on the MCP server."""
        if arguments is None:
            arguments = {}
            
        headers = {
            "Content-Type": "application/json",
            "X-Phone-Number": self.phone_number,
        }
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }
        
        try:
            response = self.client.post(
                f"{self.base_url}/mcp/stream",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result.get("result", {})
        except Exception as e:
            logger.error(f"MCP call failed: {str(e)}")
            return {"error": str(e)}


class PerplexityClient:
    """Simple Perplexity client for testing."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.Client(
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0,
            verify=False  # Disable SSL verification for testing
        )
    
    def search(self, query: str) -> Dict[str, Any]:
        """Search using Perplexity."""
        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "user",
                    "content": query
                }
            ],
            "max_tokens": 500,
            "temperature": 0.1,
            "return_citations": True,
            "return_related_questions": True
        }
        
        try:
            response = self.client.post(
                "https://api.perplexity.ai/chat/completions",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Perplexity search failed: {str(e)}")
            return {"error": str(e)}


# Initialize clients
mcp_client = None
perplexity_client = None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global mcp_client, perplexity_client
    
    # Initialize MCP client
    mcp_base_url = os.getenv("FI_MCP_BASE_URL")
    mcp_phone = os.getenv("FI_MCP_PHONE_NUMBER", "9999999999")
    if mcp_base_url:
        mcp_client = MCPClient(mcp_base_url, mcp_phone)
        logger.info(f"MCP client initialized with URL: {mcp_base_url}")
    
    # Initialize Perplexity client
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    if perplexity_key:
        perplexity_client = PerplexityClient(perplexity_key)
        logger.info("Perplexity client initialized")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Financial AI Assistant Test API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "mcp": mcp_client is not None,
            "perplexity": perplexity_client is not None
        }
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """Simple chat endpoint for testing."""
    try:
        query_lower = request.query.lower()
        response_data = {
            "query": request.query,
            "user_id": request.user_id,
            "timestamp": datetime.now().isoformat()
        }
        
        # Check if query is about Fi MCP data
        if any(keyword in query_lower for keyword in ["net worth", "credit score", "epf", "mutual fund", "bank transaction"]):
            if not mcp_client:
                return {"error": "MCP client not initialized"}
            
            # Use phone number from request or default
            phone = request.phone_number or os.getenv("FI_MCP_PHONE_NUMBER", "9999999999")
            mcp_client.phone_number = phone
            
            # Determine which tool to call
            if "net worth" in query_lower:
                result = mcp_client.call_tool("fetch_net_worth")
                response_data["mcp_tool"] = "fetch_net_worth"
            elif "credit" in query_lower:
                result = mcp_client.call_tool("fetch_credit_report")
                response_data["mcp_tool"] = "fetch_credit_report"
            elif "epf" in query_lower:
                result = mcp_client.call_tool("fetch_epf_details")
                response_data["mcp_tool"] = "fetch_epf_details"
            elif "mutual fund" in query_lower:
                result = mcp_client.call_tool("fetch_mf_transactions")
                response_data["mcp_tool"] = "fetch_mf_transactions"
            else:
                result = {"message": "Please specify which financial data you need"}
            
            response_data["mcp_response"] = result
            
        # Check if query needs market research
        elif any(keyword in query_lower for keyword in ["loan", "rate", "investment", "tax", "insurance", "market"]):
            if not perplexity_client:
                return {"error": "Perplexity client not initialized"}
            
            result = perplexity_client.search(request.query)
            response_data["perplexity_response"] = result
            
        else:
            response_data["message"] = "Please ask about financial data (net worth, credit score, etc.) or market information (loans, investments, etc.)"
        
        return response_data
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/test/mcp/{tool_name}")
async def test_mcp_tool(tool_name: str):
    """Test individual MCP tools."""
    if not mcp_client:
        return {"error": "MCP client not initialized"}
    
    try:
        result = mcp_client.call_tool(tool_name)
        return {
            "tool": tool_name,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/test/perplexity")
async def test_perplexity(query: str):
    """Test Perplexity search."""
    if not perplexity_client:
        return {"error": "Perplexity client not initialized"}
    
    try:
        result = perplexity_client.search(query)
        return {
            "query": query,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "test_main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
