"""Streaming API routes for FinanceGenie Agent."""

import json
import logging
from typing import AsyncIterator
from fastapi import APIRouter, HTTPException, Header, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.streaming_agent import StreamingFinanceGenieAgent
from agent.llm_friendly_streaming_agent import create_llm_friendly_streaming_agent
from agent.finance_genie_agent import FinanceGenieAgent
from config.settings import settings
from services.perplexity_service import PerplexityService

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/agent/stream", tags=["Streaming"])


class StreamQueryRequest(BaseModel):
    """Request model for streaming agent queries."""
    query: str


def create_streaming_agent(phone_number: str, perplexity_service=None) -> StreamingFinanceGenieAgent:
    """Create a Streaming FinanceGenie Agent instance for a specific phone number."""
    try:
        logger.info(f"Creating StreamingFinanceGenieAgent for phone: {phone_number}")
        agent = StreamingFinanceGenieAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=phone_number,
            perplexity_service=perplexity_service
        )
        return agent
    except Exception as e:
        logger.error(f"Error creating StreamingFinanceGenieAgent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating Streaming Agent: {str(e)}")


async def generate_sse_events(agent: StreamingFinanceGenieAgent, query: str) -> AsyncIterator[str]:
    """
    Generate Server-Sent Events from agent streaming.
    
    Args:
        agent: The streaming agent instance
        query: User query to process
        
    Yields:
        SSE formatted strings
    """
    try:
        # Use the callback-based streaming method
        async for event in agent.aquery_stream(query):
            # Convert event to SSE format
            yield event.to_sse_format()
            
        # Send final completion event
        yield "event: complete\ndata: {}\n\n"
        
    except Exception as e:
        # Send error event
        error_data = {
            "type": "error",
            "content": str(e),
            "metadata": {"error_type": type(e).__name__}
        }
        yield f"data: {json.dumps(error_data)}\n\n"


async def generate_friendly_sse_events(agent, query: str, gemini_service) -> AsyncIterator[str]:
    """
    Generate SSE events with LLM-friendly updates.
    
    Args:
        agent: The LLM-friendly streaming agent instance
        query: User query to process
        gemini_service: Gemini service for generating friendly updates
        
    Yields:
        SSE formatted strings
    """
    try:
        # Use the LLM-friendly streaming method
        async for event in agent.aquery_stream_friendly(query, gemini_service):
            # Convert to SSE format
            yield f"data: {json.dumps(event)}\n\n"
            
        # Send final completion event
        yield "event: complete\ndata: {}\n\n"
        
    except Exception as e:
        logger.error(f"Error in friendly streaming: {e}")
        # Send error event
        error_data = {
            "type": "error",
            "content": str(e),
            "metadata": {"error_type": type(e).__name__}
        }
        yield f"data: {json.dumps(error_data)}\n\n"


async def generate_sse_native_events(agent: StreamingFinanceGenieAgent, query: str) -> AsyncIterator[str]:
    """
    Generate Server-Sent Events using LangGraph's native streaming.
    
    Args:
        agent: The streaming agent instance
        query: User query to process
        
    Yields:
        SSE formatted strings
    """
    try:
        # Use LangGraph's native astream_events
        async for event_dict in agent.aquery_stream_events(query):
            # Format as SSE
            yield f"data: {json.dumps(event_dict)}\n\n"
            
        # Send final completion event
        yield "event: complete\ndata: {}\n\n"
        
    except Exception as e:
        # Send error event
        error_data = {
            "type": "error",
            "content": str(e),
            "metadata": {"error_type": type(e).__name__}
        }
        yield f"data: {json.dumps(error_data)}\n\n"


