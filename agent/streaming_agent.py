"""Streaming-enabled FinanceGenie Agent using decorator approach."""

from streaming import streamable_financial
from .finance_genie_agent import FinanceGenieAgent
from prompts.streamable_fi_mcp_prompts import ENHANCED_INPUT_FORMAT


# Create a streaming-enabled version of FinanceGenieAgent using the decorator
@streamable_financial
class StreamingFinanceGenieAgent(FinanceGenieAgent):
    """FinanceGenie Agent with streaming capabilities using decorator approach."""
    
    def enhance_input(self, user_input: str) -> str:
        """
        Enhance the user input with structured format request.
        
        This method is automatically detected by the StreamingMixin.
        """
        return ENHANCED_INPUT_FORMAT.format(user_input=user_input)
    
    @property
    def model(self):
        """
        Expose the model attribute required by StreamingMixin.
        
        The StreamingMixin expects a 'model' attribute, but FiMcpAgent
        uses the LangGraph agent directly. This property bridges that gap.
        """
        # Get the model from the gemini_service
        return self.gemini_service.get_model()


# Alternative: Use the decorator with custom configuration
from streaming import make_streamable, StreamingConfig

@make_streamable(StreamingConfig(
    progress_stages={
        1: "Understanding financial query",
        2: "Analyzing financial context",
        3: "Fetching account data",
        4: "Processing transactions",
        5: "Calculating metrics",
        6: "Generating insights",
        7: "Preparing recommendations",
        8: "Finalizing report"
    },
    progress_mode="adaptive",
    enable_token_streaming=True,
    enable_progress_tracking=True,
    enable_tool_tracking=True
))
class CustomStreamingFinanceGenieAgent(FinanceGenieAgent):
    """FinanceGenie agent with custom streaming configuration."""
    pass

# Example: Converting an existing agent instance to be streamable
def make_agent_streamable(agent_instance):
    """
    Example function showing how to add streaming to an existing agent instance.
    
    Args:
        agent_instance: An instance of FinanceGenieAgent or similar
        
    Returns:
        The same instance with streaming capabilities added
    """
    from streaming import add_streaming_to_instance, FinancialAgentStreamingConfig
    
    # Add streaming capabilities to the instance
    return add_streaming_to_instance(agent_instance, FinancialAgentStreamingConfig())
