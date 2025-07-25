"""Financial MCP Agent - LangGraph Agent with MCP tool integration."""

import json
from typing import Dict, Any, List, Optional
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from langchain_core.prompts import ChatPromptTemplate

from services.mcp_service import MCPClient
from tools.fi_mcp_tools import create_mcp_tools
from prompts.fi_mcp_prompts import get_fi_mcp_system_prompt


class FiMcpAgent:
    """Financial MCP Agent - LangGraph agent for financial data queries using MCP tools."""
    
    def __init__(self, 
                 project_id: str, 
                 location: str, 
                 mcp_server_url: str, 
                 phone_number: str):
        """
        Initialize the Financial MCP Agent.
        
        Args:
            project_id: Google Cloud project ID
            location: Google Cloud location
            mcp_server_url: URL of the MCP server
            phone_number: Phone number for MCP authentication
        """
        self.project_id = project_id
        self.location = location
        self.mcp_server_url = mcp_server_url
        self.phone_number = phone_number
        
        # Initialize MCP client
        self.mcp_client = MCPClient(mcp_server_url, phone_number)
        
        # Initialize Vertex AI model with system instruction
        self.model = ChatVertexAI(
            model_name="gemini-1.5-flash",
            project=project_id,
            location=location,
            temperature=0.1,
            max_output_tokens=2048,
            system_instruction=get_fi_mcp_system_prompt()
        )
        
        # Create MCP tools
        self.tools = create_mcp_tools(self.mcp_client)
        
        # Create the agent
        self.agent = self._create_agent()
    
    def _create_agent(self):
        """Create the LangGraph ReAct agent."""
        
        # Create the ReAct agent with tools (system instruction is in the model)
        agent = create_react_agent(
            model=self.model,
            tools=self.tools
        )
        
        return agent
    
    def query(self, user_input: str) -> Dict[str, Any]:
        """
        Process a user query and return the agent's response.
        
        Args:
            user_input: The user's question or request
            
        Returns:
            Dict containing the response and metadata
        """
        try:
            # Enhance user input with format reminder for structured responses
            enhanced_input = f"""Please provide a structured financial analysis with:
1. **Executive Summary** (2-3 sentences)
2. **Detailed Analysis** (with specific numbers and breakdown)
3. **Risk Assessment** (identify concerns or positive indicators)
4. **Recommendations** (actionable advice)
5. **Next Steps** (follow-up actions)
6. **Educational Note** (brief financial concept explanation)

User Query: {user_input}"""
            
            # Create the input message
            messages = [HumanMessage(content=enhanced_input)]
            
            # Run the agent
            result = self.agent.invoke({"messages": messages})
            
            # Extract the final response
            final_message = result["messages"][-1]
            
            response = {
                "response": final_message.content,
                "status": "success",
                "tool_calls": self._extract_tool_calls(result["messages"]),
                "session_id": self.mcp_client.session_id
            }
            
            return response
            
        except Exception as e:
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "status": "error",
                "error": str(e),
                "session_id": self.mcp_client.session_id
            }
    
    def _extract_tool_calls(self, messages: List) -> List[Dict[str, Any]]:
        """Extract information about tool calls from the message history."""
        tool_calls = []
        
        for message in messages:
            if hasattr(message, 'tool_calls') and message.tool_calls:
                for tool_call in message.tool_calls:
                    tool_calls.append({
                        "tool": tool_call.get("name", "unknown"),
                        "args": tool_call.get("args", {}),
                    })
        
        return tool_calls
    
    def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools and their descriptions."""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
    
    def health_check(self) -> Dict[str, Any]:
        """Check if the agent and MCP server are healthy."""
        try:
            # Test MCP server connection
            tools_result = self.mcp_client.list_tools()
            
            return {
                "status": "healthy",
                "mcp_server": "connected",
                "tools_available": len(self.tools),
                "session_id": self.mcp_client.session_id
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "mcp_server": "disconnected"
            }
