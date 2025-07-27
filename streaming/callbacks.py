"""Callback handlers for capturing LangGraph agent events."""

import asyncio
from typing import Dict, Any, List, Optional, Union, AsyncIterator
from uuid import UUID
from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.messages import BaseMessage
from langchain_core.outputs import LLMResult
from langchain_core.agents import AgentAction, AgentFinish

from .event_types import StreamEvent, EventType
from .formatters import EventFormatter
from .config import StreamingConfig, DefaultStreamingConfig


class StreamingCallbackHandler(AsyncCallbackHandler):
    """Async callback handler that emits streaming events for LangGraph agent execution."""
    
    def __init__(self):
        """Initialize the streaming callback handler."""
        super().__init__()
        self.event_queue: asyncio.Queue[StreamEvent] = asyncio.Queue()
        self.formatter = EventFormatter()
        self.active_runs: Dict[UUID, Dict[str, Any]] = {}
        
        # Default config
        self.config = DefaultStreamingConfig()
        
        # Progress tracking
        self.current_stage = 0
        self.tool_count = 0
        self.completed_tools = 0
        self.node_count = 0
        self.completed_nodes = 0
        self.total_progress_points = 100
        
    def set_config(self, config: StreamingConfig):
        """Set the streaming configuration."""
        self.config = config
    
    async def get_event(self) -> StreamEvent:
        """Get the next event from the queue."""
        return await self.event_queue.get()
    
    async def emit_event(self, event: StreamEvent):
        """Emit an event to the queue."""
        await self.event_queue.put(event)
    
    async def emit_progress(self, stage: Optional[int] = None, details: Optional[str] = None, 
                          custom_percentage: Optional[float] = None):
        """Emit a progress event for the current stage."""
        if not self.config.enable_progress_tracking:
            return
            
        # Update stage if provided - allow same stage updates for details
        if stage is not None and stage >= self.current_stage:
            self.current_stage = stage
        
        # Use adaptive or fixed progress mode
        if self.config.progress_mode == "adaptive":
            progress_percentage = self._calculate_adaptive_progress(custom_percentage)
        else:
            # Fixed progress based on stages
            total_stages = self.config.get_total_stages()
            if total_stages > 0 and self.current_stage > 0:
                progress_percentage = (self.current_stage / total_stages) * 100
            else:
                progress_percentage = custom_percentage or 0
        
        progress_event = self.formatter.create_progress_event(
            step_name=self.config.get_stage_name(self.current_stage),
            current_step=self.current_stage,
            total_steps=self.config.get_total_stages(),
            details=details
        )
        
        # Override the calculated percentage
        progress_event.metadata["progress_percentage"] = round(progress_percentage, 1)
        
        await self.emit_event(progress_event)
    
    def _calculate_adaptive_progress(self, custom_percentage: Optional[float] = None) -> float:
        """Calculate progress adaptively based on execution state."""
        if custom_percentage is not None:
            return custom_percentage
            
        # Base progress on current stage
        total_stages = self.config.get_total_stages()
        if total_stages == 0:
            return 0
            
        stage_weight = 100 / total_stages
        base_progress = (self.current_stage - 1) * stage_weight
        
        # Add sub-progress within current stage
        sub_progress = 0
        if self.current_stage == 3:  # Tool execution stage (configurable)
            if self.tool_count > 0:
                sub_progress = (self.completed_tools / self.tool_count) * stage_weight
        elif self.node_count > 0:
            # Progress based on node completion
            sub_progress = (self.completed_nodes / self.node_count) * stage_weight * 0.5
        
        return min(base_progress + sub_progress, 100.0)
    
    # LLM Events
    async def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle LLM start event."""
        # Add null safety check for cloud environments
        if serialized is None:
            serialized = {}
        
        # Store run info
        self.active_runs[run_id] = {
            "type": "llm",
            "model": serialized.get("name", "unknown"),
            "start_time": asyncio.get_event_loop().time()
        }
        
        # Emit LLM start event
        event = StreamEvent(
            type=EventType.LLM_START,
            content="Starting LLM generation...",
            metadata={
                "model": serialized.get("name", "unknown"),
                "prompt_preview": prompts[0][:100] + "..." if prompts and len(prompts[0]) > 100 else prompts[0] if prompts else ""
            }
        )
        await self.emit_event(event)
        
        # Update progress when LLM starts
        if self.current_stage < 2:
            await self.emit_progress(2, "Processing with LLM")
    
    async def on_llm_new_token(
        self,
        token: str,
        *,
        chunk: Optional[Union[BaseMessage, Dict[str, Any]]] = None,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle new LLM token event for streaming."""
        if self.config.enable_token_streaming:
            # Emit token event
            model_name = self.active_runs.get(run_id, {}).get("model", "")
            event = self.formatter.format_llm_token(token, model_name)
            await self.emit_event(event)
    
    async def on_llm_end(
        self,
        response: LLMResult,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle LLM end event."""
        # Calculate duration
        run_info = self.active_runs.get(run_id, {})
        duration = asyncio.get_event_loop().time() - run_info.get("start_time", 0)
        
        # Emit LLM complete event
        event = StreamEvent(
            type=EventType.LLM_COMPLETE,
            content="LLM generation completed",
            metadata={
                "model": run_info.get("model", "unknown"),
                "duration_seconds": round(duration, 2),
                "token_usage": response.llm_output.get("token_usage", {}) if response.llm_output else {}
            }
        )
        await self.emit_event(event)
        
        # Clean up
        self.active_runs.pop(run_id, None)
    
    # Tool Events
    async def on_tool_start(
        self,
        serialized: Dict[str, Any],
        input_str: str,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle tool start event."""
        # Add null safety check for cloud environments
        if serialized is None:
            serialized = {}
            
        tool_name = serialized.get("name", "unknown")
        
        # Store run info
        self.active_runs[run_id] = {
            "type": "tool",
            "name": tool_name,
            "start_time": asyncio.get_event_loop().time()
        }
        
        # Parse input if it's JSON
        try:
            import json
            args = json.loads(input_str) if input_str else {}
        except:
            args = {"input": input_str}
        
        # Emit tool start event
        event = self.formatter.format_tool_call(tool_name, args, start=True)
        await self.emit_event(event)
        
        # Update tool count and progress
        if self.config.enable_tool_tracking:
            self.tool_count += 1
            await self.emit_progress(3, f"Executing {tool_name} ({self.completed_tools + 1}/{self.tool_count})")
    
    async def on_tool_end(
        self,
        output: Any,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle tool end event."""
        run_info = self.active_runs.get(run_id, {})
        tool_name = run_info.get("name", "unknown")
        duration = asyncio.get_event_loop().time() - run_info.get("start_time", 0)
        
        # Handle different output types (including ToolMessage)
        output_str = str(output) if not isinstance(output, str) else output
        
        # Emit tool complete event
        event = StreamEvent(
            type=EventType.TOOL_COMPLETE,
            content=f"Tool {tool_name} completed",
            metadata={
                "tool_name": tool_name,
                "duration_seconds": round(duration, 2),
                "output_preview": output_str[:200] + "..." if len(output_str) > 200 else output_str
            }
        )
        await self.emit_event(event)
        
        # Update completed tools and progress
        if self.config.enable_tool_tracking:
            self.completed_tools += 1
            if self.completed_tools < self.tool_count:
                await self.emit_progress(details=f"Completed {self.completed_tools}/{self.tool_count} tools")
            elif self.completed_tools == self.tool_count and self.tool_count > 0:
                # All tools completed, move to next stage
                await self.emit_progress(4, "All tools completed, processing results")
        
        # Clean up
        self.active_runs.pop(run_id, None)
    
    async def on_tool_error(
        self,
        error: Union[Exception, KeyboardInterrupt],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle tool error event."""
        run_info = self.active_runs.get(run_id, {})
        tool_name = run_info.get("name", "unknown")
        
        # Emit tool error event
        event = StreamEvent(
            type=EventType.TOOL_ERROR,
            content=f"Tool {tool_name} encountered an error",
            metadata={
                "tool_name": tool_name,
                "error": str(error),
                "error_type": type(error).__name__
            }
        )
        await self.emit_event(event)
        
        # Clean up
        self.active_runs.pop(run_id, None)
    
    # Chain/Agent Events
    async def on_chain_start(
        self,
        serialized: Dict[str, Any],
        inputs: Dict[str, Any],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle chain start event (includes agent start)."""
        try:
            # Add null safety check for cloud environments - this is the main fix
            if serialized is None:
                serialized = {}
            
            # Better chain name extraction with safer null handling
            chain_name = "unknown"
            if serialized.get("name"):
                chain_name = serialized.get("name")
            elif serialized.get("id"):
                if isinstance(serialized.get("id"), list):
                    chain_name = serialized.get("id")[-1]
                else:
                    chain_name = serialized.get("id")
            elif serialized.get("graph") and serialized.get("graph").get("name"):
                chain_name = serialized.get("graph").get("name")
            elif serialized.get("class_name"):
                chain_name = serialized.get("class_name")
            
            # Filter out internal LangGraph operations
            internal_chains = {
                "RunnableParallel", "RunnablePassthrough", "RunnableSequence",
                "RunnableLambda", "RunnableMap", "ChannelWrite", "ChannelRead",
                "RunnableAssign", "RemoteRunnable", "__start__", "__end__"
            }
            if any(internal in str(chain_name) for internal in internal_chains):
                return  # Skip logging internal operations
            
            # Store run info
            self.active_runs[run_id] = {
                "type": "chain",
                "name": chain_name,
                "start_time": asyncio.get_event_loop().time()
            }
            
            # Check if this is the main agent starting
            if "agent" in chain_name.lower() and parent_run_id is None:
                event = StreamEvent(
                    type=EventType.REASONING_START,
                    content="Agent reasoning started",
                    metadata={
                        "agent_name": chain_name,
                        "input_preview": str(inputs)[:200] + "..." if len(str(inputs)) > 200 else str(inputs)
                    } if inputs else {"agent_name": chain_name}
                )
                await self.emit_event(event)
                # Emit initial progress
                await self.emit_progress(1, "Starting analysis")
            else:
                # This is a sub-chain/node
                event = self.formatter.format_node_execution(chain_name, start=True)
                await self.emit_event(event)
                
                # Only track meaningful nodes
                if chain_name != "unknown" and not chain_name.startswith("Runnable"):
                    self.node_count += 1
                    
                    # Update progress on node start
                    await self.emit_progress(details=f"Processing {chain_name}")
        except Exception as e:
            # Silently handle callback errors to prevent breaking the streaming
            # In production, you might want to log this to a separate error log
            pass
    
    async def on_chain_end(
        self,
        outputs: Dict[str, Any],
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle chain end event."""
        run_info = self.active_runs.get(run_id, {})
        chain_name = run_info.get("name", "unknown")
        duration = asyncio.get_event_loop().time() - run_info.get("start_time", 0)
        
        # Check if this is the main agent completing
        if "agent" in chain_name.lower() and parent_run_id is None:
            # Final progress update
            await self.emit_progress(5, "Finalizing response")
            
            event = StreamEvent(
                type=EventType.REASONING_COMPLETE,
                content="Agent reasoning completed",
                metadata={
                    "agent_name": chain_name,
                    "duration_seconds": round(duration, 2)
                }
            )
            await self.emit_event(event)
        else:
            # This is a sub-chain/node
            event = self.formatter.format_node_execution(chain_name, start=False)
            await self.emit_event(event)
            
            # Only track meaningful nodes
            if chain_name != "unknown" and not chain_name.startswith("Runnable"):
                self.completed_nodes += 1
                
                # Update progress on node completion
                await self.emit_progress(details=f"Completed {chain_name}")
        
        # Clean up
        self.active_runs.pop(run_id, None)
    
    async def on_agent_action(
        self,
        action: AgentAction,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle agent action event."""
        # Emit thinking event
        event = StreamEvent(
            type=EventType.PARSING_INTENT,
            content=f"Agent decided to use: {action.tool}",
            metadata={
                "tool": action.tool,
                "tool_input": action.tool_input,
                "log": action.log
            }
        )
        await self.emit_event(event)
        
        # Update progress - moving to analysis stage
        if self.current_stage < 2:
            await self.emit_progress(2, f"Planning to use {action.tool}")
    
    async def on_agent_finish(
        self,
        finish: AgentFinish,
        *,
        run_id: UUID,
        parent_run_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> None:
        """Handle agent finish event."""
        # Emit synthesizing event
        event = StreamEvent(
            type=EventType.SYNTHESIZING,
            content="Agent synthesizing final answer...",
            metadata={
                "return_values": finish.return_values
            }
        )
        await self.emit_event(event)
        
        # Update progress to synthesis stage
        await self.emit_progress(4, "Preparing final response")


class StreamingEventIterator:
    """Iterator for streaming events from a callback handler."""
    
    def __init__(self, callback_handler: StreamingCallbackHandler, timeout: float = 30.0):
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
    
    async def __aiter__(self) -> AsyncIterator[StreamEvent]:
        """Async iterator for streaming events."""
        while not self._done:
            try:
                # Wait for event with timeout
                event = await asyncio.wait_for(
                    self.callback_handler.get_event(),
                    timeout=self.timeout
                )
                yield event
            except asyncio.TimeoutError:
                # No more events within timeout, assume done
                break
            except Exception as e:
                # Emit error event and stop
                error_event = EventFormatter.format_error(str(e), "streaming_error")
                yield error_event
                break
