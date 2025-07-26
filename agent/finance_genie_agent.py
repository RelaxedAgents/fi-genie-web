"""FinanceGenie Agent - Advanced financial intelligence agent."""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import os

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.state import CompiledStateGraph

from services.gemini_service import GeminiService
from services.mcp_service import MCPClient
from services.perplexity_service import PerplexityService
from tools.fi_mcp_tools import create_mcp_tools
from tools.market_research_tools import create_market_research_tools
from prompts.finance_genie_prompts import get_finance_genie_system_prompt

logger = logging.getLogger(__name__)


class FinanceGenieAgent:
    """
    FinanceGenie Agent that provides comprehensive financial intelligence.
    """
    
    def __init__(
        self, 
        project_id: str, 
        location: str, 
        mcp_server_url: str, 
        phone_number: str,
        perplexity_service: Optional[PerplexityService] = None
    ):
        """
        Initialize the FinanceGenie Agent.
        
        Args:
            project_id: GCP project ID
            location: GCP location
            mcp_server_url: MCP server URL
            phone_number: User's phone number
            perplexity_service: Optional Perplexity service for market research
        """
        self.project_id = project_id
        self.location = location
        self.phone_number = phone_number
        
        # Initialize services
        self.gemini_service = GeminiService(project_id=project_id, location=location)
        self.mcp_client = MCPClient(base_url=mcp_server_url, phone_number=phone_number)
        self.perplexity_service = perplexity_service
        
        # Initialize tools with enhanced logging
        self._initialize_tools()
        
        # Initialize the agent
        self.agent = self._create_agent()
        
        logger.info(f"FinanceGenie initialized for phone: {phone_number} with {len(self.tools)} tools")
    
    def _initialize_tools(self):
        """Initialize and organize tools with enhanced logging."""
        # Create financial data tools
        self.financial_data_tools = create_mcp_tools(self.mcp_client)
        logger.info(f"Initialized {len(self.financial_data_tools)} financial data tools")
        
        # Create market research tools if service is available
        self.market_research_tools = []
        if self.perplexity_service:
            self.market_research_tools = create_market_research_tools(self.perplexity_service)
            logger.info(f"Added {len(self.market_research_tools)} market research tools")
        
        # Combine all tools
        self.tools = self.financial_data_tools + self.market_research_tools
        
        # Log available tools for debugging
        tool_names = [tool.name for tool in self.tools]
        logger.info(f"Available tools: {tool_names}")
    
    def _create_agent(self) -> CompiledStateGraph:
        """Create the LangGraph agent with enhanced system prompt."""
        from langgraph.prebuilt import create_react_agent
        
        # Use the unified system prompt
        system_prompt = get_finance_genie_system_prompt()
        
        # Log the prompt length for debugging
        logger.debug(f"System prompt length: {len(system_prompt)}")
        
        # Log full prompt in debug mode
        if os.getenv("DEBUG_MODE", "false").lower() == "true":
            logger.debug(f"Full system prompt:\n{system_prompt}")
        
        # Create the agent - bind the system prompt to the model
        model = self.gemini_service.get_model().bind(
            system=system_prompt
        )
        
        # Create the agent
        agent = create_react_agent(
            model=model,
            tools=self.tools
        )
        
        return agent
    
    def health_check(self) -> Dict[str, Any]:
        """Check health of the agent and its dependencies."""
        try:
            # Check MCP client
            mcp_health = self.mcp_client.health_check()
            
            # Check Perplexity service if available
            perplexity_health = "not_configured"
            if self.perplexity_service:
                perplexity_health = "healthy"  # Simple check - could be enhanced with actual API check
            
            return {
                "status": "healthy",
                "mcp_client": "healthy" if mcp_health else "unhealthy",
                "perplexity_service": perplexity_health,
                "gemini_service": "healthy",
                "tools_loaded": len(self.tools),
                "phone_number": self.phone_number,
                "agent_type": "FinanceGenie"
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available financial tools."""
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
            # Log the query
            logger.info(f"Processing query: {query[:50]}...")
            
            # Prepare messages
            messages = [HumanMessage(content=query)]
            
            # Invoke the agent
            start_time = datetime.now()
            logger.info(f"Invoking agent with query: {query}")
            result = await self.agent.ainvoke({
                "messages": messages
            })
            end_time = datetime.now()
            
            # Calculate processing time
            processing_time = (end_time - start_time).total_seconds()
            logger.info(f"Query processed in {processing_time:.2f} seconds")
            
            # Extract the response
            response = result["messages"][-1].content if result.get("messages") else "No response generated"
            logger.info(f"Generated response (preview): {response[:100]}...")
            
            # Log tool usage if available
            if "intermediate_steps" in result:
                tool_usage = []
                for step in result["intermediate_steps"]:
                    if hasattr(step, "action") and hasattr(step.action, "tool"):
                        tool_usage.append(step.action.tool)
                if tool_usage:
                    logger.info(f"Tools used: {tool_usage}")
            
            return {
                "response": response,
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
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
            
            # Log the tool call
            logger.info(f"Calling tool {tool_name} with arguments: {arguments}")
            
            # Execute the tool
            start_time = datetime.now()
            result = await tool.ainvoke(arguments)
            end_time = datetime.now()
            
            # Calculate processing time
            processing_time = (end_time - start_time).total_seconds()
            logger.info(f"Tool {tool_name} executed in {processing_time:.2f} seconds")
            
            return {
                "result": result,
                "status": "success",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
            }
            
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            return {
                "error": str(e),
                "status": "error",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat()
            }