@router.post("/query")
async def stream_agent_query(
    request: StreamQueryRequest,
    request_obj: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """
    Stream FinanceGenie's thinking process in real-time.
    
    This endpoint streams the agent's actual reasoning process as it works
    through the user's financial query, showing structured thinking, tool usage,
    and analysis in real-time.
    
    Returns:
        StreamingResponse with SSE content type showing thinking process
    """
    try:
        # Get services from app state
        app_state = getattr(request_obj.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create FinanceGenie agent with thinking capabilities
        agent = FinanceGenieAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=x_phone_number,
            perplexity_service=perplexity_service
        )
        
        return StreamingResponse(
            generate_thinking_stream(agent, request.query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/query")
async def stream_agent_query_get(
    request_obj: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    query: str = Query(..., description="The financial query to process")
):
    """
    Stream agent responses using GET request with query parameter.
    
    Alternative endpoint for clients that prefer GET requests for SSE.
    Uses LLM-generated friendly updates with progress information.
    
    Returns:
        StreamingResponse with SSE content type
    """
    try:
        # Get services from app state
        app_state = getattr(request_obj.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        gemini_service = app_state.get("services", {}).get("gemini")
        
        # Create LLM-friendly streaming agent
        agent = create_llm_friendly_streaming_agent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=x_phone_number,
            perplexity_service=perplexity_service
        )
        
        # Return streaming response with friendly updates
        return StreamingResponse(
            generate_friendly_sse_events(agent, query, gemini_service),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/query/native")
async def stream_agent_query_native(
    request: StreamQueryRequest,
    request_obj: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """
    Stream agent responses using LangGraph's native astream_events.
    
    This provides raw LangGraph events with maximum detail.
    
    Returns:
        StreamingResponse with SSE content type
    """
    try:
        # Get Perplexity service from app state if available
        app_state = getattr(request_obj.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create streaming agent instance
        agent = create_streaming_agent(x_phone_number, perplexity_service)
        
        # Return streaming response
        return StreamingResponse(
            generate_sse_native_events(agent, request.query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query/thinking")
async def stream_finance_thinking(
    request: StreamQueryRequest,
    request_obj: Request,
    x_phone_number: str = Header(..., alias="X-Phone-Number")
):
    """
    Stream FinanceGenie's thinking process in real-time.
    
    This endpoint streams the agent's actual reasoning process as it works
    through the user's financial query, showing structured thinking, tool usage,
    and analysis in real-time.
    
    Returns:
        StreamingResponse with SSE content type showing thinking process
    """
    try:
        # Get services from app state
        app_state = getattr(request_obj.app.state, "app_state", {})
        perplexity_service = app_state.get("services", {}).get("perplexity")
        
        # Create FinanceGenie agent (same as existing)
        agent = FinanceGenieAgent(
            project_id=settings.project_id,
            location=settings.location,
            mcp_server_url=settings.mcp_server_url,
            phone_number=x_phone_number,
            perplexity_service=perplexity_service
        )
        
        return StreamingResponse(
            generate_thinking_stream(agent, request.query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def generate_thinking_stream(agent: FinanceGenieAgent, query: str) -> AsyncIterator[str]:
    """Generate SSE stream from thinking events."""
    try:
        async for event in agent.stream_query_with_thinking(query):
            yield f"data: {json.dumps(event)}\n\n"
            
            if event.get("type") == "stream_complete":
                break
                
        yield "event: complete\ndata: {}\n\n"
        
    except Exception as e:
        from datetime import datetime
        error_event = {
            "type": "error",
            "content": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        yield f"data: {json.dumps(error_event)}\n\n"
        yield "event: complete\ndata: {}\n\n"


@router.get("/test")
async def test_streaming():
    """
    Test endpoint to verify SSE streaming is working.
    
    Streams a sequence of test events.
    """
    async def generate_test_events():
        events = [
            {"type": "reasoning_start", "content": "Starting test stream..."},
            {"type": "progress", "content": "Step 1 of 5: Parsing user intent", "metadata": {"current_step": 1, "total_steps": 5, "progress_percentage": 10.0, "step_name": "Parsing user intent"}},
            {"type": "progress", "content": "Step 2 of 5: Analyzing request", "metadata": {"current_step": 2, "total_steps": 5, "progress_percentage": 20.0, "step_name": "Analyzing request"}},
            {"type": "tool_start", "content": "Calling test tool"},
            {"type": "progress", "content": "Step 3 of 5: Executing tools", "metadata": {"current_step": 3, "total_steps": 5, "progress_percentage": 30.0, "step_name": "Executing tools", "details": "Executing test_tool (1/2)"}},
            {"type": "tool_complete", "content": "Test tool completed"},
            {"type": "progress", "content": "Step 3 of 5: Executing tools", "metadata": {"current_step": 3, "total_steps": 5, "progress_percentage": 50.0, "step_name": "Executing tools", "details": "Completed 1/2 tools"}},
            {"type": "tool_start", "content": "Calling another test tool"},
            {"type": "progress", "content": "Step 3 of 5: Executing tools", "metadata": {"current_step": 3, "total_steps": 5, "progress_percentage": 50.0, "step_name": "Executing tools", "details": "Executing another_tool (2/2)"}},
            {"type": "tool_complete", "content": "Another test tool completed"},
            {"type": "progress", "content": "Step 4 of 5: Synthesizing response", "metadata": {"current_step": 4, "total_steps": 5, "progress_percentage": 80.0, "step_name": "Synthesizing response"}},
            {"type": "llm_token", "content": "This "},
            {"type": "llm_token", "content": "is "},
            {"type": "llm_token", "content": "a "},
            {"type": "llm_token", "content": "test "},
            {"type": "llm_token", "content": "stream."},
            {"type": "progress", "content": "Step 5 of 5: Finalizing output", "metadata": {"current_step": 5, "total_steps": 5, "progress_percentage": 100.0, "step_name": "Finalizing output"}},
            {"type": "reasoning_complete", "content": "Test complete"}
        ]
        
        for event in events:
            yield f"data: {json.dumps(event)}\n\n"
            # Small delay to simulate real streaming
            import asyncio
            await asyncio.sleep(0.1)
        
        yield "event: complete\ndata: {}\n\n"
    
    return StreamingResponse(
        generate_test_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
