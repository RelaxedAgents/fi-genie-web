"""Financial MCP Agent API routes."""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import vertexai

from agent.fi_mcp_agent import FiMcpAgent
from config.settings import settings


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


def create_fi_mcp_agent(phone_number: str) -> FiMcpAgent:
    """Create a Financial MCP Agent instance for a specific phone number."""
    try:
        agent = FiMcpAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=phone_number
        )
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating Financial Agent: {str(e)}")


@router.get("/tools")
async def get_tools():
    """Get list of available financial tools."""
    try:
        # Create a temporary agent instance to get tools list
        temp_agent = create_fi_mcp_agent("0000000000")  # dummy phone for tools list
        tools = temp_agent.get_available_tools()
        return {
            "tools": tools,
            "count": len(tools)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def agent_query(
    request: QueryRequest,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """Main agent query endpoint."""
    try:
        # Create agent instance for this phone number
        agent = create_fi_mcp_agent(x_phone_number)
        
        # Process the query
        result = agent.query(request.query)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tool/{tool_name}")
async def direct_tool_call(
    tool_name: str,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """Direct tool execution endpoint."""
    try:
        # Create agent instance for this phone number
        agent = create_fi_mcp_agent(x_phone_number)
        
        # Check if tool exists
        available_tools = [tool.name for tool in agent.tools]
        if tool_name not in available_tools:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found. Available tools: {available_tools}"
            )
        
        # Execute the tool directly via MCP client
        try:
            result = agent.mcp_client.call_tool(tool_name, {})
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
