"""Centralized memory management for all agents."""

from typing import Dict, List, Optional, Any
import asyncio
import logging
import os
from datetime import datetime

from .mem0_client import Mem0Client
from .memory_schemas import (
    UserContext,
    InteractionHistory,
    SharedInsight,
    FinancialPattern
)

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Central memory orchestration for:
    - User context management
    - Cross-agent memory sharing
    - Conversation history
    - Pattern storage
    """
    
    def __init__(self, mem0_base_url: str, api_key: Optional[str] = None):
        """
        Initialize memory manager.
        
        Args:
            mem0_base_url: Base URL for Mem0 service
            api_key: Optional API key for authentication
        """
        self.mem0_client = Mem0Client(mem0_base_url, api_key)
        self._context_cache = {}  # Simple in-memory cache
        
    async def get_user_context(
        self, 
        user_id: str, 
        agent_id: Optional[str] = None
    ) -> UserContext:
        """
        Get comprehensive user context.
        
        Args:
            user_id: User identifier
            agent_id: Optional agent identifier for agent-specific context
            
        Returns:
            UserContext object with aggregated information
        """
        # Check cache first
        cache_key = f"{user_id}:{agent_id or 'global'}"
        if cache_key in self._context_cache:
            cached = self._context_cache[cache_key]
            cache_ttl = int(os.getenv("MEMORY_CACHE_TTL", "300"))
            if (datetime.now() - cached['timestamp']).seconds < cache_ttl:
                return cached['context']
        
        # Parallel fetch of different context types
        tasks = [
            self.mem0_client.search_memories(
                query="financial goals preferences risk tolerance",
                user_id=user_id,
                agent_id=agent_id,
                limit=10
            ),
            self.mem0_client.search_memories(
                query="recent interactions conversations",
                user_id=user_id,
                # agent_id="orchestrator",  # Removed - causes Neo4j syntax error with this specific query
                limit=5
            ),
            self.mem0_client.get_memories(
                user_id=user_id,
                agent_id=agent_id,
                limit=10
            )
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        preferences = {}
        financial_goals = []
        risk_tolerance = None
        recent_interactions = []
        key_insights = []
        
        # Process preference memories
        if not isinstance(results[0], Exception) and isinstance(results[0], list):
            for memory in results[0]:
                if memory is None:
                    continue
                    
                # Extract content - handle both 'content' and 'memory' fields
                content = memory.get('content') or memory.get('memory', '')
                if not content:
                    continue
                    
                # Safely handle metadata
                metadata = memory.get('metadata', {})
                if metadata is None:
                    metadata = {}
                
                content_lower = content.lower()
                if 'risk_tolerance' in content_lower:
                    risk_tolerance = metadata.get('risk_tolerance', 'moderate')
                if 'goal' in content_lower:
                    financial_goals.append(content)
                if metadata.get('type') == 'preference':
                    prefs = metadata.get('preferences', {})
                    if isinstance(prefs, dict):
                        preferences.update(prefs)
        
        # Process recent interactions
        if not isinstance(results[1], Exception) and isinstance(results[1], list):
            for memory in results[1]:
                if memory is None:
                    continue
                    
                # Safely extract metadata
                metadata = memory.get('metadata', {})
                if metadata is None:
                    metadata = {}
                
                # Extract content - handle both 'content' and 'memory' fields
                content = memory.get('content') or memory.get('memory', '')
                
                recent_interactions.append({
                    'query': metadata.get('query', content),
                    'timestamp': memory.get('created_at'),
                    'agents_used': metadata.get('agents_used', [])
                })
        
        # Process agent-specific memories
        if not isinstance(results[2], Exception) and isinstance(results[2], list):
            for memory in results[2]:
                if memory is None:
                    continue
                    
                # Safely handle metadata
                metadata = memory.get('metadata', {})
                if metadata is None:
                    metadata = {}
                    
                if metadata.get('type') == 'insight':
                    # Extract content - handle both 'content' and 'memory' fields
                    content = memory.get('content') or memory.get('memory', '')
                    if content:
                        key_insights.append(content)
        
        context = UserContext(
            user_id=user_id,
            preferences=preferences,
            financial_goals=financial_goals[:5],  # Top 5 goals
            risk_tolerance=risk_tolerance,
            recent_interactions=recent_interactions[:3],  # Last 3 interactions
            key_insights=key_insights[:5],  # Top 5 insights
            last_updated=datetime.now()
        )
        
        # Cache the context
        self._context_cache[cache_key] = {
            'context': context,
            'timestamp': datetime.now()
        }
        
        return context
    
    async def store_interaction(
        self,
        user_id: str,
        session_id: str,
        agent_id: str,
        query: str,
        response: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Store agent interaction with metadata.
        
        Args:
            user_id: User identifier
            session_id: Session identifier
            agent_id: Agent identifier
            query: User query
            response: Agent response
            metadata: Additional metadata
        """
        interaction = InteractionHistory(
            session_id=session_id,
            user_id=user_id,
            agent_id=agent_id,
            query=query,
            response=response,
            agents_involved=metadata.get('agents_used', [agent_id]) if metadata else [agent_id],
            execution_type=metadata.get('execution_type', 'sequential') if metadata else 'sequential',
            tools_used=metadata.get('tools_used', []) if metadata else [],
            metadata=metadata or {}
        )
        
        messages = [
            {"role": "user", "content": query},
            {"role": "assistant", "content": response}
        ]
        
        # Convert datetime objects to strings for JSON serialization
        interaction_dict = interaction.dict(exclude={'query', 'response', 'user_id', 'agent_id'})
        # Convert datetime fields to ISO format strings
        for key, value in interaction_dict.items():
            if isinstance(value, datetime):
                interaction_dict[key] = value.isoformat()
        
        await self.mem0_client.create_memory(
            messages=messages,
            user_id=user_id,
            agent_id=agent_id,
            metadata={
                "type": "interaction",
                "session_id": session_id,
                **interaction_dict
            }
        )
        
        # Invalidate cache for this user
        self._invalidate_user_cache(user_id)
    
    async def share_insight(
        self,
        insight: SharedInsight
    ) -> None:
        """
        Share insights between agents.
        
        Args:
            insight: SharedInsight object containing the insight to share
        """
        # Store insight for each target agent
        for target_agent in insight.target_agents:
            await self.mem0_client.create_memory(
                messages=[{
                    "role": "system",
                    "content": f"Insight from {insight.source_agent}: {insight.content}"
                }],
                user_id=insight.user_id,
                agent_id=target_agent,
                metadata={
                    "type": "shared_insight",
                    "source": insight.source_agent,
                    "insight_type": insight.insight_type,
                    "confidence": insight.confidence,
                    **insight.metadata
                }
            )
        
        logger.info(
            f"Shared insight from {insight.source_agent} to {len(insight.target_agents)} agents"
        )
    
    async def store_pattern(
        self,
        user_id: str,
        agent_id: str,
        pattern: FinancialPattern
    ) -> None:
        """
        Store a detected financial pattern.
        
        Args:
            user_id: User identifier
            agent_id: Agent that detected the pattern
            pattern: FinancialPattern object
        """
        await self.mem0_client.create_memory(
            messages=[{
                "role": "system",
                "content": f"Detected {pattern.pattern_type} pattern: {pattern.description}"
            }],
            user_id=user_id,
            agent_id=agent_id,
            metadata={
                "type": "pattern",
                "pattern": pattern.dict()
            }
        )
        
        # Share significant patterns with other agents
        if pattern.confidence > 0.8:
            await self.share_insight(
                SharedInsight(
                    source_agent=agent_id,
                    target_agents=["orchestrator", "advisory"],
                    user_id=user_id,
                    insight_type="pattern",
                    content=f"High-confidence {pattern.pattern_type} pattern: {pattern.description}",
                    confidence=pattern.confidence,
                    metadata={"pattern_type": pattern.pattern_type}
                )
            )
    
    async def search_patterns(
        self,
        user_id: str,
        pattern_type: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> List[FinancialPattern]:
        """
        Search for financial patterns.
        
        Args:
            user_id: User identifier
            pattern_type: Optional pattern type filter
            agent_id: Optional agent filter
            
        Returns:
            List of FinancialPattern objects
        """
        query = f"pattern {pattern_type}" if pattern_type else "financial pattern"
        
        memories = await self.mem0_client.search_memories(
            query=query,
            user_id=user_id,
            agent_id=agent_id,
            limit=20
        )
        
        patterns = []
        for memory in memories:
            if memory is None:
                continue
                
            # Safely handle metadata
            metadata = memory.get('metadata', {})
            if metadata is None:
                metadata = {}
                
            if metadata.get('type') == 'pattern':
                pattern_data = metadata.get('pattern', {})
                if pattern_data and isinstance(pattern_data, dict):
                    try:
                        patterns.append(FinancialPattern(**pattern_data))
                    except Exception as e:
                        logger.error(f"Failed to parse pattern: {e}")
        
        return patterns
    
    async def get_agent_memories(
        self,
        user_id: str,
        agent_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recent memories for a specific agent.
        
        Args:
            user_id: User identifier
            agent_id: Agent identifier
            limit: Maximum number of memories
            
        Returns:
            List of memory entries
        """
        return await self.mem0_client.get_memories(
            user_id=user_id,
            agent_id=agent_id,
            limit=limit
        )
    
    async def search_cross_agent_insights(
        self,
        user_id: str,
        query: str,
        exclude_agent: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for insights across all agents.
        
        Args:
            user_id: User identifier
            query: Search query
            exclude_agent: Optional agent to exclude
            
        Returns:
            List of relevant insights from different agents
        """
        # Search across all agents
        all_memories = await self.mem0_client.search_memories(
            query=query,
            user_id=user_id,
            limit=20
        )
        
        # Filter and organize by agent
        insights_by_agent = {}
        for memory in all_memories:
            if memory is None:
                continue
                
            agent = memory.get('agent_id', 'unknown')
            if exclude_agent and agent == exclude_agent:
                continue
                
            if agent not in insights_by_agent:
                insights_by_agent[agent] = []
            
            # Extract content - handle both 'content' and 'memory' fields
            content = memory.get('content') or memory.get('memory', '')
            
            # Safely handle metadata
            metadata = memory.get('metadata', {})
            if metadata is None:
                metadata = {}
            
            insights_by_agent[agent].append({
                'content': content,
                'metadata': metadata,
                'relevance': memory.get('relevance_score', memory.get('score', 0.0))
            })
        
        return insights_by_agent
    
    def _invalidate_user_cache(self, user_id: str):
        """Invalidate cache entries for a user."""
        keys_to_remove = [k for k in self._context_cache.keys() if k.startswith(f"{user_id}:")]
        for key in keys_to_remove:
            del self._context_cache[key]
    
    async def cleanup_old_memories(
        self,
        user_id: str,
        days_to_keep: int = 30
    ) -> int:
        """
        Clean up old memories (to be implemented based on Mem0 API).
        
        Args:
            user_id: User identifier
            days_to_keep: Number of days to keep memories
            
        Returns:
            Number of memories cleaned up
        """
        # This would need to be implemented based on Mem0's API capabilities
        logger.info(f"Cleanup requested for user {user_id}, keeping {days_to_keep} days")
        return 0
