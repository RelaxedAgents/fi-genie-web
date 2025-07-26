"""FinanceGenie Agent - Advanced financial intelligence agent."""

from typing import Dict, List, Any, Optional, AsyncIterator
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
from streaming.thinking_parser import ThinkingStreamParser
from streaming.intelligent_events import IntelligentEventInterpreter

# Create module-level logger
base_logger = logging.getLogger(__name__)


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
        
        # Create unique logger for this instance to avoid triple logging
        import uuid
        self.instance_id = str(uuid.uuid4())[:8]
        self.logger = logging.getLogger(f"{__name__}.{phone_number}.{self.instance_id}")
        
        # Initialize services
        self.gemini_service = GeminiService(project_id=project_id, location=location)
        self.mcp_client = MCPClient(base_url=mcp_server_url, phone_number=phone_number)
        self.perplexity_service = perplexity_service
        
        # Initialize tools with enhanced logging
        self._initialize_tools()
        
        # Initialize the agent
        self.agent = self._create_agent()
        
        self.logger.info(f"FinanceGenie initialized for phone: {phone_number} with {len(self.tools)} tools (instance: {self.instance_id})")
    
    def _initialize_tools(self):
        """Initialize and organize tools with enhanced logging."""
        # Create financial data tools
        self.financial_data_tools = create_mcp_tools(self.mcp_client)
        self.logger.info(f"Initialized {len(self.financial_data_tools)} financial data tools")
        
        # Create market research tools if service is available
        self.market_research_tools = []
        if self.perplexity_service:
            self.market_research_tools = create_market_research_tools(self.perplexity_service)
            self.logger.info(f"Added {len(self.market_research_tools)} market research tools")
        
        # Combine all tools
        self.tools = self.financial_data_tools + self.market_research_tools
        
        # Log available tools for debugging
        tool_names = [tool.name for tool in self.tools]
        self.logger.info(f"Available tools: {tool_names}")
    
    def _create_agent(self) -> CompiledStateGraph:
        """Create the LangGraph agent with enhanced system prompt."""
        from langgraph.prebuilt import create_react_agent
        
        # Use the unified system prompt
        system_prompt = get_finance_genie_system_prompt()
        
        # Log the prompt length for debugging
        self.logger.debug(f"System prompt length: {len(system_prompt)}")
        
        # Log full prompt in debug mode
        if os.getenv("DEBUG_MODE", "false").lower() == "true":
            self.logger.debug(f"Full system prompt:\n{system_prompt}")
        
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
    
    def _extract_string_content(self, obj) -> str:
        """Extract actual text content from any object type."""
        if obj is None:
            return ""
        elif hasattr(obj, 'content'):
            # Extract the content attribute first (BEFORE string check)
            content = obj.content
            # Then recursively process it (in case content is also an object)
            return self._extract_string_content(content)
        elif isinstance(obj, str):
            return obj
        else:
            # Only stringify as last resort (for primitive types)
            return str(obj)
    
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
            self.logger.error(f"Health check failed: {e}")
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
            self.logger.info(f"Processing query: {query[:50]}...")
            
            # Prepare messages
            messages = [HumanMessage(content=query)]
            
            # Invoke the agent
            start_time = datetime.now()
            self.logger.info(f"Invoking agent with query: {query}")
            result = await self.agent.ainvoke({
                "messages": messages
            })
            end_time = datetime.now()
            
            # Calculate processing time
            processing_time = (end_time - start_time).total_seconds()
            self.logger.info(f"Query processed in {processing_time:.2f} seconds")
            
            # Extract the response
            response = result["messages"][-1].content if result.get("messages") else "No response generated"
            self.logger.info(f"Generated response (preview): {response[:100]}...")
            
            # Log tool usage if available
            if "intermediate_steps" in result:
                tool_usage = []
                for step in result["intermediate_steps"]:
                    if hasattr(step, "action") and hasattr(step.action, "tool"):
                        tool_usage.append(step.action.tool)
                if tool_usage:
                    self.logger.info(f"Tools used: {tool_usage}")
            
            return {
                "response": response,
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
            }
            
        except Exception as e:
            self.logger.error(f"Error processing query: {e}")
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
            self.logger.info(f"Calling tool {tool_name} with arguments: {arguments}")
            
            # Execute the tool
            start_time = datetime.now()
            result = await tool.ainvoke(arguments)
            end_time = datetime.now()
            
            # Calculate processing time
            processing_time = (end_time - start_time).total_seconds()
            self.logger.info(f"Tool {tool_name} executed in {processing_time:.2f} seconds")
            
            return {
                "result": result,
                "status": "success",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat(),
                "processing_time_seconds": processing_time
            }
            
        except Exception as e:
            self.logger.error(f"Error calling tool {tool_name}: {e}")
            return {
                "error": str(e),
                "status": "error",
                "tool": tool_name,
                "timestamp": datetime.now().isoformat()
            }
    
    async def stream_query_with_thinking(self, query: str) -> AsyncIterator[Dict[str, Any]]:
        """Clean, standards-based streaming implementation with comprehensive debugging."""
        
        interpreter = IntelligentEventInterpreter()
        response_buffer = ""  # Accumulate the complete response
        event_count = 0
        llm_events_seen = 0
        
        try:
            self.logger.info(f"Starting streaming query: {query[:50]}...")
            yield {"type": "stream_start", "content": "Starting your financial analysis...", "timestamp": datetime.utcnow().isoformat()}
            
            # Ensure system prompt is included in the messages
            system_prompt = get_finance_genie_system_prompt()
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=query)
            ]
            
            async for event in self.agent.astream_events({"messages": messages}, version="v1"):
                event_count += 1
                event_type = event.get("event", "unknown")
                
                # Debug: Log all events to understand what's happening
                if event_count <= 10 or event_type in ["on_llm_stream", "on_llm_start", "on_llm_end"]:
                    self.logger.debug(f"Event #{event_count}: {event_type} - Data keys: {list(event.get('data', {}).keys())}")
                
                # 1. LLM Token Streaming (Primary mechanism) - Clean extraction
                if event_type == "on_llm_stream":
                    llm_events_seen += 1
                    chunk = event.get("data", {}).get("chunk", {})
                    
                    # Use the clean content extraction helper
                    content = self._extract_string_content(chunk)
                    
                    if content.strip():
                        response_buffer += content
                        self.logger.debug(f"LLM token: '{content}' (buffer length: {len(response_buffer)})")
                        yield {"type": "agent_response", "content": content, "timestamp": datetime.utcnow().isoformat()}
                    else:
                        self.logger.debug(f"LLM event with no valid content: chunk={type(chunk)}")
                
                # Alternative LLM event types (in case Gemini uses different event names)
                elif event_type in ["on_chat_model_stream", "on_llm_new_token"]:
                    llm_events_seen += 1
                    data = event.get("data", {})
                    raw_content = data.get("chunk", data.get("token", ""))
                    
                    # Use the clean content extraction helper
                    content = self._extract_string_content(raw_content)
                    
                    if content.strip():
                        response_buffer += content
                        self.logger.debug(f"Alternative LLM token: '{content}'")
                        yield {"type": "agent_response", "content": content, "timestamp": datetime.utcnow().isoformat()}
                
                # 2. Tool Progress Updates (Secondary - for UX)
                elif event_type == "on_tool_start":
                    tool_name = event.get("name", "unknown")
                    message = interpreter.get_tool_start_message(tool_name)
                    self.logger.info(f"Tool started: {tool_name}")
                    yield {"type": "progress_update", "content": message, "timestamp": datetime.utcnow().isoformat()}
                
                elif event_type == "on_tool_end":
                    tool_name = event.get("name", "unknown")
                    message = interpreter.get_tool_complete_message(tool_name)
                    self.logger.info(f"Tool completed: {tool_name}")
                    yield {"type": "progress_update", "content": message, "timestamp": datetime.utcnow().isoformat()}
                
                # 3. Fallback: Try to extract final response from chain end if no LLM streaming
                elif event_type == "on_chain_end" and not response_buffer.strip():
                    outputs = event.get("data", {}).get("output", {})
                    if isinstance(outputs, dict) and "messages" in outputs and outputs["messages"]:
                        final_message = outputs["messages"][-1]
                        if hasattr(final_message, 'content') and final_message.content.strip():
                            response_buffer = final_message.content
                            self.logger.info(f"Fallback: Extracted response from chain_end ({len(response_buffer)} chars)")
            
            self.logger.info(f"Processed {event_count} events, {llm_events_seen} LLM events, buffer length: {len(response_buffer)}")
            
            # 4. Final Response (Clean LLM response only, no duplication)
            if response_buffer.strip():
                # Clean the response buffer - remove any query duplication
                clean_response = response_buffer.strip()
                
                # Remove query duplication if it exists at the beginning
                if clean_response.startswith(query):
                    clean_response = clean_response[len(query):].strip()
                
                self.logger.info(f"Final analysis generated with {len(clean_response)} characters")
                yield {"type": "final_analysis", "content": clean_response, "timestamp": datetime.utcnow().isoformat()}
            else:
                self.logger.warning("No response content accumulated - this indicates a streaming issue")
                # Provide a more helpful error message
                yield {"type": "final_analysis", "content": f"Streaming completed but no LLM response was captured. Processed {event_count} events with {llm_events_seen} LLM events.", "timestamp": datetime.utcnow().isoformat()}
            
            self.logger.info("Streaming query completed successfully")
            yield {"type": "stream_complete", "content": "Analysis complete", "timestamp": datetime.utcnow().isoformat()}
            
        except Exception as e:
            self.logger.error(f"Streaming error: {e}", exc_info=True)
            yield {"type": "error", "content": f"Error: {str(e)}", "timestamp": datetime.utcnow().isoformat()}
