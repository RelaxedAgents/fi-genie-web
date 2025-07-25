"""Advisory Agent for personalized financial recommendations."""

from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime

from streaming import make_streamable, StreamingConfig
from agent.base_agent import BaseStreamableAgent
from prompts.advisory_prompts import ADVISORY_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


@make_streamable(StreamingConfig(
    progress_stages={
        1: "Analyzing financial situation",
        2: "Reviewing goals and preferences",
        3: "Evaluating options",
        4: "Formulating recommendations",
        5: "Personalizing advice",
        6: "Finalizing guidance"
    },
    enable_token_streaming=True,
    enable_progress_tracking=True
))
class AdvisoryAgent(BaseStreamableAgent):
    """
    Specializes in:
    - Personalized financial recommendations
    - Investment advice
    - Budgeting strategies
    - Risk assessment
    - Goal-based planning
    """
    
    def __init__(self, memory_manager, gemini_service):
        """
        Initialize advisory agent.
        
        Args:
            memory_manager: Memory manager instance
            gemini_service: Gemini LLM service
        """
        super().__init__(
            name="advisory",
            memory_manager=memory_manager,
            gemini_service=gemini_service,
            tools=[]  # Advisory agent relies on memory tools and synthesis
        )
        
        self.logger = logging.getLogger(f"{__name__}.advisory")
    
    def get_system_prompt(self) -> str:
        """System prompt for advisory agent."""
        return ADVISORY_SYSTEM_PROMPT
    
    def get_progress_stages(self) -> Dict[int, str]:
        """Progress stages for advisory agent."""
        return {
            1: "Analyzing financial situation",
            2: "Reviewing goals and preferences",
            3: "Evaluating options",
            4: "Formulating recommendations",
            5: "Personalizing advice",
            6: "Finalizing guidance"
        }
    
    def get_description(self) -> str:
        """Agent description."""
        return "Financial advisor that provides personalized recommendations and strategic guidance"
    
    async def process(
        self, 
        query: str, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process advisory request.
        
        Args:
            query: User query
            user_id: User identifier
            context: Optional context from orchestrator
            
        Returns:
            Dict with advisory recommendations
        """
        try:
            # Determine advice type needed
            advice_type = self._determine_advice_type(query, context)
            
            # Prepare advisory prompt with full context
            advisory_prompt = self._prepare_advisory_prompt(query, context, advice_type)
            
            # Run the agent
            result = await self.agent.ainvoke({
                "messages": [{"role": "user", "content": advisory_prompt}]
            })
            
            # Extract response
            response = result.get("messages", [])[-1].content if result.get("messages") else ""
            tools_used = self._extract_tools_used(result)
            
            # Extract recommendations
            recommendations = self._extract_recommendations(response)
            
            # Store important recommendations
            if recommendations:
                await self._store_recommendations(user_id, recommendations, advice_type)
            
            return {
                "response": response,
                "tools_used": tools_used,
                "recommendations": recommendations,
                "metadata": {
                    "agent": self.name,
                    "advice_type": advice_type,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in advisory process: {e}")
            return await super().process(query, user_id, context)
    
    def _determine_advice_type(self, query: str, context: Optional[Dict[str, Any]]) -> List[str]:
        """Determine type of advice needed."""
        query_lower = query.lower()
        advice_types = []
        
        # Investment advice
        if any(word in query_lower for word in ["invest", "portfolio", "stock", "fund", "asset allocation"]):
            advice_types.append("investment")
        
        # Budgeting advice
        if any(word in query_lower for word in ["budget", "save", "spend", "expense", "cut costs"]):
            advice_types.append("budgeting")
        
        # Debt management
        if any(word in query_lower for word in ["debt", "loan", "credit card", "pay off", "refinance"]):
            advice_types.append("debt_management")
        
        # Retirement planning
        if any(word in query_lower for word in ["retire", "401k", "ira", "pension", "future"]):
            advice_types.append("retirement")
        
        # Goal planning
        if any(word in query_lower for word in ["goal", "plan", "achieve", "target", "milestone"]):
            advice_types.append("goal_planning")
        
        # Risk management
        if any(word in query_lower for word in ["risk", "insurance", "protect", "emergency"]):
            advice_types.append("risk_management")
        
        # General advice if no specific type
        if not advice_types:
            advice_types = ["general"]
        
        return advice_types
    
    def _prepare_advisory_prompt(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]], 
        advice_type: List[str]
    ) -> str:
        """Prepare comprehensive advisory prompt."""
        prompt_parts = [f"User Query: {query}"]
        
        # Add financial data context if available
        if context and context.get("financial_data_response"):
            prompt_parts.append(f"\nFinancial Data Analysis:\n{context['financial_data_response']}")
        
        # Add market research context if available
        if context and context.get("market_research_response"):
            prompt_parts.append(f"\nMarket Research Insights:\n{context['market_research_response']}")
        
        # Add user profile context
        if context and context.get("user_context"):
            user_profile = context["user_context"].get("user_profile", {})
            if user_profile:
                prompt_parts.append("\nUser Profile:")
                if user_profile.get("financial_goals"):
                    prompt_parts.append(f"- Goals: {user_profile['financial_goals']}")
                if user_profile.get("risk_tolerance"):
                    prompt_parts.append(f"- Risk Tolerance: {user_profile['risk_tolerance']}")
                if user_profile.get("investment_experience"):
                    prompt_parts.append(f"- Experience: {user_profile['investment_experience']}")
        
        # Add specific advisory instructions
        prompt_parts.append("\nAdvisory Focus Areas:")
        
        if "investment" in advice_type:
            prompt_parts.append("""
Investment Advice:
- Recommend appropriate investment strategies
- Suggest asset allocation based on risk profile
- Consider diversification opportunities
- Align with user's time horizon and goals
""")
        
        if "budgeting" in advice_type:
            prompt_parts.append("""
Budgeting Advice:
- Analyze spending patterns from financial data
- Suggest realistic budget allocations
- Identify areas for cost reduction
- Recommend savings strategies
""")
        
        if "debt_management" in advice_type:
            prompt_parts.append("""
Debt Management:
- Prioritize debt repayment strategies
- Suggest refinancing opportunities if applicable
- Balance debt payment with other financial goals
- Consider debt consolidation options
""")
        
        if "retirement" in advice_type:
            prompt_parts.append("""
Retirement Planning:
- Calculate retirement savings needs
- Recommend contribution strategies
- Suggest appropriate retirement accounts
- Consider tax-advantaged options
""")
        
        if "goal_planning" in advice_type:
            prompt_parts.append("""
Goal Achievement:
- Break down goals into actionable steps
- Create realistic timelines
- Suggest milestone checkpoints
- Align strategies with multiple goals
""")
        
        if "risk_management" in advice_type:
            prompt_parts.append("""
Risk Management:
- Assess current risk exposure
- Recommend appropriate insurance coverage
- Suggest emergency fund targets
- Balance risk across portfolio
""")
        
        prompt_parts.append("""
Remember to:
1. Use get_user_context to understand the complete picture
2. Search memory for relevant patterns and past advice
3. Provide specific, numbered recommendations
4. Include concrete action steps
5. Store important recommendations for future reference
6. Consider the holistic financial picture
7. Be encouraging but realistic
""")
        
        return "\n".join(prompt_parts)
    
    def _extract_recommendations(self, response: str) -> List[Dict[str, Any]]:
        """Extract specific recommendations from response."""
        recommendations = []
        
        # Look for numbered recommendations
        lines = response.split('\n')
        current_rec = None
        
        for line in lines:
            line = line.strip()
            
            # Check for numbered items (1., 2., etc.) or bullet points
            if line and (line[0].isdigit() and '.' in line[:3] or line.startswith('-')):
                if current_rec:
                    recommendations.append(current_rec)
                
                # Extract the recommendation text
                if line[0].isdigit():
                    rec_text = line.split('.', 1)[1].strip() if '.' in line else line
                else:
                    rec_text = line[1:].strip()
                
                # Categorize recommendation
                rec_type = self._categorize_recommendation(rec_text)
                
                current_rec = {
                    "text": rec_text,
                    "type": rec_type,
                    "priority": len(recommendations) + 1
                }
            elif current_rec and line:
                # Add to current recommendation if it's a continuation
                current_rec["text"] += f" {line}"
        
        # Add last recommendation
        if current_rec:
            recommendations.append(current_rec)
        
        return recommendations[:10]  # Limit to top 10 recommendations
    
    def _categorize_recommendation(self, text: str) -> str:
        """Categorize a recommendation based on its content."""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["invest", "portfolio", "stock", "fund"]):
            return "investment"
        elif any(word in text_lower for word in ["budget", "save", "spend", "expense"]):
            return "budgeting"
        elif any(word in text_lower for word in ["debt", "loan", "credit", "pay off"]):
            return "debt"
        elif any(word in text_lower for word in ["retire", "401k", "ira"]):
            return "retirement"
        elif any(word in text_lower for word in ["emergency", "insurance", "protect"]):
            return "risk"
        else:
            return "general"
    
    async def _store_recommendations(
        self, 
        user_id: str, 
        recommendations: List[Dict[str, Any]], 
        advice_type: List[str]
    ):
        """Store important recommendations in memory."""
        try:
            # Create a summary of recommendations
            rec_summary = f"Advisory recommendations ({', '.join(advice_type)}): "
            rec_summary += "; ".join([f"{r['priority']}. {r['text'][:100]}..." for r in recommendations[:3]])
            
            # Store in memory
            await self.memory_manager.mem0_client.create_memory(
                messages=[{
                    "role": "system",
                    "content": rec_summary
                }],
                user_id=user_id,
                agent_id=self.name,
                metadata={
                    "type": "recommendation",
                    "advice_type": advice_type,
                    "recommendation_count": len(recommendations),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Share high-priority recommendations
            if recommendations and recommendations[0]["priority"] == 1:
                await self.share_insight_with_agents(
                    content=f"Top recommendation: {recommendations[0]['text']}",
                    target_agents=["orchestrator"],
                    user_id=user_id,
                    insight_type="recommendation",
                    confidence=0.9
                )
                
        except Exception as e:
            self.logger.error(f"Error storing recommendations: {e}")
