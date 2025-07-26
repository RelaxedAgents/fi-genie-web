"""Market Research Agent for external market data and trends."""

from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime

from streaming import make_streamable, StreamingConfig
from agent.base_agent import BaseStreamableAgent
from tools.perplexity_tools import create_perplexity_tools
from prompts.market_research_prompts import MARKET_RESEARCH_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


@make_streamable(StreamingConfig(
    progress_stages={
        1: "Analyzing research query",
        2: "Searching market sources",
        3: "Gathering information",
        4: "Evaluating findings", 
        5: "Synthesizing results",
        6: "Preparing insights"
    },
    enable_token_streaming=True,
    enable_progress_tracking=True,
    enable_tool_tracking=True
))
class MarketResearchAgent(BaseStreamableAgent):
    """
    Specializes in:
    - Market trends and analysis
    - Financial news and updates
    - Company research
    - Economic indicators
    - Investment opportunities research
    """
    
    def __init__(self, memory_manager, gemini_service, perplexity_client):
        """
        Initialize market research agent.
        
        Args:
            memory_manager: Memory manager instance
            gemini_service: Gemini LLM service
            perplexity_client: Perplexity client for research
        """
        # Create Perplexity tools
        perplexity_tools = create_perplexity_tools(perplexity_client)
        
        super().__init__(
            name="market_research",
            memory_manager=memory_manager,
            gemini_service=gemini_service,
            tools=perplexity_tools
        )
        
        self.perplexity_client = perplexity_client
        self.logger = logging.getLogger(f"{__name__}.market_research")
    
    def get_system_prompt(self) -> str:
        """System prompt for market research agent."""
        return MARKET_RESEARCH_SYSTEM_PROMPT
    
    def get_progress_stages(self) -> Dict[int, str]:
        """Progress stages for market research agent."""
        return {
            1: "Analyzing research query",
            2: "Searching market sources",
            3: "Gathering information",
            4: "Evaluating findings", 
            5: "Synthesizing results",
            6: "Preparing insights"
        }
    
    def get_description(self) -> str:
        """Agent description."""
        return "Market research specialist that analyzes trends, news, and provides external market insights"
    
    async def process(
        self, 
        query: str, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process market research request.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context from orchestrator
            
        Returns:
            Dict with research results
        """
        try:
            # Determine research focus
            research_focus = self._determine_research_focus(query, context)
            
            # Prepare research prompt
            research_prompt = self._prepare_research_prompt(query, context, research_focus)
            
            # Run the agent with tools
            result = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": research_prompt}]
            })
            
            # Extract response and tool usage
            response = result.get("messages", [])[-1].content if result.get("messages") else ""
            tools_used = self._extract_tools_used(result)
            
            # Extract key insights
            insights = self._extract_insights(response)
            
            # Store significant market insights
            if insights:
                for insight in insights:
                    await self._store_market_insight(user_id, insight)
            
            return {
                "response": response,
                "tools_used": tools_used,
                "insights": insights,
                "metadata": {
                    "agent": self.name,
                    "research_focus": research_focus,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in market research: {e}")
            return await super().process(query, user_id, context)
    
    def _determine_research_focus(self, query: str, context: Optional[Dict[str, Any]]) -> List[str]:
        """Determine research focus areas based on query."""
        query_lower = query.lower()
        focus_areas = []
        
        # Market trends
        if any(word in query_lower for word in ["market", "trend", "outlook", "forecast"]):
            focus_areas.append("market_trends")
        
        # Company/stock specific
        if any(word in query_lower for word in ["stock", "company", "share", "equity"]):
            focus_areas.append("company_analysis")
        
        # Economic indicators
        if any(word in query_lower for word in ["economy", "inflation", "gdp", "interest rate", "fed"]):
            focus_areas.append("economic_indicators")
        
        # Sector analysis
        if any(word in query_lower for word in ["sector", "industry", "tech", "finance", "healthcare"]):
            focus_areas.append("sector_analysis")
        
        # Investment opportunities
        if any(word in query_lower for word in ["opportunity", "invest", "growth", "potential"]):
            focus_areas.append("opportunities")
        
        # News and events
        if any(word in query_lower for word in ["news", "update", "announcement", "event"]):
            focus_areas.append("news")
        
        # Default to general market research
        if not focus_areas:
            focus_areas = ["market_trends", "news"]
        
        return focus_areas
    
    def _prepare_research_prompt(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]], 
        research_focus: List[str]
    ) -> str:
        """Prepare research prompt with context."""
        prompt_parts = [f"User Query: {query}"]
        
        # Add user context if available
        if context and context.get("user_context"):
            user_profile = context["user_context"].get("user_profile", {})
            if user_profile.get("financial_goals"):
                prompt_parts.append(f"\nUser's Financial Goals: {user_profile['financial_goals']}")
            if user_profile.get("risk_tolerance"):
                prompt_parts.append(f"Risk Tolerance: {user_profile['risk_tolerance']}")
            if user_profile.get("investment_experience"):
                prompt_parts.append(f"Investment Experience: {user_profile['investment_experience']}")
        
        # Add research instructions based on focus
        prompt_parts.append("\nResearch Instructions:")
        
        if "market_trends" in research_focus:
            prompt_parts.append("""
- Search for current market trends and conditions
- Look for recent market performance data
- Identify key factors driving market movements
- Consider both short-term and long-term trends
""")
        
        if "company_analysis" in research_focus:
            prompt_parts.append("""
- Research specific companies mentioned or relevant to the query
- Look for recent financial performance
- Check analyst ratings and price targets
- Identify competitive advantages and risks
""")
        
        if "economic_indicators" in research_focus:
            prompt_parts.append("""
- Search for relevant economic data and indicators
- Look for recent Fed decisions or policy changes
- Check inflation data, employment figures, GDP growth
- Analyze impact on markets and investments
""")
        
        if "sector_analysis" in research_focus:
            prompt_parts.append("""
- Research sector-specific trends and performance
- Identify leading companies in the sector
- Look for sector rotation patterns
- Check for regulatory or technological changes
""")
        
        if "opportunities" in research_focus:
            prompt_parts.append("""
- Search for emerging investment opportunities
- Look for undervalued assets or growth sectors
- Consider risk-reward profiles
- Align with user's goals and risk tolerance
""")
        
        if "news" in research_focus:
            prompt_parts.append("""
- Search for recent financial news and updates
- Focus on market-moving events
- Look for earnings reports, M&A activity, policy changes
- Prioritize news from the last 7-30 days
""")
        
        prompt_parts.append("""
Remember to:
1. Use perplexity_search for current market information
2. Check memory for relevant past research
3. Provide specific data and statistics
4. Store important insights for future reference
5. Share critical findings with other agents if needed
""")
        
        return "\n".join(prompt_parts)
    
    def _extract_insights(self, response: str) -> List[Dict[str, Any]]:
        """Extract key insights from research response."""
        insights = []
        
        # Keywords that indicate important insights
        insight_indicators = [
            "significant", "important", "key finding", "notable", "trend",
            "opportunity", "risk", "recommendation", "outlook", "forecast"
        ]
        
        sentences = response.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower().strip()
            
            # Check if sentence contains insight indicators
            if any(indicator in sentence_lower for indicator in insight_indicators):
                # Categorize the insight
                insight_type = "general"
                if any(word in sentence_lower for word in ["opportunity", "growth", "potential"]):
                    insight_type = "opportunity"
                elif any(word in sentence_lower for word in ["risk", "concern", "warning"]):
                    insight_type = "risk"
                elif any(word in sentence_lower for word in ["trend", "pattern", "movement"]):
                    insight_type = "trend"
                
                insights.append({
                    "type": insight_type,
                    "content": sentence.strip(),
                    "confidence": 0.85
                })
        
        return insights[:5]  # Limit to top 5 insights
    
    async def _store_market_insight(self, user_id: str, insight: Dict[str, Any]):
        """Store market insight in memory."""
        try:
            # Store the insight
            await self.memory_manager.mem0_client.create_memory(
                messages=[{
                    "role": "system",
                    "content": f"Market Insight ({insight['type']}): {insight['content']}"
                }],
                user_id=user_id,
                agent_id=self.name,
                metadata={
                    "type": "market_insight",
                    "insight_type": insight["type"],
                    "confidence": insight.get("confidence", 0.85),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Share important insights with other agents
            if insight["type"] in ["opportunity", "risk"] and insight.get("confidence", 0.85) > 0.8:
                await self.share_insight_with_agents(
                    content=f"Market {insight['type']}: {insight['content']}",
                    target_agents=["orchestrator", "advisory"],
                    user_id=user_id,
                    insight_type=f"market_{insight['type']}",
                    confidence=insight.get("confidence", 0.85)
                )
                
        except Exception as e:
            self.logger.error(f"Error storing market insight: {e}")
