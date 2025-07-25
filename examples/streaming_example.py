"""Example demonstrating how to use the streaming decorator with different agents."""

from langchain_google_vertexai import ChatVertexAI
from streaming import make_streamable, streamable, StreamingConfig


# Example 1: Basic agent with default streaming
@streamable
class BasicAgent:
    """A simple agent that becomes streamable with the decorator."""
    
    def __init__(self):
        self.model = ChatVertexAI(model_name="gemini-1.5-flash")
        self.tools = []  # Add your tools here
        
    def query(self, user_input: str):
        """Non-streaming query method."""
        # Your existing logic here
        return {"response": "This is a non-streaming response"}


# Example 2: Custom progress stages
@make_streamable(StreamingConfig(
    progress_stages={
        1: "Reading documents",
        2: "Analyzing content", 
        3: "Generating summary",
        4: "Finalizing output"
    }
))
class DocumentAnalyzer:
    """Document analysis agent with custom progress stages."""
    
    def __init__(self):
        self.model = ChatVertexAI(model_name="gemini-1.5-flash")
        self.tools = []


# Example 3: Conversational agent with minimal progress
from streaming import streamable_conversational

@streamable_conversational
class ChatBot:
    """Conversational agent with simplified progress tracking."""
    
    def __init__(self):
        self.model = ChatVertexAI(model_name="gemini-1.5-flash")
        self.tools = []  # Conversational agents might not need tools


# Example 4: Research agent with detailed progress
from streaming import streamable_research

@streamable_research  
class ResearchAgent:
    """Research agent with detailed progress stages."""
    
    def __init__(self):
        self.model = ChatVertexAI(model_name="gemini-1.5-flash")
        self.tools = []  # Add research tools


# Example 5: Converting existing instances
def example_instance_conversion():
    """Example of adding streaming to an existing agent instance."""
    from agent.fi_mcp_agent import FiMcpAgent
    from streaming import add_streaming_to_instance, FinancialAgentStreamingConfig
    
    # Create a regular agent
    regular_agent = FiMcpAgent(
        project_id="my-project",
        location="us-central1",
        mcp_server_url="http://localhost:8000",
        phone_number="1234567890"
    )
    
    # Add streaming capabilities
    streaming_agent = add_streaming_to_instance(
        regular_agent, 
        FinancialAgentStreamingConfig()
    )
    
    # Now the agent has streaming methods!
    # async for event in streaming_agent.aquery_stream("What is my net worth?"):
    #     print(event)
    
    return streaming_agent


# Example 6: Using streaming in an API endpoint
async def streaming_endpoint_example():
    """Example of using a streaming agent in an API endpoint."""
    import json
    from fastapi.responses import StreamingResponse
    
    # Create streaming agent
    agent = BasicAgent()  # This is now streamable thanks to @streamable decorator
    
    async def generate_events(query: str):
        """Generate SSE events from agent streaming."""
        async for event in agent.aquery_stream(query):
            # Convert to SSE format
            yield event.to_sse_format()
            
        # Send completion event
        yield "event: complete\ndata: {}\n\n"
    
    # Return streaming response
    return StreamingResponse(
        generate_events("Hello, how can you help me?"),
        media_type="text/event-stream"
    )


# Example 7: Customizing streaming behavior
@make_streamable(StreamingConfig(
    enable_token_streaming=False,  # Don't stream individual tokens
    enable_progress_tracking=True,  # Keep progress updates
    enable_tool_tracking=True,      # Track tool usage
    progress_mode="fixed",          # Use fixed progress stages
    buffer_size=100,                # Larger buffer for events
    event_timeout=60.0              # Longer timeout
))
class CustomConfigAgent:
    """Agent with customized streaming behavior."""
    
    def __init__(self):
        self.model = ChatVertexAI(model_name="gemini-1.5-flash")
        self.tools = []
        
    def enhance_input(self, user_input: str) -> str:
        """Custom input enhancement (automatically detected by StreamingMixin)."""
        return f"Please analyze this request carefully: {user_input}"


if __name__ == "__main__":
    # Example usage
    import asyncio
    
    async def test_streaming():
        # Create a streaming agent
        agent = BasicAgent()
        
        # Stream events
        async for event in agent.aquery_stream("Test query"):
            print(f"[{event.type.value}] {event.content}")
    
    # Run the test
    asyncio.run(test_streaming())
