"""Streaming router for Financial AI Assistant."""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/query")
async def stream_query(request: Request, query_request: Dict[str, Any]):
    """
    Stream a query response with progress updates.
    
    Request body:
    {
        "query": "Your financial question",
        "user_id": "user123",
        "session_id": "session456" (optional)
    }
    """
    query = query_request.get("query")
    user_id = query_request.get("user_id", "default_user")
    session_id = query_request.get("session_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    async def generate():
        """Generate SSE events."""
        try:
            # Get orchestrator from app state
            app_state = request.app.state.app_state
            orchestrator = app_state.get("orchestrator")
            
            if not orchestrator:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Orchestrator not initialized'})}\n\n"
                return
            
            # Send initial acknowledgment
            yield f"data: {json.dumps({'type': 'start', 'message': 'Processing your query...'})}\n\n"
            
            # Stream events from orchestrator
            async for event in orchestrator.aquery_stream_events(
                query,
                user_id=user_id,
                session_id=session_id
            ):
                yield f"data: {json.dumps(event)}\n\n"
            
            # Send completion event
            yield f"data: {json.dumps({'type': 'complete', 'status': 'success'})}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable Nginx buffering
        }
    )


@router.post("/agent/{agent_name}")
async def stream_agent_query(
    request: Request,
    agent_name: str,
    query_request: Dict[str, Any]
):
    """
    Stream a query to a specific agent.
    
    Path parameters:
    - agent_name: Name of the agent (financial_data, market_research, advisory)
    
    Request body:
    {
        "query": "Your question",
        "user_id": "user123"
    }
    """
    query = query_request.get("query")
    user_id = query_request.get("user_id", "default_user")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    async def generate():
        """Generate SSE events from specific agent."""
        try:
            app_state = request.app.state.app_state
            agents = app_state.get("agents", {})
            
            if agent_name not in agents:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Agent {agent_name} not found'})}\n\n"
                return
            
            agent = agents[agent_name]
            
            # Send initial acknowledgment
            yield f"data: {json.dumps({'type': 'start', 'agent': agent_name, 'message': f'Processing with {agent_name} agent...'})}\n\n"
            
            # Stream events from agent
            async for event in agent.aquery_stream_events(
                user_input=query,
                user_id=user_id
            ):
                yield f"data: {json.dumps(event)}\n\n"
            
            # Send completion event
            yield f"data: {json.dumps({'type': 'complete', 'agent': agent_name, 'status': 'success'})}\n\n"
            
        except Exception as e:
            logger.error(f"Agent streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'agent': agent_name, 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.get("/test")
async def test_streaming():
    """Test endpoint to verify SSE streaming is working."""
    
    async def generate_test_events():
        """Generate test SSE events."""
        events = [
            {"type": "start", "message": "Starting test stream..."},
            {"type": "progress", "stage": 1, "message": "Understanding your question"},
            {"type": "progress", "stage": 2, "message": "Analyzing requirements"},
            {"type": "agent_start", "agent": "financial_data", "message": "Fetching financial data..."},
            {"type": "tool_start", "tool": "fetch_transactions", "message": "Getting recent transactions"},
            {"type": "tool_complete", "tool": "fetch_transactions", "message": "Retrieved 50 transactions"},
            {"type": "agent_complete", "agent": "financial_data", "message": "Financial analysis complete"},
            {"type": "progress", "stage": 3, "message": "Gathering information"},
            {"type": "agent_start", "agent": "market_research", "message": "Researching market trends..."},
            {"type": "tool_start", "tool": "perplexity_search", "message": "Searching for market data"},
            {"type": "tool_complete", "tool": "perplexity_search", "message": "Found relevant market insights"},
            {"type": "agent_complete", "agent": "market_research", "message": "Market research complete"},
            {"type": "progress", "stage": 4, "message": "Processing insights"},
            {"type": "agent_start", "agent": "advisory", "message": "Formulating recommendations..."},
            {"type": "agent_complete", "agent": "advisory", "message": "Recommendations prepared"},
            {"type": "progress", "stage": 5, "message": "Preparing response"},
            {"type": "token", "content": "Based "},
            {"type": "token", "content": "on "},
            {"type": "token", "content": "your "},
            {"type": "token", "content": "financial "},
            {"type": "token", "content": "data, "},
            {"type": "token", "content": "here "},
            {"type": "token", "content": "are "},
            {"type": "token", "content": "my "},
            {"type": "token", "content": "recommendations..."},
            {"type": "complete", "status": "success", "message": "Analysis complete"}
        ]
        
        for event in events:
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0.1)  # Simulate processing delay
    
    return StreamingResponse(
        generate_test_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/events")
async def stream_events(request: Request, event_request: Dict[str, Any]):
    """
    Stream detailed events with filtering options.
    
    Request body:
    {
        "query": "Your financial question",
        "user_id": "user123",
        "session_id": "session456" (optional),
        "event_types": ["progress", "token", "tool"] (optional filter)
    }
    """
    query = event_request.get("query")
    user_id = event_request.get("user_id", "default_user")
    session_id = event_request.get("session_id")
    event_types = event_request.get("event_types", [])
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    async def generate():
        """Generate filtered SSE events."""
        try:
            app_state = request.app.state.app_state
            orchestrator = app_state.get("orchestrator")
            
            if not orchestrator:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Orchestrator not initialized'})}\n\n"
                return
            
            # Stream events with filtering
            async for event in orchestrator.aquery_stream_events(
                query,
                user_id=user_id,
                session_id=session_id
            ):
                # Filter events if types specified
                if event_types and event.get("type") not in event_types:
                    continue
                
                yield f"data: {json.dumps(event)}\n\n"
            
            yield f"data: {json.dumps({'type': 'complete', 'status': 'success'})}\n\n"
            
        except Exception as e:
            logger.error(f"Event streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
