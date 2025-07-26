"""LLM-friendly callback handlers for streaming."""

import asyncio
import json
import logging
from typing import Dict, Any, Optional, AsyncIterator
from datetime import datetime
from uuid import UUID

from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.messages import BaseMessage
from langchain_core.outputs import LLMResult
from langchain_core.agents import AgentAction, AgentFinish

from .event_types import StreamEvent, EventType

logger = logging.getLogger(__name__)


class LLMFriendlyCallbackHandler(AsyncCallbackHandler):
    """Callback handler that uses LLM to generate friendly updates with progress."""
    
    def __init__(self, query: str, gemini_service):
        """Initialize with user query and Gemini service."""
        super().__init__()
        self.query = query
        self.gemini_service = gemini_service
        self.event_queue = asyncio.Queue()
        self.current_progress = 0
        self.final_response = None
        
        # Event deduplication
        self.last_event_type = None
        self.last_event_time = 0
        self.min_event_interval = 0.1  # seconds
        
        # Tracking
        self.event_count = 0
        self.last_event_content = None
        
    async def get_event(self) -> Dict[str, Any]:
        """Get the next event from the queue."""
        event = await self.event_queue.get()
        logger.info(f"EVENT RETRIEVED: {json.dumps(event, indent=2)}")
        return event
    
    async def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: list,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle LLM start event."""
        event = {
            "type": "llm_start",
            "content": "Starting LLM generation..."
        }
        await self._emit_friendly_update(event)
    
    async def on_llm_end(
        self,
        response: LLMResult,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        **kwargs: Any,
    ) -> None:
        """Handle LLM end event."""
        event = {
            "type": "llm_end",
            "content": "LLM generation completed"
        }
        await self._emit_friendly_update(event)
    
    async def on_tool_start(
        self,
        serialized: Dict[str, Any],
        input_str: str,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle tool start event."""
        tool_name = serialized.get("name", "unknown")
        event = {
            "type": "tool_start",
            "content": f"Calling tool: {tool_name}"
        }
        await self._emit_friendly_update(event)
    
    async def on_tool_end(
        self,
        output: str,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        **kwargs: Any,
    ) -> None:
        """Handle tool end event."""
        event = {
            "type": "tool_end",
            "content": "Tool completed"
        }
        await self._emit_friendly_update(event)
    
    async def on_chain_start(
        self,
        serialized: Dict[str, Any],
        inputs: Dict[str, Any],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle chain start event."""
        event = {
            "type": "chain_start",
            "content": "Starting reasoning chain"
        }
        await self._emit_friendly_update(event)
    
    async def on_chain_end(
        self,
        outputs: Dict[str, Any],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        **kwargs: Any,
    ) -> None:
        """Handle chain end event."""
        # Check if this contains the final response
        if isinstance(outputs, dict):
            if "output" in outputs:
                self.final_response = outputs["output"]
            elif "messages" in outputs and outputs["messages"]:
                # Extract from messages if available
                try:
                    self.final_response = outputs["messages"][-1].content
                except (IndexError, AttributeError):
                    logger.warning("Could not extract final response from messages")
            
        event = {
            "type": "chain_end",
            "content": "Completed reasoning chain"
        }
        await self._emit_friendly_update(event)
        
        # If we have a final response, emit it
        if self.final_response:
            event_data = {
                "type": "final_answer",
                "content": self.final_response,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.event_queue.put(event_data)
            logger.info(f"EVENT QUEUED - FINAL ANSWER (CHAIN END): {json.dumps({'type': 'final_answer', 'content_preview': self.final_response[:200] + '...' if len(self.final_response) > 200 else self.final_response}, indent=2)}")
            logger.info(f"FULL FINAL ANSWER (CHAIN END): {self.final_response}")
    
    async def on_agent_finish(
        self,
        finish: AgentFinish,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[list] = None,
        **kwargs: Any,
    ) -> None:
        """Handle agent finish event."""
        # Extract the final response if not already set
        if not self.final_response and hasattr(finish, "return_values") and "output" in finish.return_values:
            self.final_response = finish.return_values["output"]
            
            # Emit final answer event
            event_data = {
                "type": "final_answer",
                "content": self.final_response,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.event_queue.put(event_data)
            logger.info(f"EVENT QUEUED - FINAL ANSWER: {json.dumps({'type': 'final_answer', 'content_preview': self.final_response[:200] + '...' if len(self.final_response) > 200 else self.final_response}, indent=2)}")
            logger.info(f"FULL FINAL ANSWER: {self.final_response}")
    
    def _extract_content(self, response) -> str:
        """Extract content from an LLM response object."""
        # Handle AIMessage objects
        if hasattr(response, 'content'):
            content = response.content
        # Handle string responses
        elif isinstance(response, str):
            content = response
        # Handle any other type
        else:
            content = str(response)
        
        # Ensure it's a clean string
        if isinstance(content, str):
            return content.strip()
        else:
            return str(content).strip()

    async def _emit_friendly_update(self, event: Dict[str, Any]):
        """Generate and emit a friendly update using the original event content."""
        try:
            # Just use the original event content
            friendly_message = event.get("content", f"Processing your question about {self.query[:30]}...")
            
            # Enhance the message based on event type
            event_type = event.get("type", "")
            friendly_templates = {
                "llm_start": f"Analyzing your question about {self.query[:30]}...",
                "tool_start": f"Gathering financial data for {self.query[:30]}...",
                "tool_complete": f"Collected important financial information for {self.query[:30]}...",
                "chain_start": f"Processing financial analysis for {self.query[:30]}...",
                "chain_end": f"Completed financial analysis for {self.query[:30]}...",
            }
            
            # Use template if available, otherwise use original content
            if event_type in friendly_templates:
                friendly_message = friendly_templates[event_type]
            
            # Check for duplicate events (same type and content in quick succession)
            current_time = asyncio.get_event_loop().time()
            if (event_type == self.last_event_type and 
                friendly_message == self.last_event_content and
                current_time - self.last_event_time < self.min_event_interval):
                logger.debug(f"Skipping duplicate event: {event_type}")
                # Still update progress
                await self._emit_progress_update(event)
                return
                
            # Update tracking
            self.last_event_type = event_type
            self.last_event_time = current_time
            self.last_event_content = friendly_message
            self.event_count += 1
            
            # Put friendly update in queue with simple structure
            event_data = {
                "type": "friendly_update",
                "content": friendly_message,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.event_queue.put(event_data)
            logger.info(f"EVENT QUEUED - FRIENDLY UPDATE: {json.dumps(event_data, indent=2)}")
            
            # Now generate a progress update
            await self._emit_progress_update(event)
                
        except Exception as e:
            logger.error(f"Error generating friendly update: {e}")
            # Fallback update
            await self.event_queue.put({
                "type": "friendly_update",
                "content": f"Still working on your question about {self.query[:30]}...",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Still try to generate a progress update
            await self._emit_progress_update(event)
    
    async def _emit_progress_update(self, event: Dict[str, Any]):
        """Generate and emit a progress update using a simple increment."""
        try:
            # Simple progress increment based on event type
            event_type = event.get("type", "")
            
            # Increment progress based on event type
            progress_increments = {
                "llm_start": 5,
                "llm_end": 10,
                "tool_start": 15,
                "tool_complete": 20,
                "chain_start": 5,
                "chain_end": 10
            }
            
            # Get increment for this event type, default to 5
            increment = progress_increments.get(event_type, 5)
            
            # Increment progress
            previous_progress = self.current_progress
            self.current_progress = min(self.current_progress + increment, 100)
            
            # Skip if progress hasn't changed significantly
            if self.current_progress == previous_progress:
                return
                
            # Put progress update in queue with simple structure
            event_data = {
                "type": "progress_update",
                "content": f"Progress: {self.current_progress}%",
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.event_queue.put(event_data)
            logger.info(f"EVENT QUEUED - PROGRESS UPDATE: {json.dumps(event_data, indent=2)}")
                
        except Exception as e:
            logger.error(f"Error generating progress update: {e}")
            # Fallback progress update
            self.current_progress = min(self.current_progress + 5, 100)
            await self.event_queue.put({
                "type": "progress_update",
                "content": f"Progress: {self.current_progress}%",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    def _extract_structured_data(self, response: str) -> Dict[str, Any]:
        """Extract structured data from the response if possible."""
        # Simple extraction of sections based on markdown headers
        structured_data = {}
        
        # Try to extract executive summary
        if "### 1. Executive Summary" in response:
            parts = response.split("### 1. Executive Summary")
            if len(parts) > 1:
                summary_part = parts[1].split("###")[0].strip() if "###" in parts[1] else parts[1].strip()
                structured_data["executive_summary"] = summary_part
        
        # Try to extract recommendations
        if "### 4. Recommendations" in response:
            parts = response.split("### 4. Recommendations")
            if len(parts) > 1:
                recommendations_part = parts[1].split("###")[0].strip() if "###" in parts[1] else parts[1].strip()
                # Extract numbered or bulleted items
                import re
                items = re.findall(r'[*\d.]\s+(.*?)(?=\n[*\d.]|\n\n|$)', recommendations_part)
                structured_data["recommendations"] = items
        
        # Try to extract next steps
        if "### 5. Next Steps" in response:
            parts = response.split("### 5. Next Steps")
            if len(parts) > 1:
                next_steps_part = parts[1].split("###")[0].strip() if "###" in parts[1] else parts[1].strip()
                # Extract numbered or bulleted items
                import re
                items = re.findall(r'[*\d.]\s+(.*?)(?=\n[*\d.]|\n\n|$)', next_steps_part)
                structured_data["next_steps"] = items
        
        return structured_data


class LLMFriendlyEventIterator:
    """Iterator for streaming events from a LLM-friendly callback handler."""
    
    def __init__(self, callback_handler: LLMFriendlyCallbackHandler, timeout: float = 30.0):
        """
        Initialize the event iterator.
        
        Args:
            callback_handler: The callback handler to stream events from
            timeout: Maximum time to wait for events in seconds
        """
        self.callback_handler = callback_handler
        self.timeout = timeout
        self._done = False
    
    def done(self):
        """Mark the iterator as done."""
        self._done = True
    
    async def __aiter__(self) -> AsyncIterator[Dict[str, Any]]:
        """Async iterator for streaming events."""
        while not self._done:
            try:
                # Wait for event without timeout
                event = await self.callback_handler.get_event()
                yield event
            except Exception as e:
                # Emit error event and stop
                logger.error(f"Error in event iterator: {e}")
                yield {
                    "type": "error",
                    "content": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
                break
