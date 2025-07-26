"""Financial MCP Agent API routes."""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
import vertexai
import logging

from agent.finance_genie_agent import FinanceGenieAgent
from config.settings import settings
from services.perplexity_service import PerplexityService

logger = logging.getLogger(__name__)


# Initialize Vertex AI
vertexai.init(
    project=settings.project_id,
    location=settings.location,
    staging_bucket=settings.staging_bucket,
)

router = APIRouter(prefix="/agent", tags=["Financial MCP Agent"])


class QueryRequest(BaseModel):
    """Request model for agent queries."""
    query: str


def create_fi_mcp_agent(phone_number: str, perplexity_service=None) -> FinanceGenieAgent:
    """Create a FinanceGenie Agent instance for a specific phone number."""
    try:
        logger.info(f"Creating FinanceGenie agent for phone: {phone_number}")
        agent = FinanceGenieAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=phone_number,
            perplexity_service=perplexity_service
        )
        return agent
    except Exception as e:
        logger.error(f"Error creating FinanceGenie Agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating FinanceGenie Agent: {str(e)}")


@router.get("/tools")
async def get_tools(request: Request):
    """Get list of available financial tools."""
    try:
        # Get Perplexity service from app state if available
        app_state = getattr(request.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create a temporary agent instance to get tools list
        temp_agent = create_fi_mcp_agent("0000000000", perplexity_service)  # dummy phone for tools list
        tools = temp_agent.get_available_tools()
        return {
            "tools": tools,
            "count": len(tools)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def agent_query(
    request_body: QueryRequest,
    request: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """Main agent query endpoint."""
    try:
        # Get Perplexity service from app state if available
        app_state = getattr(request.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create agent instance for this phone number
        agent = create_fi_mcp_agent(x_phone_number, perplexity_service)
        
        # Process the query - await the async method
        result = await agent.query(request_body.query)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tool/{tool_name}")
async def direct_tool_call(
    tool_name: str,
    request: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """Direct tool execution endpoint."""
    try:
        # Get Perplexity service from app state if available
        app_state = getattr(request.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create agent instance for this phone number
        agent = create_fi_mcp_agent(x_phone_number, perplexity_service)
        
        # Check if tool exists
        available_tools = [tool.name for tool in agent.tools]
        if tool_name not in available_tools:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found. Available tools: {available_tools}"
            )
        
        # Execute the tool directly via MCP client
        try:
            result = await agent.call_tool(tool_name, {})
            return {
                "tool": tool_name,
                "result": result,
                "status": "success",
                "session_id": agent.mcp_client.session_id
            }
        except Exception as e:
            return {
                "tool": tool_name,
                "error": str(e),
                "status": "error"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
