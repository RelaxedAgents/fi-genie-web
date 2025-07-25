"""Data structures for memory management."""

from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MemoryEntry(BaseModel):
    """Base memory entry structure."""
    id: Optional[str] = None
    user_id: str
    agent_id: Optional[str] = None
    content: str
    messages: List[Dict[str, str]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    relevance_score: Optional[float] = None


class UserContext(BaseModel):
    """User context aggregated from memories."""
    user_id: str
    preferences: Dict[str, Any] = Field(default_factory=dict)
    financial_goals: List[str] = Field(default_factory=list)
    risk_tolerance: Optional[str] = None
    investment_experience: Optional[str] = None
    recent_interactions: List[Dict[str, Any]] = Field(default_factory=list)
    key_insights: List[str] = Field(default_factory=list)
    last_updated: Optional[datetime] = None


class InteractionHistory(BaseModel):
    """Structured interaction history."""
    session_id: str
    user_id: str
    agent_id: str
    query: str
    response: str
    agents_involved: List[str] = Field(default_factory=list)
    execution_type: str = "sequential"  # sequential or parallel
    tools_used: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.now)


class SharedInsight(BaseModel):
    """Insight shared between agents."""
    id: Optional[str] = None
    source_agent: str
    target_agents: List[str]
    user_id: str
    insight_type: str  # pattern, anomaly, recommendation, etc.
    content: str
    confidence: float = Field(ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None


class FinancialPattern(BaseModel):
    """Detected financial pattern."""
    pattern_type: str  # spending, saving, investment, etc.
    description: str
    frequency: Optional[str] = None  # daily, weekly, monthly
    amount_range: Optional[Dict[str, float]] = None
    categories: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    first_detected: datetime
    last_observed: datetime
    occurrences: int = 1


class MemorySearchResult(BaseModel):
    """Search result with relevance scoring."""
    memory: MemoryEntry
    relevance_score: float
    match_highlights: List[str] = Field(default_factory=list)
    context: Optional[str] = None


class AgentMemoryStats(BaseModel):
    """Statistics about agent memory usage."""
    agent_id: str
    total_memories: int
    memory_types: Dict[str, int] = Field(default_factory=dict)
    avg_relevance_score: float
    last_activity: Optional[datetime] = None
    top_topics: List[str] = Field(default_factory=list)
