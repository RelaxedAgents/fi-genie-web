"""LangChain tools for memory operations."""

from typing import Dict, List, Optional, Any
from langchain.tools import Tool, StructuredTool
from langchain.pydantic_v1 import BaseModel, Field
import json
import asyncio
from functools import partial

from .memory_manager import MemoryManager
from .memory_schemas import SharedInsight, FinancialPattern


class SearchMemoryInput(BaseModel):
    """Input for searching memories."""
    query: str = Field(description="Search query for finding relevant memories")
    limit: int = Field(default=5, description="Maximum number of results to return")


class StoreInsightInput(BaseModel):
    """Input for storing an insight."""
    content: str = Field(description="The insight content to store")
    insight_type: str = Field(
        default="general",
        description="Type of insight: pattern, anomaly, recommendation, etc."
    )
    confidence: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Confidence level of the insight (0-1)"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata for the insight"
    )


class ShareInsightInput(BaseModel):
    """Input for sharing insights with other agents."""
    content: str = Field(description="The insight content to share")
    target_agents: List[str] = Field(
        description="List of agent names to share the insight with"
    )
    insight_type: str = Field(
        default="general",
        description="Type of insight being shared"
    )
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class StorePatternInput(BaseModel):
    """Input for storing a financial pattern."""
    pattern_type: str = Field(
        description="Type of pattern: spending, saving, investment, etc."
    )
    description: str = Field(description="Description of the pattern")
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    frequency: Optional[str] = Field(
        default=None,
        description="Frequency of the pattern: daily, weekly, monthly"
    )
    categories: List[str] = Field(
        default_factory=list,
        description="Categories associated with the pattern"
    )


