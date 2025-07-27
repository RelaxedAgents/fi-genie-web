"""FastAPI application for Financial MCP Agent."""

import os
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
import vertexai

# Ensure dotenv is loaded
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("API: Loaded environment variables from .env file")
except ImportError:
    print("API: python-dotenv not installed, using environment variables as is")

from agent.finance_genie_agent import FinanceGenieAgent
from config.settings import settings
from api.routers.fi_mcp_routes import router as fi_mcp_router
from api.routers.streaming_routes import router as streaming_router
from api.routers.transform_routes import router as transform_router
from services.perplexity_service import PerplexityService, create_perplexity_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Initialize FastAPI app
app = FastAPI(
    title="FinanceGenie API",  
    description="AI-powered financial intelligence using LangGraph and MCP",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize Vertex AI
try:
    # Check if we're using direct API or Vertex AI
    provider = os.getenv("GEMINI_PROVIDER", "vertex")
    
    if provider == "vertex":
        vertexai.init(
            project=settings.project_id,
            location=settings.location,
            staging_bucket=settings.staging_bucket,
        )
        logger.info(f"Vertex AI initialized successfully for project: {settings.project_id}")
        logger.info(f"Location: {settings.location}")
        logger.info(f"Staging bucket: {settings.staging_bucket}")
        logger.info(f"Using Vertex AI model: {os.getenv('GEMINI_MODEL_VERTEX', 'gemini-2.5-pro')}")
    else:
        logger.info(f"Using Direct Gemini API with model: {os.getenv('GEMINI_MODEL_DIRECT', 'gemini-2.5-pro')}")
    
    logger.info(f"MCP Server URL: {settings.mcp_server_url}")
    logger.info("Financial Agent will be created per request with phone number from headers")
except Exception as e:
    logger.error(f"Error initializing AI services: {str(e)}")
    raise

# Initialize Perplexity service
perplexity_service = None
try:
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if api_key:
        perplexity_service = create_perplexity_service(api_key=api_key)
        logger.info(f"Perplexity service initialized successfully")
        logger.info(f"Using Perplexity model: {os.getenv('PERPLEXITY_MODEL', 'llama-3.1-sonar-large-128k-online')}")
    else:
        logger.warning("PERPLEXITY_API_KEY not found in environment variables")
except Exception as e:
    logger.warning(f"Perplexity service initialization failed: {str(e)}")
    perplexity_service = None

# Initialize Gemini service
gemini_service = None
try:
    from services.gemini_service import create_gemini_service
    gemini_service = create_gemini_service(
        project_id=settings.project_id,
        location=settings.location
    )
    logger.info(f"Gemini service initialized successfully")
except Exception as e:
    logger.warning(f"Gemini service initialization failed: {str(e)}")
    gemini_service = None

# Store services in app state for access by routes
app.state.app_state = {
    "services": {
        "perplexity": perplexity_service,
        "gemini": gemini_service
    }
}
logger.info("Services stored in app state")


# Include routers
app.include_router(fi_mcp_router)
app.include_router(streaming_router)
app.include_router(transform_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for the agent."""
    try:
        # Create a temporary agent instance for health check
        temp_agent = FinanceGenieAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number="0000000000",  # dummy phone for health check
            perplexity_service=perplexity_service  # Add Perplexity service
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
        "message": "FinanceGenie API",
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
        },
        "transform_endpoints": {
            "net_worth": "/api/v1/transform/dashboard/net-worth",
            "credit_report": "/api/v1/transform/dashboard/credit-report",
            "investments": "/api/v1/transform/dashboard/investments",
            "banking": "/api/v1/transform/dashboard/banking",
            "epf": "/api/v1/transform/dashboard/epf",
            "complete_dashboard": "/api/v1/transform/dashboard/complete",
            "custom": "/api/v1/transform/custom",
            "health": "/api/v1/transform/health"
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
