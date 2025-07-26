"""LLM-friendly streaming agent for FinanceGenie."""

import asyncio
import json
import logging
from typing import Dict, Any, AsyncIterator
from datetime import datetime

from agent.finance_genie_agent import FinanceGenieAgent
from streaming.llm_friendly_callbacks import LLMFriendlyCallbackHandler, LLMFriendlyEventIterator

logger = logging.getLogger(__name__)


class LLMFriendlyStreamingAgent(FinanceGenieAgent):
    """FinanceGenie Agent with LLM-friendly streaming capabilities."""
    
    async def aquery_stream_friendly(self, query: str, gemini_service) -> AsyncIterator[Dict[str, Any]]:
        """
        Stream agent responses with LLM-generated friendly updates including progress.
        
        Args:
            query: User's query
            gemini_service: Gemini service for generating friendly updates
            
        Yields:
            Friendly update events with progress and final answer
        """
        # Create the LLM-friendly callback handler
        handler = LLMFriendlyCallbackHandler(query, gemini_service)
        
        # Start agent execution in background
        agent_task = asyncio.create_task(self._run_agent_with_callbacks(query, [handler]))
        
        # Initial friendly update
        yield {
            "type": "friendly_update",
            "content": f"I'm analyzing your question about {query[:30]}...",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "progress_percentage": 5
            }
        }
        
        # Yield events from the handler
        final_answer_sent = False
        
        # Process events until agent task is done and queue is empty
        while not agent_task.done() or not handler.event_queue.empty():
            try:
                # Get event without timeout
                logger.info("Waiting for next event...")
                event = await handler.get_event()
                
                # Check if this is the final answer
                if event.get("type") == "final_answer":
                    final_answer_sent = True
                    logger.info(f"Final answer received: {event.get('content')[:100]}...")
                    logger.info(f"FULL FINAL ANSWER IN STREAM: {event.get('content')}")
                else:
                    logger.info(f"STREAMING EVENT: {json.dumps(event, indent=2)}")
                    
                yield event
            except Exception as e:
                logger.error(f"Error in event stream: {e}")
                # Emit error event
                yield {
                    "type": "error",
                    "content": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
                break
        
        # If agent task is done but no final answer was sent, extract it from the result
        if agent_task.done() and not final_answer_sent:
            try:
                # Get the result from the completed task
                result = agent_task.result()
                logger.info(f"Agent task completed with result: {str(result)[:200]}...")
                
                # Extract final answer from result
                final_content = None
                if isinstance(result, dict):
                    if "output" in result:
                        final_content = result["output"]
                    elif "messages" in result and result["messages"]:
                        final_content = result["messages"][-1].content
                
                if final_content:
                    logger.info(f"Extracted final answer from result: {final_content[:100]}...")
                    yield {
                        "type": "final_answer",
                        "content": final_content,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    return
            except Exception as e:
                logger.error(f"Error extracting final answer from result: {e}")
        
        # If still no final answer, create a default one
        if not final_answer_sent:
            yield {
                "type": "final_answer",
                "content": "I've completed my analysis, but couldn't generate a detailed response. Please try again or rephrase your question.",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _run_agent_with_callbacks(self, query: str, callbacks: list) -> Dict[str, Any]:
        """
        Run the agent with the specified callbacks.
        
        Args:
            query: User's query
            callbacks: List of callback handlers
            
        Returns:
            Agent's response
        """
        try:
            logger.info(f"Starting agent execution for query: {query[:50]}...")
            
            # Prepare messages
            messages = [{"role": "user", "content": query}]
            
            # Get the agent
            agent = self.agent
            
            # Invoke the agent with callbacks
            result = await agent.ainvoke(
                {"messages": messages},
                config={"callbacks": callbacks}
            )
            
            logger.info(f"Agent execution completed. Result: {str(result)[:100]}...")
            return result
        except Exception as e:
            logger.error(f"Error running agent with callbacks: {e}")
            raise


def create_llm_friendly_streaming_agent(
    project_id: str, 
    location: str, 
    mcp_server_url: str, 
    phone_number: str,
    perplexity_service=None
) -> LLMFriendlyStreamingAgent:
    """
    Create a LLM-friendly streaming agent instance.
    
    Args:
        project_id: GCP project ID
        location: GCP location
        mcp_server_url: MCP server URL
        phone_number: User's phone number
        perplexity_service: Optional Perplexity service
        
    Returns:
        LLMFriendlyStreamingAgent instance
    """
    return LLMFriendlyStreamingAgent(
        project_id=project_id,
        location=location,
        mcp_server_url=mcp_server_url,
        phone_number=phone_number,
        perplexity_service=perplexity_service
    )