def create_memory_tools(
    memory_manager: MemoryManager,
    agent_id: str,
    user_id: Optional[str] = None
) -> List[Tool]:
    """
    Create LangChain tools for memory operations.
    
    Args:
        memory_manager: MemoryManager instance
        agent_id: ID of the agent using these tools
        user_id: Optional fixed user ID (if not provided, will be extracted from context)
        
    Returns:
        List of LangChain Tool objects
    """
    
    # Helper to run async functions in sync context
    def run_async(coro):
        """Run async coroutine in sync context."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        if loop.is_running():
            # If loop is already running, schedule the coroutine
            future = asyncio.ensure_future(coro)
            return future
        else:
            return loop.run_until_complete(coro)
    
    # Search memory tool
    async def _search_memory(query: str, limit: int = 5) -> str:
        """Search memories for relevant information."""
        try:
            # Get user context first
            context = await memory_manager.get_user_context(
                user_id=user_id or "default_user",
                agent_id=agent_id
            )
            
            # Search memories
            memories = await memory_manager.mem0_client.search_memories(
                query=query,
                user_id=user_id or "default_user",
                agent_id=agent_id,
                limit=limit
            )
            
            if not memories:
                return "No relevant memories found."
            
            # Format results
            results = []
            for i, memory in enumerate(memories, 1):
                # Handle both 'content' and 'memory' fields
                content = memory.get('content') or memory.get('memory', '')
                # Safely handle metadata that might be None
                metadata = memory.get('metadata', {})
                if metadata is None:
                    metadata = {}
                # Handle both 'relevance_score' and 'score' fields
                relevance = memory.get('relevance_score', memory.get('score', 0.0))
                
                result = f"{i}. {content}"
                if metadata.get('type'):
                    result += f" (Type: {metadata['type']})"
                if relevance:
                    result += f" [Relevance: {relevance:.2f}]"
                
                results.append(result)
            
            return "Found memories:\n" + "\n".join(results)
            
        except Exception as e:
            return f"Error searching memories: {str(e)}"
    
    def search_memory_sync(query: str, limit: int = 5) -> str:
        """Sync wrapper for search memory."""
        return run_async(_search_memory(query, limit))
    
    # Store insight tool
    async def _store_insight(
        content: str,
        insight_type: str = "general",
        confidence: float = 0.8,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Store an important insight or discovery."""
        try:
            await memory_manager.mem0_client.create_memory(
                messages=[{
                    "role": "system",
                    "content": f"Insight: {content}"
                }],
                user_id=user_id or "default_user",
                agent_id=agent_id,
                metadata={
                    "type": "insight",
                    "insight_type": insight_type,
                    "confidence": confidence,
                    **(metadata or {})
                }
            )
            
            return f"Successfully stored insight: {content[:100]}..."
            
        except Exception as e:
            return f"Error storing insight: {str(e)}"
    
    def store_insight_sync(
        content: str,
        insight_type: str = "general",
        confidence: float = 0.8,
        metadata: Dict[str, Any] = None
    ) -> str:
        """Sync wrapper for store insight."""
        return run_async(_store_insight(content, insight_type, confidence, metadata))
    
    # Share insight tool
    async def _share_insight(
        content: str,
        target_agents: List[str],
        insight_type: str = "general",
        confidence: float = 0.8
    ) -> str:
        """Share an insight with other agents."""
        try:
            insight = SharedInsight(
                source_agent=agent_id,
                target_agents=target_agents,
                user_id=user_id or "default_user",
                insight_type=insight_type,
                content=content,
                confidence=confidence
            )
            
            await memory_manager.share_insight(insight)
            
            return f"Successfully shared insight with {', '.join(target_agents)}"
            
        except Exception as e:
            return f"Error sharing insight: {str(e)}"
    
    def share_insight_sync(
        content: str,
        target_agents: List[str],
        insight_type: str = "general",
        confidence: float = 0.8
    ) -> str:
        """Sync wrapper for share insight."""
        return run_async(_share_insight(content, target_agents, insight_type, confidence))
    
    # Get user context tool
    async def _get_user_context() -> str:
        """Get comprehensive user context."""
        try:
            context = await memory_manager.get_user_context(
                user_id=user_id or "default_user",
                agent_id=agent_id
            )
            
            # Format context
            result = "User Context:\n"
            
            if context.financial_goals:
                result += f"\nFinancial Goals:\n"
                for goal in context.financial_goals:
                    result += f"- {goal}\n"
            
            if context.risk_tolerance:
                result += f"\nRisk Tolerance: {context.risk_tolerance}\n"
            
            if context.preferences:
                result += f"\nPreferences: {json.dumps(context.preferences, indent=2)}\n"
            
            if context.key_insights:
                result += f"\nKey Insights:\n"
                for insight in context.key_insights:
                    result += f"- {insight}\n"
            
            if context.recent_interactions:
                result += f"\nRecent Interactions: {len(context.recent_interactions)}\n"
            
            return result
            
        except Exception as e:
            return f"Error getting user context: {str(e)}"
    
    def get_user_context_sync() -> str:
        """Sync wrapper for get user context."""
        return run_async(_get_user_context())
    
    # Store pattern tool
    async def _store_pattern(
        pattern_type: str,
        description: str,
        confidence: float = 0.8,
        frequency: Optional[str] = None,
        categories: List[str] = None
    ) -> str:
        """Store a detected financial pattern."""
        try:
            from datetime import datetime
            
            pattern = FinancialPattern(
                pattern_type=pattern_type,
                description=description,
                confidence=confidence,
                frequency=frequency,
                categories=categories or [],
                first_detected=datetime.now(),
                last_observed=datetime.now()
            )
            
            await memory_manager.store_pattern(
                user_id=user_id or "default_user",
                agent_id=agent_id,
                pattern=pattern
            )
            
            return f"Successfully stored {pattern_type} pattern: {description}"
            
        except Exception as e:
            return f"Error storing pattern: {str(e)}"
    
    def store_pattern_sync(
        pattern_type: str,
        description: str,
        confidence: float = 0.8,
        frequency: Optional[str] = None,
        categories: List[str] = None
    ) -> str:
        """Sync wrapper for store pattern."""
        return run_async(_store_pattern(
            pattern_type, description, confidence, frequency, categories
        ))
    
    # Create tools
    tools = [
        StructuredTool.from_function(
            func=search_memory_sync,
            name="search_memory",
            description="Search through memories for relevant information about the user",
            args_schema=SearchMemoryInput
        ),
        StructuredTool.from_function(
            func=store_insight_sync,
            name="store_insight", 
            description="Store an important insight or discovery about the user",
            args_schema=StoreInsightInput
        ),
        StructuredTool.from_function(
            func=share_insight_sync,
            name="share_insight",
            description="Share an insight with other agents for collaborative analysis", 
            args_schema=ShareInsightInput
        ),
        Tool(
            name="get_user_context",
            description="Get comprehensive context about the user including goals, preferences, and history",
            func=get_user_context_sync
            # No args_schema - this tool takes no parameters
        ),
        StructuredTool.from_function(
            func=store_pattern_sync,
            name="store_pattern",
            description="Store a detected financial pattern for future reference",
            args_schema=StorePatternInput
        )
    ]
    
    return tools


def create_memory_tools_async(
    memory_manager: MemoryManager,
    agent_id: str,
    user_id: Optional[str] = None
) -> List[Tool]:
    """
    Create async-compatible LangChain tools for memory operations.
    This version is for agents that support async operations natively.
    """
    # Similar to above but returns tools with async functions directly
    # This would be used by agents that can handle async tools
    pass
