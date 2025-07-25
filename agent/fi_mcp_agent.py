"""Financial MCP Agent - Main agent class for the API."""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph

from services.gemini_service import GeminiService
from services.mcp_service import MCPClient
from tools.fi_mcp_tools import create_mcp_tools

logger = logging.getLogger(__name__)


class FiMcpAgent:
    """
    Financial MCP Agent that provides access to personal financial data.
    """
    
    def __init__(self, project_id: str, location: str, mcp_server_url: str, phone_number: str):
        """
        Initialize the Financial MCP Agent.
        
        Args:
            project_id: GCP project ID
            location: GCP location
            mcp_server_url: MCP server URL
            phone_number: User's phone number
        """
        self.project_id = project_id
        self.location = location
        self.phone_number = phone_number
        
        # Initialize services
        self.gemini_service = GeminiService(project_id=project_id, location=location)
        self.mcp_client = MCPClient(base_url=mcp_server_url, phone_number=phone_number)
        
        # Create tools
        self.tools = create_mcp_tools(self.mcp_client)
        
        # Initialize the agent
        self.agent = self._create_agent()
        
        logger.info(f"FiMcpAgent initialized for phone: {phone_number}")
    
    def _create_agent(self) -> CompiledStateGraph:
        """Create the LangGraph agent."""
        from langgraph.prebuilt import create_react_agent
        
        # System prompt
        system_prompt = """You are a helpful financial assistant with access to user's personal financial data.
        
        You have access to the following tools:
        - fetch_net_worth: Get user's assets and liabilities
        - fetch_credit_report: Get credit score and report
        - fetch_epf_details: Get EPF account details
        - fetch_mf_transactions: Get mutual fund transactions
        - fetch_bank_transactions: Get bank transactions
        - fetch_stock_transactions: Get stock transactions
        
        Always be helpful and provide accurate information based on the data available.
        If you don't have access to certain information, let the user know.
        """
        
        # Create the agent
        agent = create_react_agent(
            model=self.gemini_service.get_model(),
            tools=self.tools,
            state_modifier=system_prompt
        )
        
        return agent
    
    def health_check(self) -> Dict[str, Any]:
        """Check health of the agent and its dependencies."""
        try:
            # Check MCP client
            mcp_health = self.mcp_client.health_check()
            
            return {
                "status": "healthy",
                "mcp_client": "healthy" if mcp_health else "unhealthy",
                "gemini_service": "healthy",
                "tools_loaded": len(self.tools),
                "phone_number": self.phone_number
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools."""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
    
    async def query(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a query through the agent.
        
        Args:
            query: User's query
            context: Optional context
            
        Returns:
            Agent's response
        """
        try:
            # Prepare messages
            messages = [HumanMessage(content=query)]
            
            # Invoke the agent
            result = await self.agent.ainvoke({
                "messages": messages
            })
            
            # Extract the response
            response = result["messages"][-1].content if result.get("messages") else "No response generated"
            
            return {
                "response": response,
                "status": "success",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "response": f"Error processing query: {str(e)}",
                "status": "error",
                "timestamp": datetime.now().isoformat()
            }
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call a specific tool directly.
        
        Args:
            tool_name: Name of the tool
            arguments: Tool arguments
            
        Returns:
            Tool result
        """
        try:
            # Find the tool
            tool = next((t for t in self.tools if t.name == tool_name), None)
            if not tool:
                return {
                    "error": f"Tool '{tool_name}' not found",
                    "available_tools": [t.name for t in self.tools]
                }
            
            # Execute the tool
            result = await tool.ainvoke(arguments)
            
            return {
                "result": result,
                "status": "success",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            return {
                "error": str(e),
                "status": "error",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat()
            }
