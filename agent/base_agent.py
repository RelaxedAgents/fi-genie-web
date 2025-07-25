"""Base streamable agent with memory integration."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, AsyncIterator
from datetime import datetime
import logging
import json

from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, END

from streaming import make_streamable, StreamingConfig
from memory.memory_manager import MemoryManager
from memory.memory_tools import create_memory_tools

logger = logging.getLogger(__name__)


class BaseStreamableAgent(ABC):
    """
    Base class for all agents with:
    - Streaming capabilities via decorator
    - Memory integration
    - Tool management
    - Error handling
    """
    
    def __init__(
        self,
        name: str,
        memory_manager: MemoryManager,
        gemini_service: Any,  # Can be ChatVertexAI or ChatGoogleGenerativeAI
        tools: List[Any] = None,
        streaming_config: Optional[StreamingConfig] = None
    ):
        """
        Initialize base agent.
        
        Args:
            name: Agent name
            memory_manager: Memory manager instance
            gemini_service: Gemini LLM service
            tools: List of additional tools
            streaming_config: Optional streaming configuration
        """
        self.name = name
        self.memory_manager = memory_manager
        self.gemini_service = gemini_service
        self.logger = logging.getLogger(f"{__name__}.{name}")
        
        # Add memory tools to agent's toolset
        memory_tools = create_memory_tools(memory_manager, agent_id=name)
        self.tools = (tools or []) + memory_tools
        
        # Set up the agent with system prompt
        self.gemini_service = self.gemini_service.bind(
            system=self.get_system_prompt()
        )
        
        # Create ReAct agent
        self.agent = create_react_agent(
            model=self.gemini_service,
            tools=self.tools
        )
        
        # Store streaming config for later application
        self._streaming_config = streaming_config or self.get_default_streaming_config()
        
        # Initialize streaming components (will be set by decorator)
        self._streaming_model = None
        self._streaming_agent = None
        
        self.logger.info(f"Initialized {name} agent with {len(self.tools)} tools")
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Each agent must define its system prompt."""
        pass
    
    @abstractmethod
    def get_progress_stages(self) -> Dict[int, str]:
        """Define progress stages for streaming."""
        pass
    
    def get_default_streaming_config(self) -> StreamingConfig:
        """Get default streaming configuration."""
        return StreamingConfig(
            progress_stages=self.get_progress_stages(),
            enable_token_streaming=True,
            enable_progress_tracking=True,
            enable_tool_tracking=True
        )
    
    async def process(
        self, 
        query: str, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main processing method - to be overridden by subclasses.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context from orchestrator
            
        Returns:
            Dict containing response and metadata
        """
        try:
            self.logger.info(f"[{self.name}] Processing query for user {user_id}: {query[:100]}...")
            
            # Load user context from memory
            self.logger.debug(f"[{self.name}] Loading user context from memory")
            user_context = await self.memory_manager.get_user_context(
                user_id=user_id,
                agent_id=self.name
            )
            
            # Merge contexts
            full_context = {
                "user_context": user_context.dict(),
                "orchestrator_context": context or {}
            }
            self.logger.debug(f"[{self.name}] Context prepared with {len(full_context)} keys")
            
            # Format input for agent
            messages = self._prepare_messages(query, full_context)
            self.logger.debug(f"[{self.name}] Prepared {len(messages)} messages for LLM")
            
            # Check if agent is properly initialized
            if not hasattr(self, 'agent') or self.agent is None:
                self.logger.error(f"[{self.name}] Agent not properly initialized")
                raise ValueError(f"Agent {self.name} not properly initialized")
            
            # Run agent
            self.logger.info(f"[{self.name}] Invoking LLM with query...")
            result = await self.agent.ainvoke({
                "messages": messages
            })
            
            # Log the raw result
            self.logger.debug(f"[{self.name}] LLM raw result type: {type(result)}")
            self.logger.debug(f"[{self.name}] LLM raw result keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
            
            # Handle None result
            if result is None:
                self.logger.error(f"[{self.name}] LLM returned None result")
                raise ValueError("LLM returned None")
            
            # Extract response
            if isinstance(result, dict) and "messages" in result:
                messages_result = result.get("messages", [])
                if messages_result and len(messages_result) > 0:
                    response = messages_result[-1].content
                    self.logger.info(f"[{self.name}] Successfully extracted response: {response[:100]}...")
                else:
                    self.logger.error(f"[{self.name}] No messages in LLM result")
                    response = "No response generated"
            else:
                self.logger.warning(f"[{self.name}] Unexpected result format, converting to string")
                response = str(result)
            
            # Log execution
            self.log_execution(query, {"status": "success", "response": response})
            
            return {
                "response": response,
                "tools_used": self._extract_tools_used(result),
                "metadata": {
                    "agent": self.name,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"[{self.name}] Error processing query: {type(e).__name__}: {str(e)}", exc_info=True)
            self.log_execution(query, {"status": "error", "error": str(e)})
            
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "error": str(e),
                "metadata": {
                    "agent": self.name,
                    "timestamp": datetime.now().isoformat(),
                    "status": "error"
                }
            }
    
    async def aquery_stream(
        self,
        query: str,
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[str]:
        """
        Stream query processing with token streaming.
        This method will be enhanced by the streaming decorator.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context
            
        Yields:
            Response tokens
        """
        # This will be overridden by the streaming decorator
        result = await self.process(query, user_id, context)
        yield result.get("response", "")
    
    async def aquery_stream_events(
        self,
        query: str,
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Stream query processing with detailed events.
        This method will be enhanced by the streaming decorator.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context
            
        Yields:
            Event dictionaries
        """
        # This will be overridden by the streaming decorator
        result = await self.process(query, user_id, context)
        yield {
            "type": "response",
            "content": result.get("response", ""),
            "metadata": result.get("metadata", {})
        }
    
    def _prepare_messages(self, query: str, context: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Prepare messages for the agent.
        
        Args:
            query: User query
            context: Full context including user and orchestrator context
            
        Returns:
            List of message dictionaries
        """
        messages = []
        
        # Add context as a system message if available
        if context:
            context_str = f"Context:\n{json.dumps(context, indent=2)}"
            messages.append({
                "role": "system",
                "content": context_str
            })
        
        # Add user query
        messages.append({
            "role": "user",
            "content": query
        })
        
        return messages
    
    def _extract_tools_used(self, result: Dict[str, Any]) -> List[str]:
        """Extract list of tools used from agent result."""
        tools_used = []
        
        # Extract from messages if available
        messages = result.get("messages", [])
        for message in messages:
            if hasattr(message, "tool_calls"):
                for tool_call in message.tool_calls:
                    tools_used.append(tool_call.get("name", "unknown"))
        
        return tools_used
    
    def add_tools(self, tools: List[Any]):
        """Add additional tools to the agent."""
        self.tools.extend(tools)
        
        # Recreate agent with new tools
        self.agent = create_react_agent(
            model=self.gemini_service,
            tools=self.tools
        )
        
        self.logger.info(f"Added {len(tools)} tools to {self.name}")
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities."""
        return {
            "name": self.name,
            "description": self.get_description(),
            "tools": [
                {
                    "name": tool.name,
                    "description": tool.description
                } for tool in self.tools
            ],
            "streaming_enabled": hasattr(self, "aquery_stream"),
            "progress_stages": self.get_progress_stages()
        }
    
    def get_description(self) -> str:
        """Get agent description - to be overridden by subclasses."""
        return f"{self.name} agent"
    
    def log_execution(self, query: str, result: Dict[str, Any]):
        """Log agent execution."""
        self.logger.info(f"Executed query: {query[:50]}...")
        self.logger.info(f"Result status: {result.get('status', 'unknown')}")
    
    async def share_insight_with_agents(
        self,
        content: str,
        target_agents: List[str],
        user_id: str,
        insight_type: str = "general",
        confidence: float = 0.8
    ):
        """
        Helper method to share insights with other agents.
        
        Args:
            content: Insight content
            target_agents: List of agent names to share with
            user_id: User identifier
            insight_type: Type of insight
            confidence: Confidence level
        """
        from memory.memory_schemas import SharedInsight
        
        insight = SharedInsight(
            source_agent=self.name,
            target_agents=target_agents,
            user_id=user_id,
            insight_type=insight_type,
            content=content,
            confidence=confidence
        )
        
        await self.memory_manager.share_insight(insight)
        self.logger.info(f"Shared insight with {len(target_agents)} agents")
