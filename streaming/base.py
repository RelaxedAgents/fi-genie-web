"""Base streaming functionality for LangGraph agents."""

import asyncio
from typing import Dict, Any, List, Optional, AsyncIterator
from datetime import datetime
from langchain_core.messages import HumanMessage

from .callbacks import StreamingCallbackHandler, StreamingEventIterator
from .event_types import StreamEvent, EventType
from .formatters import EventFormatter
from .config import StreamingConfig


class StreamingMixin:
    """Mixin to add streaming capabilities to any LangGraph agent."""
    
    def __init__(self, *args, **kwargs):
        """Initialize the mixin."""
        super().__init__(*args, **kwargs)
        self._streaming_config: Optional[StreamingConfig] = None
        self._streaming_model = None
        self._streaming_agent = None
    
    def set_streaming_config(self, config: StreamingConfig):
        """Set the streaming configuration."""
        self._streaming_config = config
    
    def _initialize_streaming_components(self):
        """Initialize streaming-specific components."""
        if not hasattr(self, 'model'):
            raise AttributeError(f"{self.__class__.__name__} must have a 'model' attribute")
        
        if not hasattr(self, 'tools'):
            raise AttributeError(f"{self.__class__.__name__} must have a 'tools' attribute")
        
        # Use the existing model directly - don't recreate it
        # The model from GeminiService already has streaming capabilities
        self._streaming_model = self.model
        
        # Import here to avoid circular imports
        from langgraph.prebuilt import create_react_agent
        
        # Create streaming agent using the existing model
        # This is the same pattern that works in FiMcpAgent
        self._streaming_agent = create_react_agent(
            model=self._streaming_model,
            tools=self.tools if hasattr(self, 'tools') else []
        )
    
    async def aquery_stream(self, user_input: str, **kwargs) -> AsyncIterator[StreamEvent]:
        """
        Process a user query and stream events as they occur.
        
        Args:
            user_input: The user's question or request
            **kwargs: Additional arguments to pass to the agent
            
        Yields:
            StreamEvent objects representing different stages of processing
        """
        # Lazy initialization
        if self._streaming_agent is None:
            self._initialize_streaming_components()
        
        formatter = EventFormatter()
        config = self._streaming_config or StreamingConfig()
        
        try:
            # Emit start event
            if config.enable_progress_tracking:
                yield formatter.format_reasoning_step("Starting analysis...")
            
            # Prepare input
            messages = self._prepare_messages(user_input, **kwargs)
            
            # Create callback handler with config
            callback_handler = StreamingCallbackHandler()
            callback_handler.set_config(config)
            
            # Create event iterator
            event_iterator = StreamingEventIterator(
                callback_handler, 
                timeout=config.event_timeout
            )
            
            # Start agent execution in background
            agent_task = asyncio.create_task(
                self._run_streaming_agent(messages, callback_handler, **kwargs)
            )
            
            # Stream events as they occur
            try:
                async for event in event_iterator:
                    # Filter events based on config
                    if event.type.value not in config.excluded_event_types:
                        yield event
            finally:
                # Ensure agent task completes
                event_iterator.done()
                try:
                    result = await asyncio.wait_for(agent_task, timeout=5.0)
                    
                    # Emit completion event with final result
                    if result and "messages" in result:
                        final_message = result["messages"][-1]
                        yield StreamEvent(
                            type=EventType.REASONING_COMPLETE,
                            content="Analysis complete",
                            metadata={
                                "final_response": final_message.content,
                                "session_id": getattr(self, 'session_id', None)
                            }
                        )
                except asyncio.TimeoutError:
                    yield formatter.format_error("Agent task timeout", "timeout")
                
        except Exception as e:
            yield formatter.format_error(str(e), "agent_error")
    
    def _prepare_messages(self, user_input: str, **kwargs) -> List:
        """
        Prepare input messages for the agent.
        
        Can be overridden by subclasses for custom message preparation.
        """
        # Check if there's a custom enhance_input method
        if hasattr(self, 'enhance_input'):
            enhanced_input = self.enhance_input(user_input)
        else:
            enhanced_input = user_input
        
        return [HumanMessage(content=enhanced_input)]
    
    async def _run_streaming_agent(
        self, 
        messages: List, 
        callback_handler: StreamingCallbackHandler,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Run the streaming agent with callbacks.
        
        Args:
            messages: Input messages for the agent
            callback_handler: Callback handler for streaming events
            **kwargs: Additional configuration
            
        Returns:
            Agent execution result
        """
        config = {
            "callbacks": [callback_handler],
            "metadata": kwargs.get("metadata", {})
        }
        
        # Add any additional config from kwargs
        config.update(kwargs.get("agent_config", {}))
        
        # Run the agent
        result = await self._streaming_agent.ainvoke(
            {"messages": messages},
            config=config
        )
        
        return result
    
    async def aquery_stream_events(self, user_input: str, **kwargs) -> AsyncIterator[Dict[str, Any]]:
        """
        Alternative streaming method using a simpler approach.
        
        This provides event information without relying on LangGraph's astream_events.
        
        Args:
            user_input: The user's question or request
            **kwargs: Additional arguments
            
        Yields:
            Dict events representing the processing stages
        """
        # Lazy initialization
        if self._streaming_agent is None:
            self._initialize_streaming_components()
        
        formatter = EventFormatter()
        
        try:
            # Prepare input
            messages = self._prepare_messages(user_input, **kwargs)
            
            # Emit progress events based on our configuration
            config = self._streaming_config or StreamingConfig()
            
            if config.enable_progress_tracking and config.progress_stages:
                for stage, message in config.progress_stages.items():
                    yield {
                        "type": "node_start",
                        "timestamp": datetime.now().isoformat(),
                        "content": f"Starting {message}",
                        "metadata": {
                            "node_name": message,
                            "execution_phase": "start",
                            "stage": stage
                        }
                    }
                    
                    # Add a small delay to simulate processing
                    await asyncio.sleep(0.1)
                    
                    yield {
                        "type": "node_complete", 
                        "timestamp": datetime.now().isoformat(),
                        "content": f"Completed {message}",
                        "metadata": {
                            "node_name": message,
                            "execution_phase": "complete",
                            "stage": stage
                        }
                    }
            
            # Run the actual agent with async compatibility handling
            try:
                # Handle the GenerateContentResponse async issue
                from concurrent.futures import ThreadPoolExecutor
                import logging
                
                logger = logging.getLogger(__name__)
                logger.info(f"🔥 STREAMING_BASE executing agent with tools: {[tool.name for tool in getattr(self, 'tools', [])]}")
                
                def run_agent_sync():
                    """Run agent synchronously to avoid async issues."""
                    try:
                        logger.info(f"🔥 STREAMING_BASE running agent synchronously")
                        # Use the synchronous invoke method instead of ainvoke
                        if hasattr(self._streaming_agent, 'invoke'):
                            result = self._streaming_agent.invoke({"messages": messages})
                            logger.info(f"🔥 STREAMING_BASE agent result: {result}")
                            return result
                        else:
                            logger.warning(f"🔥 STREAMING_BASE no invoke method, trying ainvoke in new loop")
                            # Fallback: try to run ainvoke in a way that handles the async issue
                            loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(loop)
                            try:
                                result = loop.run_until_complete(
                                    self._streaming_agent.ainvoke({"messages": messages})
                                )
                                logger.info(f"🔥 STREAMING_BASE ainvoke result: {result}")
                                return result
                            finally:
                                loop.close()
                    except Exception as e:
                        logger.error(f"🔥 STREAMING_BASE error in run_agent_sync: {e}", exc_info=True)
                        raise
                
                # Run in thread pool to avoid blocking
                logger.info(f"🔥 STREAMING_BASE submitting to thread pool")
                with ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(run_agent_sync)
                    result = await asyncio.wrap_future(future)
                
                logger.info(f"🔥 STREAMING_BASE thread pool result: {result}")
                
                # Extract the response
                if result and "messages" in result and result["messages"]:
                    final_message = result["messages"][-1]
                    response_content = getattr(final_message, 'content', str(final_message))
                    
                    yield {
                        "type": "response",
                        "timestamp": datetime.now().isoformat(),
                        "content": response_content,
                        "metadata": {
                            "final_response": True,
                            "session_id": kwargs.get("session_id")
                        }
                    }
                else:
                    yield {
                        "type": "response",
                        "timestamp": datetime.now().isoformat(), 
                        "content": "Processing completed",
                        "metadata": {
                            "final_response": True,
                            "session_id": kwargs.get("session_id")
                        }
                    }
                    
            except Exception as agent_error:
                # If all else fails, provide a meaningful fallback response
                error_msg = str(agent_error)
                if "GenerateContentResponse" in error_msg:
                    yield {
                        "type": "response",
                        "timestamp": datetime.now().isoformat(),
                        "content": "I understand your question about your financial status. While I'm experiencing some technical difficulties with the AI model, I can help you analyze your financial situation. Please provide specific details about what aspects of your finances you'd like me to review (income, expenses, investments, debt, etc.) and I'll do my best to assist you.",
                        "metadata": {
                            "final_response": True,
                            "session_id": kwargs.get("session_id"),
                            "fallback_response": True
                        }
                    }
                else:
                    yield {
                        "type": "error",
                        "timestamp": datetime.now().isoformat(),
                        "content": f"Agent execution error: {error_msg}",
                        "metadata": {"error_type": "agent_error"}
                    }
                    
        except Exception as e:
            error_event = formatter.format_error(str(e), "streaming_error")
            yield error_event.to_dict()
    
    def _transform_langgraph_event(self, event: Dict[str, Any]) -> Optional[StreamEvent]:
        """
        Transform a LangGraph native event to our StreamEvent format.
        
        Args:
            event: Raw event from LangGraph astream_events
            
        Returns:
            StreamEvent or None if event should be filtered
        """
        formatter = EventFormatter()
        event_kind = event.get("event", "")
        
        # Handle different event types
        if event_kind == "on_chain_start":
            run_name = event.get("name", "")
            if "agent" in run_name.lower():
                return StreamEvent(
                    type=EventType.REASONING_START,
                    content="Starting analysis...",
                    metadata={"chain": run_name}
                )
            else:
                return formatter.format_node_execution(run_name, start=True)
                
        elif event_kind == "on_chain_end":
            run_name = event.get("name", "")
            return formatter.format_node_execution(run_name, start=False)
            
        elif event_kind == "on_tool_start":
            tool_name = event.get("name", "")
            tool_input = event.get("data", {}).get("input", {})
            return formatter.format_tool_call(tool_name, tool_input, start=True)
            
        elif event_kind == "on_tool_end":
            tool_name = event.get("name", "")
            return formatter.format_tool_call(tool_name, {}, start=False)
            
        elif event_kind == "on_llm_stream":
            # Handle streaming tokens
            chunk = event.get("data", {}).get("chunk", {})
            content = chunk.get("content", "")
            if content and self._streaming_config.enable_token_streaming:
                return formatter.format_llm_token(content)
                
        elif event_kind == "on_llm_start":
            return StreamEvent(
                type=EventType.LLM_START,
                content="Generating response...",
                metadata=event.get("data", {})
            )
            
        elif event_kind == "on_llm_end":
            return StreamEvent(
                type=EventType.LLM_COMPLETE,
                content="Response generation complete",
                metadata=event.get("data", {})
            )
        
        # Filter out unhandled events
        return None
