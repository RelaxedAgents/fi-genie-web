"""Chat router for Financial AI Assistant."""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Request
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/query")
async def chat_query(request: Request, query_request: Dict[str, Any]):
    """
    Process a chat query through the orchestrator.
    
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
    
    try:
        # Get orchestrator from app state
        app_state = request.app.state.app_state
        orchestrator = app_state.get("orchestrator")
        
        if not orchestrator:
            raise HTTPException(
                status_code=503,
                detail="Orchestrator not initialized"
            )
        
        # Process query through orchestrator
        result = await orchestrator.process(
            query=query,
            user_id=user_id,
            session_id=session_id
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


@router.get("/history/{user_id}")
async def get_chat_history(request: Request, user_id: str, limit: int = 10):
    """Get chat history for a user."""
    try:
        app_state = request.app.state.app_state
        memory_manager = app_state.get("memory_manager")
        
        if not memory_manager:
            raise HTTPException(
                status_code=503,
                detail="Memory manager not initialized"
            )
        
        # Get recent interactions
        memories = await memory_manager.get_agent_memories(
            user_id=user_id,
            agent_id="orchestrator",
            limit=limit
        )
        
        # Format as chat history
        history = []
        for memory in memories:
            metadata = memory.get("metadata", {})
            if metadata.get("type") == "interaction":
                history.append({
                    "query": metadata.get("query", ""),
                    "response": metadata.get("response", ""),
                    "timestamp": memory.get("created_at"),
                    "session_id": metadata.get("session_id")
                })
        
        return {
            "user_id": user_id,
            "history": history,
            "count": len(history)
        }
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting chat history: {str(e)}"
        )


@router.get("/context/{user_id}")
async def get_user_context(request: Request, user_id: str):
    """Get user context from memory."""
    try:
        app_state = request.app.state.app_state
        memory_manager = app_state.get("memory_manager")
        
        if not memory_manager:
            raise HTTPException(
                status_code=503,
                detail="Memory manager not initialized"
            )
        
        context = await memory_manager.get_user_context(user_id)
        return context.dict()
        
    except Exception as e:
        logger.error(f"Error getting user context: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting user context: {str(e)}"
        )


@router.post("/feedback")
async def submit_feedback(request: Request, feedback_request: Dict[str, Any]):
    """
    Submit feedback for a response.
    
    Request body:
    {
        "user_id": "user123",
        "session_id": "session456",
        "query": "original query",
        "response": "agent response",
        "rating": 5,
        "feedback": "optional text feedback"
    }
    """
    user_id = feedback_request.get("user_id", "default_user")
    session_id = feedback_request.get("session_id")
    rating = feedback_request.get("rating")
    
    if rating is None:
        raise HTTPException(status_code=400, detail="Rating is required")
    
    try:
        app_state = request.app.state.app_state
        memory_manager = app_state.get("memory_manager")
        
        if not memory_manager:
            raise HTTPException(
                status_code=503,
                detail="Memory manager not initialized"
            )
        
        # Store feedback in memory
        await memory_manager.mem0_client.create_memory(
            messages=[{
                "role": "system",
                "content": f"User feedback: Rating {rating}/5. {feedback_request.get('feedback', '')}"
            }],
            user_id=user_id,
            agent_id="orchestrator",
            metadata={
                "type": "feedback",
                "session_id": session_id,
                "query": feedback_request.get("query"),
                "rating": rating,
                "feedback_text": feedback_request.get("feedback")
            }
        )
        
        return {
            "status": "success",
            "message": "Feedback recorded successfully"
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting feedback: {str(e)}"
        )


@router.post("/preferences")
async def update_preferences(request: Request, preferences_request: Dict[str, Any]):
    """
    Update user preferences.
    
    Request body:
    {
        "user_id": "user123",
        "preferences": {
            "risk_tolerance": "moderate",
            "investment_goals": ["retirement", "growth"],
            "preferred_sectors": ["technology", "healthcare"]
        }
    }
    """
    user_id = preferences_request.get("user_id", "default_user")
    preferences = preferences_request.get("preferences", {})
    
    if not preferences:
        raise HTTPException(status_code=400, detail="Preferences are required")
    
    try:
        app_state = request.app.state.app_state
        memory_manager = app_state.get("memory_manager")
        
        if not memory_manager:
            raise HTTPException(
                status_code=503,
                detail="Memory manager not initialized"
            )
        
        # Store preferences in memory
        await memory_manager.mem0_client.create_memory(
            messages=[{
                "role": "system",
                "content": f"User preferences updated: {preferences}"
            }],
            user_id=user_id,
            agent_id="orchestrator",
            metadata={
                "type": "preference",
                "preferences": preferences
            }
        )
        
        return {
            "status": "success",
            "message": "Preferences updated successfully",
            "preferences": preferences
        }
        
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating preferences: {str(e)}"
        )
