"""Simple Fi MCP tools without LangChain dependency."""

from typing import Dict, Any
from services.mcp_service import MCPClient


class SimpleMCPTool:
    """Simple tool wrapper for MCP tools."""
    
    def __init__(self, name: str, description: str, mcp_client: MCPClient):
        self.name = name
        self.description = description
        self.mcp_client = mcp_client
    
    def _run(self, **kwargs) -> str:
        """Execute the tool."""
        try:
            result = self.mcp_client.call_tool(self.name, kwargs)
            return str(result)
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def _arun(self, **kwargs) -> str:
        """Async version of run."""
        return self._run(**kwargs)


def create_simple_mcp_tools(mcp_client: MCPClient) -> list:
    """Create simple MCP tools."""
    tools = [
        SimpleMCPTool("fetch_net_worth", "Fetch user's net worth", mcp_client),
        SimpleMCPTool("fetch_credit_report", "Fetch credit report", mcp_client),
        SimpleMCPTool("fetch_epf_details", "Fetch EPF details", mcp_client),
        SimpleMCPTool("fetch_mf_transactions", "Fetch mutual fund transactions", mcp_client),
        SimpleMCPTool("fetch_bank_transactions", "Fetch bank transactions", mcp_client),
        SimpleMCPTool("fetch_stock_transactions", "Fetch stock transactions", mcp_client),
    ]
    return tools
