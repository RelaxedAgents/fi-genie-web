"""FastAPI application for Financial MCP Agent."""

import os
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
import vertexai

from agent.fi_mcp_agent import FiMcpAgent
from config.settings import settings
from api.routers.fi_mcp_routes import router as fi_mcp_router
from api.routers.streaming_routes import router as streaming_router


# Initialize FastAPI app
app = FastAPI(
    title="Financial MCP Agent API",  
    description="AI-powered financial data access and analysis using LangGraph and MCP",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize Vertex AI
try:
    vertexai.init(
        project=settings.project_id,
        location=settings.location,
        staging_bucket=settings.staging_bucket,
    )
    print(f"Vertex AI initialized successfully for project: {settings.project_id}")
    print(f"Location: {settings.location}")
    print(f"Staging bucket: {settings.staging_bucket}")
    print(f"MCP Server URL: {settings.mcp_server_url}")
    print("Financial Agent will be created per request with phone number from headers")
except Exception as e:
    print(f"Error initializing Vertex AI: {str(e)}")
    raise


# Include routers
app.include_router(fi_mcp_router)
app.include_router(streaming_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for the agent."""
    try:
        # Create a temporary agent instance for health check
        temp_agent = FiMcpAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number="0000000000"  # dummy phone for health check
        )
        
        health_status = temp_agent.health_check()
        status_code = 200 if health_status["status"] == "healthy" else 503
        
        if status_code != 200:
            raise HTTPException(status_code=status_code, detail=health_status)
        
        return health_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail={"status": "error", "error": str(e)})


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Financial MCP Agent API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "agent_endpoints": {
            "tools": "/agent/tools",
            "query": "/agent/query",
            "direct_tool": "/agent/tool/{tool_name}",
            "streaming": {
                "query": "/agent/stream/query",
                "query_native": "/agent/stream/query/native",
                "test": "/agent/stream/test"
            }
        }
    }


# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8080))
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
