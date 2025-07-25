"""Event formatters for streaming responses."""

import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from .event_types import StreamEvent, EventType


class EventFormatter:
    """Formats streaming events for different output formats."""
    
    @staticmethod
    def format_reasoning_step(step: str, details: Optional[Dict[str, Any]] = None) -> StreamEvent:
        """Create a formatted reasoning step event."""
        event = StreamEvent(
            type=EventType.STATUS,
            content=step,
            metadata=details or {}
        )
        return event
    
    @staticmethod
    def format_tool_call(tool_name: str, args: Dict[str, Any], start: bool = True) -> StreamEvent:
        """Format a tool call event."""
        event_type = EventType.TOOL_START if start else EventType.TOOL_COMPLETE
        content = f"{'Calling' if start else 'Completed'} tool: {tool_name}"
        
        event = StreamEvent(
            type=event_type,
            content=content,
            metadata={
                "tool_name": tool_name,
                "args": args
            }
        )
        return event
    
    @staticmethod
    def format_llm_token(token: str, model_name: str = "") -> StreamEvent:
        """Format an LLM token streaming event."""
        event = StreamEvent(
            type=EventType.LLM_TOKEN,
            content=token,
            metadata={
                "model_name": model_name
            }
        )
        return event
    
    @staticmethod
    def format_error(error_message: str, error_type: str = "general") -> StreamEvent:
        """Format an error event."""
        event = StreamEvent(
            type=EventType.ERROR,
            content=error_message,
            metadata={
                "error_type": error_type
            }
        )
        return event
    
    @staticmethod
    def batch_events_for_sse(events: List[StreamEvent], max_batch_size: int = 10) -> str:
        """Batch multiple events for SSE transmission."""
        batched_data = []
        for event in events[:max_batch_size]:
            batched_data.append(event.to_dict())
        
        return f"data: {json.dumps(batched_data)}\n\n"
    
    @staticmethod
    def create_progress_event(
        step_name: str, 
        current_step: int, 
        total_steps: Optional[int] = None,
        details: Optional[str] = None
    ) -> StreamEvent:
        """Create a progress tracking event."""
        metadata = {
            "current_step": current_step,
            "step_name": step_name
        }
        
        if total_steps:
            metadata["total_steps"] = total_steps
            metadata["progress_percentage"] = round((current_step / total_steps) * 100, 2)
        
        if details:
            metadata["details"] = details
        
        content = f"Step {current_step}"
        if total_steps:
            content += f" of {total_steps}"
        content += f": {step_name}"
        
        return StreamEvent(
            type=EventType.PROGRESS,
            content=content,
            metadata=metadata
        )
    
    @staticmethod
    def create_thinking_event(thought: str) -> StreamEvent:
        """Create an event representing the agent's thinking process."""
        return StreamEvent(
            type=EventType.PARSING_INTENT,
            content=thought,
            metadata={
                "thinking": True
            }
        )
    
    @staticmethod
    def format_node_execution(node_name: str, start: bool = True) -> StreamEvent:
        """Format a LangGraph node execution event."""
        event_type = EventType.NODE_START if start else EventType.NODE_COMPLETE
        content = f"{'Starting' if start else 'Completed'} {node_name}"
        
        return StreamEvent(
            type=event_type,
            content=content,
            metadata={
                "node_name": node_name,
                "execution_phase": "start" if start else "complete"
            }
        )


class StreamEventBuffer:
    """Buffer for collecting and flushing streaming events."""
    
    def __init__(self, max_size: int = 50, max_age_ms: int = 100):
        """
        Initialize the event buffer.
        
        Args:
            max_size: Maximum number of events to buffer
            max_age_ms: Maximum age of buffered events in milliseconds
        """
        self.max_size = max_size
        self.max_age_ms = max_age_ms
        self.buffer: List[StreamEvent] = []
        self.last_flush = datetime.utcnow()
    
    def add(self, event: StreamEvent) -> Optional[List[StreamEvent]]:
        """
        Add an event to the buffer.
        
        Returns:
            List of events if buffer should be flushed, None otherwise
        """
        self.buffer.append(event)
        
        if self._should_flush():
            return self.flush()
        return None
    
    def _should_flush(self) -> bool:
        """Check if buffer should be flushed."""
        if len(self.buffer) >= self.max_size:
            return True
        
        time_since_flush = (datetime.utcnow() - self.last_flush).total_seconds() * 1000
        if time_since_flush >= self.max_age_ms:
            return True
        
        return False
    
    def flush(self) -> List[StreamEvent]:
        """Flush the buffer and return all events."""
        events = self.buffer.copy()
        self.buffer.clear()
        self.last_flush = datetime.utcnow()
        return events
