"""Master Orchestrator Agent that coordinates all other agents."""

from typing import Dict, List, Any, Optional, AsyncIterator
import asyncio
import json
import logging
import os
from datetime import datetime

from streaming import make_streamable, StreamingConfig
from agent.base_agent import BaseStreamableAgent
from memory.memory_schemas import InteractionHistory
from prompts.orchestrator_prompts import (
    ORCHESTRATOR_SYSTEM_PROMPT,
    PLANNING_PROMPT_TEMPLATE,
    SYNTHESIS_PROMPT_TEMPLATE
)

logger = logging.getLogger(__name__)


@make_streamable(StreamingConfig(
    progress_stages={
        1: "Understanding your question",
        2: "Analyzing requirements", 
        3: "Gathering information",
        4: "Processing insights",
        5: "Preparing response"
    },
    enable_token_streaming=True,
    enable_progress_tracking=True
))
class OrchestratorAgent(BaseStreamableAgent):
    """
    Master orchestrator that:
    1. Classifies user intent
    2. Routes to appropriate agents
    3. Manages parallel/sequential execution
    4. Synthesizes final response
    5. Maintains conversation context
    """
    
    def __init__(self, memory_manager, gemini_service, sub_agents: Dict[str, BaseStreamableAgent]):
        """
        Initialize orchestrator.
        
        Args:
            memory_manager: Memory manager instance
            gemini_service: Gemini LLM service
            sub_agents: Dictionary of agent_name -> agent instance
        """
        super().__init__(
            name="orchestrator",
            memory_manager=memory_manager,
            gemini_service=gemini_service,
            tools=[]  # Orchestrator doesn't need external tools
        )
        self.sub_agents = sub_agents
        self.logger = logging.getLogger(f"{__name__}.orchestrator")
    
    def get_system_prompt(self) -> str:
        """System prompt for orchestrator."""
        return ORCHESTRATOR_SYSTEM_PROMPT
    
    def get_progress_stages(self) -> Dict[int, str]:
        """Progress stages for orchestrator."""
        return {
            1: "Understanding your question",
            2: "Analyzing requirements", 
            3: "Gathering information",
            4: "Processing insights",
            5: "Preparing response"
        }
    
    def get_description(self) -> str:
        """Agent description."""
        return "Master orchestrator that coordinates all agents to provide comprehensive financial assistance"
    
    async def process(
        self, 
        query: str, 
        user_id: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main orchestration logic.
        Returns the final synthesized response.
        
        Args:
            query: User query
            user_id: User identifier
            session_id: Optional session identifier
            context: Optional additional context
            
        Returns:
            Dict with response and metadata
        """
        session_id = session_id or f"session_{datetime.now().timestamp()}"
        
        try:
            # 1. Load context from memory
            self.logger.info(f"Loading context for user {user_id}")
            user_context = await self._load_context(user_id, query)
            
            # 2. Classify intent and plan execution
            self.logger.info("Planning execution strategy")
            execution_plan = await self._plan_execution(query, user_context)
            
            # 3. Execute agents based on plan
            self.logger.info(f"Executing agents: {execution_plan['agents']}")
            agent_results = await self._execute_agents(
                query, 
                execution_plan,
                user_id,
                user_context
            )
            
            # 4. Synthesize final response
            self.logger.info("Synthesizing final response")
            final_response = await self._synthesize_response(
                query,
                agent_results,
                user_context
            )
            
            # 5. Store interaction in memory
            await self._store_interaction(
                user_id,
                session_id,
                query,
                final_response,
                execution_plan
            )
            
            return {
                "response": final_response,
                "metadata": {
                    "agents_used": execution_plan["agents"],
                    "execution_type": execution_plan["type"],
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Orchestration error: {e}", exc_info=True)
            return {
                "response": f"I apologize, but I encountered an error while processing your request. Please try again.",
                "error": str(e),
                "metadata": {
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "status": "error"
                }
            }
    
    async def _load_context(self, user_id: str, query: str) -> Dict[str, Any]:
        """Load relevant context from memory."""
        # Get user context
        user_context = await self.memory_manager.get_user_context(
            user_id=user_id,
            agent_id=self.name
        )
        
        # Search for relevant past interactions
        memory_search_limit = int(os.getenv("MEMORY_SEARCH_LIMIT", "10"))
        relevant_memories = await self.memory_manager.mem0_client.search_memories(
            query=query,
            user_id=user_id,
            # agent_id=self.name,  # Removed - causes Neo4j syntax error with certain queries
            limit=memory_search_limit
        )
        
        return {
            "user_profile": user_context.dict(),
            "relevant_memories": relevant_memories,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _plan_execution(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Plan which agents to use and how to execute them.
        
        Returns:
            Dict with:
            - agents: List of agent names to use
            - type: "parallel" or "sequential"
            - reasoning: Explanation of the plan
        """
        # Safely extract context values with defaults
        user_profile = context.get('user_profile', {})
        financial_goals = user_profile.get('financial_goals', []) if isinstance(user_profile, dict) else []
        risk_tolerance = user_profile.get('risk_tolerance', 'unknown') if isinstance(user_profile, dict) else 'unknown'
        
        # Safely extract relevant memories
        relevant_memories = context.get('relevant_memories', [])
        if isinstance(relevant_memories, list):
            recent_topics = []
            for m in relevant_memories[:5]:  # Limit to 5 memories
                if isinstance(m, dict) and 'content' in m:
                    content = m.get('content', '')
                    recent_topics.append(content[:50] if isinstance(content, str) else str(content)[:50])
        else:
            recent_topics = []
        
        planning_prompt = f"""
        Analyze this query and determine which agents to use:
        
        Query: {query}
        
        User Context Summary:
        - Financial Goals: {financial_goals}
        - Risk Tolerance: {risk_tolerance}
        - Recent Topics: {recent_topics}
        
        Available Agents:
        1. financial_data - For personal financial data, transactions, spending patterns
        2. market_research - For market trends, news, external research
        3. advisory - For recommendations and financial advice
        
        Respond with a JSON object:
        {{
            "agents": ["agent1", "agent2"],
            "type": "parallel" or "sequential",
            "reasoning": "explanation"
        }}
        
        Guidelines:
        - Use parallel execution when agents don't depend on each other
        - Use sequential when one agent's output is needed by another
        - Include only necessary agents
        """
        
        try:
            # Log the planning prompt
            self.logger.debug(f"Planning prompt: {planning_prompt[:200]}...")
            
            # Check if agent is properly initialized
            if not hasattr(self, 'agent') or self.agent is None:
                self.logger.error("Agent (LLM) not properly initialized in orchestrator")
                raise ValueError("Orchestrator LLM not initialized")
            
            # Use the LLM to plan
            self.logger.info("Invoking LLM for execution planning...")
            result = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": planning_prompt}]
            })
            
            # Log the raw result
            self.logger.debug(f"LLM raw result type: {type(result)}")
            self.logger.debug(f"LLM raw result: {result}")
            
            # Handle None result
            if result is None:
                self.logger.error("LLM returned None result")
                raise ValueError("LLM returned None")
            
            # Extract response content with better error handling
            response = None
            if isinstance(result, dict):
                # Try to get messages
                messages = result.get("messages", [])
                if isinstance(messages, list) and len(messages) > 0:
                    last_message = messages[-1]
                    if hasattr(last_message, 'content'):
                        response = last_message.content
                    elif isinstance(last_message, dict) and 'content' in last_message:
                        response = last_message['content']
                    else:
                        response = str(last_message)
                # Try other possible response formats
                elif "response" in result:
                    response = result["response"]
                elif "output" in result:
                    response = result["output"]
                elif "content" in result:
                    response = result["content"]
                else:
                    # Convert the entire result to string as last resort
                    response = str(result)
            else:
                # Handle direct response format
                response = str(result)
            
            if not response:
                self.logger.error("Could not extract response from LLM result")
                raise ValueError("No response content found")
            
            self.logger.debug(f"Extracted response: {response[:200]}...")
            
            # Try to parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                plan = json.loads(json_match.group())
                # Validate the plan structure
                if not isinstance(plan.get("agents"), list) or not plan.get("type"):
                    raise ValueError("Invalid plan structure")
                self.logger.info(f"Successfully parsed execution plan: {plan}")
            else:
                # Default plan if parsing fails
                self.logger.warning("Could not parse JSON from LLM response, using default plan")
                plan = {
                    "agents": ["financial_data", "advisory"],
                    "type": "sequential",
                    "reasoning": "Using default plan - could not parse LLM response"
                }
                
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON parsing error: {e}", exc_info=True)
            plan = {
                "agents": ["financial_data", "advisory"],
                "type": "sequential",
                "reasoning": f"Using fallback plan due to JSON error: {str(e)}"
            }
        except Exception as e:
            self.logger.error(f"Error in execution planning: {type(e).__name__}: {str(e)}", exc_info=True)
            # Fallback plan
            plan = {
                "agents": ["financial_data", "advisory"],
                "type": "sequential",
                "reasoning": f"Using fallback plan due to error: {str(e)}"
            }
        
        self.logger.info(f"Final execution plan: {plan}")
        return plan
    
    async def _execute_agents(
        self, 
        query: str, 
        plan: Dict[str, Any], 
        user_id: str, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute agents based on plan (parallel or sequential)."""
        
        if plan["type"] == "parallel":
            return await self._execute_parallel(query, plan["agents"], user_id, context)
        else:
            return await self._execute_sequential(query, plan["agents"], user_id, context)
    
    async def _execute_parallel(
        self, 
        query: str, 
        agent_names: List[str], 
        user_id: str, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute agents in parallel."""
        tasks = []
        
        for agent_name in agent_names:
            if agent_name in self.sub_agents:
                agent = self.sub_agents[agent_name]
                task = agent.process(query, user_id, context)
                tasks.append((agent_name, task))
        
        # Execute all tasks in parallel
        results = {}
        for agent_name, task in tasks:
            try:
                result = await task
                results[agent_name] = result
            except Exception as e:
                self.logger.error(f"Error in {agent_name}: {e}")
                results[agent_name] = {
                    "response": f"Error in {agent_name}: {str(e)}",
                    "error": str(e)
                }
        
        return results
    
    async def _execute_sequential(
        self, 
        query: str, 
        agent_names: List[str], 
        user_id: str, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute agents sequentially, passing context forward."""
        results = {}
        accumulated_context = context.copy()
        
        for agent_name in agent_names:
            if agent_name in self.sub_agents:
                agent = self.sub_agents[agent_name]
                
                try:
                    # Add previous results to context
                    if results:
                        accumulated_context["previous_agents"] = results
                    
                    result = await agent.process(query, user_id, accumulated_context)
                    results[agent_name] = result
                    
                    # Add this agent's response to context for next agent
                    accumulated_context[f"{agent_name}_response"] = result.get("response", "")
                    
                except Exception as e:
                    self.logger.error(f"Error in {agent_name}: {e}")
                    results[agent_name] = {
                        "response": f"Error in {agent_name}: {str(e)}",
                        "error": str(e)
                    }
        
        return results
    
    async def _synthesize_response(
        self, 
        query: str, 
        agent_results: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> str:
        """
        Create coherent narrative from agent results.
        This is where the orchestrator creates the final user response.
        """
        
        # Prepare agent results summary
        results_summary = []
        for agent_name, result in agent_results.items():
            if "error" not in result:
                results_summary.append(f"{agent_name}:\n{result.get('response', 'No response')}")
        
        synthesis_prompt = f"""
        Create a comprehensive, coherent response to the user's query by synthesizing the information from different agents.
        
        User Query: {query}
        
        Agent Results:
        {chr(10).join(results_summary)}
        
        User Profile:
        - Goals: {context['user_profile'].get('financial_goals', [])}
        - Risk Tolerance: {context['user_profile'].get('risk_tolerance', 'unknown')}
        
        Guidelines:
        1. Directly address the user's question
        2. Integrate insights from all agents seamlessly
        3. Provide specific numbers and recommendations where available
        4. Maintain a helpful, professional tone
        5. If any agent encountered errors, work with available information
        6. End with actionable next steps if appropriate
        
        Create a natural, flowing response that doesn't mention the individual agents.
        """
        
        # Use LLM to synthesize
        try:
            self.logger.info("Invoking LLM for response synthesis...")
            result = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": synthesis_prompt}]
            })
            
            # Log the result
            self.logger.debug(f"Synthesis LLM result type: {type(result)}")
            self.logger.debug(f"Synthesis LLM result: {result}")
            
            # Handle None result
            if result is None:
                self.logger.error("Synthesis LLM returned None")
                return "I apologize, but I'm having trouble generating a response. Please try again."
            
            # Extract response
            if isinstance(result, dict) and "messages" in result:
                messages = result.get("messages", [])
                if messages and len(messages) > 0:
                    response = messages[-1].content
                    self.logger.info("Successfully synthesized response")
                    return response
                else:
                    self.logger.error("No messages in synthesis result")
                    return "I apologize, but I couldn't generate a proper response. Please try again."
            else:
                # Handle direct response format
                response = str(result)
                self.logger.debug(f"Direct synthesis response: {response[:200]}...")
                return response
                
        except Exception as e:
            self.logger.error(f"Error in response synthesis: {type(e).__name__}: {str(e)}")
            return f"I apologize, but I encountered an error while preparing my response: {str(e)}"
    
    async def _store_interaction(
        self,
        user_id: str,
        session_id: str,
        query: str,
        response: str,
        execution_plan: Dict[str, Any]
    ):
        """Store the interaction in memory."""
        await self.memory_manager.store_interaction(
            user_id=user_id,
            session_id=session_id,
            agent_id=self.name,
            query=query,
            response=response,
            metadata={
                "agents_used": execution_plan["agents"],
                "execution_type": execution_plan["type"],
                "reasoning": execution_plan.get("reasoning", "")
            }
        )
