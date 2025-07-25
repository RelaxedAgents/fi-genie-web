"""Event types for streaming LangGraph agent responses."""

from enum import Enum
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime


class EventType(Enum):
    """Types of events that can be streamed from the agent."""
    
    # Agent lifecycle events
    REASONING_START = "reasoning_start"
    REASONING_COMPLETE = "reasoning_complete"
    
    # LangGraph node events
    NODE_START = "node_start"
    NODE_COMPLETE = "node_complete"
    
    # Tool events
    TOOL_START = "tool_start"
    TOOL_COMPLETE = "tool_complete"
    TOOL_ERROR = "tool_error"
    
    # LLM events
    LLM_START = "llm_start"
    LLM_TOKEN = "llm_token"
    LLM_COMPLETE = "llm_complete"
    
    # Other events
    ERROR = "error"
    STATUS = "status"
    PROGRESS = "progress"
    
    # Custom reasoning steps
    PARSING_INTENT = "parsing_intent"
    SEARCHING_DOCUMENTS = "searching_documents"
    SYNTHESIZING = "synthesizing"


@dataclass
class StreamEvent:
    """Represents a single streaming event."""
    
    type: EventType
    timestamp: datetime = field(default_factory=datetime.utcnow)
    content: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for JSON serialization."""
        return {
            "type": self.type.value,
            "timestamp": self.timestamp.isoformat(),
            "content": self.content,
            "metadata": self.metadata
        }
    
    def to_sse_format(self) -> str:
        """Format event for Server-Sent Events (SSE)."""
        import json
        data = self.to_dict()
        return f"data: {json.dumps(data)}\n\n"


@dataclass
class ToolEvent(StreamEvent):
    """Specialized event for tool invocations."""
    
    tool_name: str = ""
    tool_args: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Add tool info to metadata."""
        self.metadata.update({
            "tool_name": self.tool_name,
            "tool_args": self.tool_args
        })


@dataclass
class NodeEvent(StreamEvent):
    """Specialized event for LangGraph node execution."""
    
    node_name: str = ""
    node_type: str = ""
    
    def __post_init__(self):
        """Add node info to metadata."""
        self.metadata.update({
            "node_name": self.node_name,
            "node_type": self.node_type
        })


@dataclass
class LLMEvent(StreamEvent):
    """Specialized event for LLM interactions."""
    
    model_name: str = ""
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    
    def __post_init__(self):
        """Add LLM info to metadata."""
        self.metadata.update({
            "model_name": self.model_name,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens
        })
