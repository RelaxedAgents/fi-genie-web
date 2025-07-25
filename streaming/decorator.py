"""Decorator to add streaming capabilities to any LangGraph agent."""

from typing import Type, Optional, Any
from functools import wraps

from .base import StreamingMixin
from .config import StreamingConfig, DefaultStreamingConfig


def make_streamable(config: Optional[StreamingConfig] = None):
    """
    Decorator to add streaming capabilities to any LangGraph agent class.
    
    Args:
        config: Optional streaming configuration. If None, uses DefaultStreamingConfig.
        
    Returns:
        A decorator function that creates a streaming-enabled version of the agent class.
        
    Example:
        @make_streamable(StreamingConfig(
            progress_stages={
                1: "Understanding query",
                2: "Planning approach", 
                3: "Executing actions",
                4: "Compiling results"
            }
        ))
        class MyAgent:
            def __init__(self):
                self.model = ChatVertexAI()
                self.tools = [tool1, tool2]
    """
    def decorator(agent_class: Type) -> Type:
        # Create a new class that inherits from both StreamingMixin and the original agent
        class StreamableAgent(StreamingMixin, agent_class):
            """Streaming-enabled version of the agent."""
            
            def __init__(self, *args, **kwargs):
                # Initialize both parent classes
                super().__init__(*args, **kwargs)
                
                # Set the streaming config
                self.set_streaming_config(config or DefaultStreamingConfig())
                
                # Preserve the original class name and module
                self.__class__.__name__ = agent_class.__name__
                self.__class__.__module__ = agent_class.__module__
                
            def __repr__(self):
                return f"<Streamable{agent_class.__name__}>"
                
            @property
            def is_streamable(self) -> bool:
                """Check if this agent has streaming capabilities."""
                return True
                
            def get_streaming_config(self) -> StreamingConfig:
                """Get the current streaming configuration."""
                return self._streaming_config
                
            def update_streaming_config(self, **kwargs):
                """Update specific streaming configuration options."""
                if self._streaming_config:
                    for key, value in kwargs.items():
                        if hasattr(self._streaming_config, key):
                            setattr(self._streaming_config, key, value)
                            
            # Preserve original methods while adding streaming versions
            def query(self, *args, **kwargs):
                """Non-streaming query method (if exists in original)."""
                if hasattr(agent_class, 'query'):
                    return agent_class.query(self, *args, **kwargs)
                else:
                    raise NotImplementedError(
                        f"{agent_class.__name__} does not have a 'query' method"
                    )
        
        # Copy over class attributes
        for attr_name in dir(agent_class):
            if not attr_name.startswith('_') and attr_name not in dir(StreamableAgent):
                setattr(StreamableAgent, attr_name, getattr(agent_class, attr_name))
        
        # Copy docstring and other metadata
        StreamableAgent.__doc__ = agent_class.__doc__
        StreamableAgent.__qualname__ = agent_class.__qualname__
        
        return StreamableAgent
    
    return decorator


# Convenience function for making an existing instance streamable
def add_streaming_to_instance(agent_instance: Any, config: Optional[StreamingConfig] = None) -> Any:
    """
    Add streaming capabilities to an existing agent instance.
    
    Args:
        agent_instance: An instance of an agent class
        config: Optional streaming configuration
        
    Returns:
        The same instance with streaming methods added
        
    Note: This modifies the instance in place by adding methods from StreamingMixin.
    """
    # Get the agent's class
    agent_class = agent_instance.__class__
    
    # Create a streamable version of the class
    @make_streamable(config)
    class TempStreamableAgent(agent_class):
        pass
    
    # Copy streaming methods to the instance
    for method_name in ['aquery_stream', 'aquery_stream_events', 'set_streaming_config', 
                       '_initialize_streaming_components', '_prepare_messages', 
                       '_run_streaming_agent', '_transform_langgraph_event']:
        if hasattr(TempStreamableAgent, method_name):
            method = getattr(TempStreamableAgent, method_name)
            setattr(agent_instance, method_name, method.__get__(agent_instance, agent_class))
    
    # Initialize streaming attributes
    agent_instance._streaming_config = config or DefaultStreamingConfig()
    agent_instance._streaming_model = None
    agent_instance._streaming_agent = None
    
    return agent_instance


# Pre-configured decorators for common use cases
streamable = make_streamable(DefaultStreamingConfig())

streamable_financial = make_streamable(StreamingConfig(
    progress_stages={
        1: "Parsing financial query",
        2: "Analyzing request context",
        3: "Fetching financial data",
        4: "Processing transactions",
        5: "Calculating insights",
        6: "Generating financial report",
        7: "Finalizing recommendations"
    }
))

streamable_conversational = make_streamable(StreamingConfig(
    progress_stages={
        1: "Understanding context",
        2: "Processing conversation",
        3: "Generating response"
    },
    enable_tool_tracking=False  # Conversational agents might not use tools
))

streamable_research = make_streamable(StreamingConfig(
    progress_stages={
        1: "Analyzing research query",
        2: "Searching sources",
        3: "Gathering information",
        4: "Evaluating findings", 
        5: "Synthesizing results",
        6: "Preparing report"
    }
))
