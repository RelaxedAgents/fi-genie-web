"""Financial Data Agent for accessing and analyzing personal financial data."""

from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime

from streaming import make_streamable, StreamingConfig
from agent.base_agent import BaseStreamableAgent
from tools.fi_mcp_tools import create_mcp_tools
from prompts.financial_data_prompts import FINANCIAL_DATA_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


@make_streamable(StreamingConfig(
    progress_stages={
        1: "Accessing financial data",
        2: "Analyzing transactions",
        3: "Calculating metrics",
        4: "Identifying patterns",
        5: "Generating insights"
    },
    enable_token_streaming=True,
    enable_progress_tracking=True,
    enable_tool_tracking=True
))
class FinancialDataAgent(BaseStreamableAgent):
    """
    Specializes in:
    - Personal financial data retrieval
    - Transaction analysis
    - Pattern detection
    - Anomaly identification
    - Financial metrics calculation
    """
    
    def __init__(self, memory_manager, gemini_service, mcp_client):
        """
        Initialize financial data agent.
        
        Args:
            memory_manager: Memory manager instance
            gemini_service: Gemini LLM service
            mcp_client: MCP client for Fi tools
        """
        # Create Fi MCP tools
        fi_tools = create_mcp_tools(mcp_client)
        
        super().__init__(
            name="financial_data",
            memory_manager=memory_manager,
            gemini_service=gemini_service,
            tools=fi_tools
        )
        
        self.mcp_client = mcp_client
        self.logger = logging.getLogger(f"{__name__}.financial_data")
        
        # Log available tools for debugging
        self.logger.info(f"Initialized with {len(fi_tools)} MCP tools: {[tool.name for tool in fi_tools]}")
    
    def get_system_prompt(self) -> str:
        """System prompt for financial data agent."""
        return FINANCIAL_DATA_SYSTEM_PROMPT
    
    def get_progress_stages(self) -> Dict[int, str]:
        """Progress stages for financial data agent."""
        return {
            1: "Accessing financial data",
            2: "Analyzing transactions",
            3: "Calculating metrics",
            4: "Identifying patterns",
            5: "Generating insights"
        }
    
    def get_description(self) -> str:
        """Agent description."""
        return "Financial data specialist that analyzes personal finances, transactions, and spending patterns"
    
    async def process(
        self, 
        query: str, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process financial data request.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context from orchestrator
            
        Returns:
            Dict with analysis results
        """
        self.logger.info(f"🔥 FINANCIAL_DATA_AGENT process CALLED: query='{query}', user_id='{user_id}'")
        self.logger.info(f"🔥 FINANCIAL_DATA_AGENT available tools: {[tool.name for tool in self.tools]}")
        
        try:
            # Check if we need to analyze specific aspects
            analysis_focus = self._determine_analysis_focus(query, context)
            self.logger.info(f"🔥 FINANCIAL_DATA_AGENT analysis focus: {analysis_focus}")
            
            # Prepare the analysis prompt
            analysis_prompt = self._prepare_analysis_prompt(query, context, analysis_focus)
            self.logger.debug(f"🔥 FINANCIAL_DATA_AGENT analysis prompt: {analysis_prompt[:200]}...")
            
            # Run the agent with tools
            self.logger.info(f"🔥 FINANCIAL_DATA_AGENT invoking LLM with tools...")
            result = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": analysis_prompt}]
            })
            
            self.logger.info(f"🔥 FINANCIAL_DATA_AGENT LLM result: {result}")
            
            # Extract response and tool usage
            response = result.get("messages", [])[-1].content if result.get("messages") else ""
            tools_used = self._extract_tools_used(result)
            
            self.logger.info(f"🔥 FINANCIAL_DATA_AGENT tools used: {tools_used}")
            self.logger.info(f"🔥 FINANCIAL_DATA_AGENT response: {response[:200]}...")
            
            # Extract any patterns detected
            patterns = self._extract_patterns(response)
            
            # Store significant patterns
            if patterns:
                for pattern in patterns:
                    await self._store_pattern(user_id, pattern)
            
            return {
                "response": response,
                "tools_used": tools_used,
                "patterns": patterns,
                "metadata": {
                    "agent": self.name,
                    "analysis_focus": analysis_focus,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"🔥 FINANCIAL_DATA_AGENT ERROR in financial data analysis: {e}", exc_info=True)
            return await super().process(query, user_id, context)
    
    def _determine_analysis_focus(self, query: str, context: Optional[Dict[str, Any]]) -> List[str]:
        """Determine what aspects to focus on based on query."""
        query_lower = query.lower()
        focus_areas = []
        
        # Check for specific keywords
        if any(word in query_lower for word in ["spend", "expense", "transaction", "purchase"]):
            focus_areas.append("transactions")
        
        if any(word in query_lower for word in ["worth", "asset", "liability", "balance"]):
            focus_areas.append("net_worth")
        
        if any(word in query_lower for word in ["credit", "score", "loan"]):
            focus_areas.append("credit")
        
        if any(word in query_lower for word in ["invest", "portfolio", "stock", "mutual fund"]):
            focus_areas.append("investments")
        
        if any(word in query_lower for word in ["pattern", "trend", "habit"]):
            focus_areas.append("patterns")
        
        # Default to comprehensive analysis if no specific focus
        if not focus_areas:
            focus_areas = ["transactions", "patterns"]
        
        return focus_areas
    
    def _prepare_analysis_prompt(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]], 
        analysis_focus: List[str]
    ) -> str:
        """Prepare the analysis prompt with context."""
        prompt_parts = [f"User Query: {query}"]
        
        # Add context if available
        if context:
            if context.get("user_context"):
                user_profile = context["user_context"].get("user_profile", {})
                if user_profile.get("financial_goals"):
                    prompt_parts.append(f"\nUser's Financial Goals: {user_profile['financial_goals']}")
                if user_profile.get("risk_tolerance"):
                    prompt_parts.append(f"Risk Tolerance: {user_profile['risk_tolerance']}")
        
        # Add analysis instructions based on focus
        prompt_parts.append("\nAnalysis Instructions:")
        
        if "transactions" in analysis_focus:
            prompt_parts.append("""
- Fetch recent transactions (last 30-60 days)
- Analyze spending by category
- Identify top spending categories
- Look for unusual or high-value transactions
""")
        
        if "net_worth" in analysis_focus:
            prompt_parts.append("""
- Fetch current net worth breakdown
- Analyze asset vs liability distribution
- Compare with historical data if available in memory
""")
        
        if "patterns" in analysis_focus:
            prompt_parts.append("""
- Search memory for existing patterns
- Identify new spending or saving patterns
- Look for recurring transactions
- Store any significant patterns found
""")
        
        if "credit" in analysis_focus:
            prompt_parts.append("""
- Fetch credit report and score
- Analyze credit utilization
- Identify factors affecting credit score
""")
        
        if "investments" in analysis_focus:
            prompt_parts.append("""
- Fetch investment portfolio
- Analyze asset allocation
- Calculate returns if possible
- Assess diversification
""")
        
        prompt_parts.append("""
CRITICAL: After using tools and storing insights, provide a comprehensive final response that:

1. Directly answers the user's question with specific data
2. Includes detailed breakdown with numbers and percentages
3. Explains factors and implications clearly
4. Provides actionable recommendations
5. Is comprehensive (minimum 800 characters)

Your FINAL response will be sent directly to the user - make it complete and detailed.
Do NOT end with meta-commentary like "I've stored insights" or "Let me know if you have questions."

Remember to:
1. Use specific tools to fetch data
2. Provide concrete numbers and percentages
3. Store important insights and patterns
4. Share significant findings with other agents if needed
5. End with a comprehensive analysis as your final response
""")
        
        return "\n".join(prompt_parts)
    
    def _extract_patterns(self, response: str) -> List[Dict[str, Any]]:
        """Extract detected patterns from the response."""
        patterns = []
        
        # Simple pattern extraction based on keywords
        # In a real implementation, this would be more sophisticated
        response_lower = response.lower()
        
        pattern_keywords = {
            "spending": ["spending pattern", "expense pattern", "spending habit"],
            "saving": ["saving pattern", "savings trend", "saving habit"],
            "recurring": ["recurring", "subscription", "regular payment"],
            "anomaly": ["unusual", "anomaly", "spike", "unexpected"]
        }
        
        for pattern_type, keywords in pattern_keywords.items():
            if any(keyword in response_lower for keyword in keywords):
                # Extract the sentence containing the pattern
                sentences = response.split('.')
                for sentence in sentences:
                    if any(keyword in sentence.lower() for keyword in keywords):
                        patterns.append({
                            "type": pattern_type,
                            "description": sentence.strip(),
                            "confidence": 0.8  # Default confidence
                        })
                        break
        
        return patterns
    
    async def _store_pattern(self, user_id: str, pattern: Dict[str, Any]):
        """Store a detected pattern in memory."""
        try:
            from memory.memory_schemas import FinancialPattern
            
            financial_pattern = FinancialPattern(
                pattern_type=pattern["type"],
                description=pattern["description"],
                confidence=pattern.get("confidence", 0.8),
                first_detected=datetime.now(),
                last_observed=datetime.now()
            )
            
            await self.memory_manager.store_pattern(
                user_id=user_id,
                agent_id=self.name,
                pattern=financial_pattern
            )
            
            # Share high-confidence patterns with other agents
            if pattern.get("confidence", 0.8) > 0.8:
                await self.share_insight_with_agents(
                    content=f"Detected {pattern['type']} pattern: {pattern['description']}",
                    target_agents=["orchestrator", "advisory"],
                    user_id=user_id,
                    insight_type="pattern",
                    confidence=pattern.get("confidence", 0.8)
                )
                
        except Exception as e:
            self.logger.error(f"Error storing pattern: {e}")
