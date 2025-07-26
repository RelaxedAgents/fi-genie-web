"""Financial MCP tools - Custom LangChain tools that wrap MCP server tools."""

from typing import Dict, Any, Optional
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from services.mcp_service import MCPClient


class MCPToolInput(BaseModel):
    """Input schema for MCP tools (most tools don't require arguments)."""
    pass


class NetWorthTool(BaseTool):
    """Tool to fetch user's net worth from MCP server."""
    
    name: str = "fetch_net_worth"
    description: str = "Fetch the user's current net worth including all assets and liabilities"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the net worth fetch tool."""
        try:
            import logging
            logger = logging.getLogger(__name__)
            
            logger.info("Calling MCP tool: fetch_net_worth")
            result = self.mcp_client.call_tool("fetch_net_worth", {})
            logger.info(f"Received net worth data from MCP server: {str(result)[:100]}...")
            
            return str(result)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error fetching net worth: {str(e)}")
            return f"Error fetching net worth: {str(e)}"


class CreditReportTool(BaseTool):
    """Tool to fetch user's credit report from MCP server."""
    
    name: str = "fetch_credit_report"
    description: str = "Fetch the user's credit report and credit score information"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the credit report fetch tool."""
        try:
            result = self.mcp_client.call_tool("fetch_credit_report", {})
            return str(result)
        except Exception as e:
            return f"Error fetching credit report: {str(e)}"


class EPFDetailsTool(BaseTool):
    """Tool to fetch user's EPF (Employee Provident Fund) details from MCP server."""
    
    name: str = "fetch_epf_details"
    description: str = "Fetch the user's EPF (Employee Provident Fund) account details and balance"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the EPF details fetch tool."""
        try:
            result = self.mcp_client.call_tool("fetch_epf_details", {})
            return str(result)
        except Exception as e:
            return f"Error fetching EPF details: {str(e)}"


class MutualFundTransactionsTool(BaseTool):
    """Tool to fetch user's mutual fund transactions from MCP server."""
    
    name: str = "fetch_mf_transactions"
    description: str = "Fetch the user's mutual fund transactions and investment history"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the mutual fund transactions fetch tool."""
        try:
            result = self.mcp_client.call_tool("fetch_mf_transactions", {})
            return str(result)
        except Exception as e:
            return f"Error fetching mutual fund transactions: {str(e)}"


class BankTransactionsTool(BaseTool):
    """Tool to fetch user's bank transactions from MCP server."""
    
    name: str = "fetch_bank_transactions"
    description: str = "Fetch the user's bank account transactions and transaction history"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the bank transactions fetch tool."""
        try:
            result = self.mcp_client.call_tool("fetch_bank_transactions", {})
            return str(result)
        except Exception as e:
            return f"Error fetching bank transactions: {str(e)}"


class StockTransactionsTool(BaseTool):
    """Tool to fetch user's stock transactions from MCP server."""
    
    name: str = "fetch_stock_transactions"
    description: str = "Fetch the user's stock transactions and trading history"
    args_schema: type[BaseModel] = MCPToolInput
    mcp_client: MCPClient = Field(exclude=True)
    
    def _run(self, **kwargs) -> str:
        """Execute the stock transactions fetch tool."""
        try:
            result = self.mcp_client.call_tool("fetch_stock_transactions", {})
            return str(result)
        except Exception as e:
            return f"Error fetching stock transactions: {str(e)}"


def create_mcp_tools(mcp_client: MCPClient) -> list[BaseTool]:
    """
    Create all MCP tools with the given client.
    
    Args:
        mcp_client: Initialized MCP client
        
    Returns:
        List of LangChain tools
    """
    return [
        NetWorthTool(mcp_client=mcp_client),
        CreditReportTool(mcp_client=mcp_client),
        EPFDetailsTool(mcp_client=mcp_client),
        MutualFundTransactionsTool(mcp_client=mcp_client),
        BankTransactionsTool(mcp_client=mcp_client),
        StockTransactionsTool(mcp_client=mcp_client),
    ]
