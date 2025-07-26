"""Market research tools for real-time financial intelligence."""

from typing import Dict, Any, Optional
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
import json
import logging

from prompts.market_research_prompts import format_market_research_query, SAMPLE_QUERIES

logger = logging.getLogger(__name__)


class MarketResearchInput(BaseModel):
    """Input schema for market research tool."""
    query: str = Field(
        description="Natural language query about financial information. Include focus area (loans, investments, tax, etc.) and recency requirements (day, week, month, year) directly in the query.",
        type="string",
        examples=[
            "Current home loan interest rates for 50 lac loans in India from the past week",
            "Compare HDFC vs SBI home loan options for 50 lac with latest data",
            "Best mutual funds for tax saving in 2025 based on last month's performance",
            "Latest RBI regulations affecting home loans from this year",
            "Current FD rates comparison across major Indian banks from the last quarter",
            "Market outlook for real estate investment in Bangalore based on recent trends"
        ]
    )


class MarketResearchTool(BaseTool):
    """
    Real-time financial market research tool.
    
    Capabilities:
    - Current market rates (loans, deposits, investments)
    - Financial product comparisons across providers
    - Investment recommendations and analysis
    - Tax planning strategies
    - Financial regulations and compliance
    - Market trends and news
    - Economic indicators
    """
    
    name: str = "market_research"
    description: str = """Search for real-time financial information. Include focus area and recency in your query:
    - Focus areas: loans, investments, tax, insurance, banking, market_trends
    - Recency: day, week, month, year
    
    Example queries:
    - "Current home loan interest rates for 50 lac loans in India from the past week"
    - "Compare HDFC vs SBI home loan options from the last month"
    - "Best mutual funds for tax saving in 2025 based on last quarter's data"
    - "Latest RBI regulations affecting home loans from this year"
    
    Returns complete response with answer, citations, and related questions."""
    
    args_schema: type[BaseModel] = MarketResearchInput
    perplexity_client: Any = Field(exclude=True)
    
    def _run(self, query: str) -> str:
        """Execute the market research query."""
        try:
            # Log the query for debugging
            logger.info(f"Market research query: {query}")
            
            # Parse query to determine focus area and recency
            focus_area = None
            recency = "month"  # Default recency
            
            # Simple keyword detection for focus area
            lower_query = query.lower()
            if any(word in lower_query for word in ["loan", "emi", "interest rate", "mortgage"]):
                focus_area = "loans"
                enhanced_query = format_market_research_query("loan", loan_type=query.split()[0], loan_amount="50 lac", recency=recency)
            elif any(word in lower_query for word in ["mutual fund", "stock", "investment", "equity", "bond"]):
                focus_area = "investments"
                enhanced_query = format_market_research_query("investment", investment_type=query.split()[0], goal="wealth creation", recency=recency)
            elif any(word in lower_query for word in ["tax", "income tax", "gst", "deduction", "exemption"]):
                focus_area = "tax"
                enhanced_query = format_market_research_query("tax", financial_action=query, recency=recency)
            elif any(word in lower_query for word in ["credit score", "cibil", "credit card"]):
                focus_area = "credit"
                enhanced_query = format_market_research_query("credit", recency=recency)
            elif any(word in lower_query for word in ["retirement", "pension", "epf", "nps", "ppf"]):
                focus_area = "retirement"
                enhanced_query = format_market_research_query("retirement", recency=recency)
            else:
                # No specific focus area detected, use query as is
                enhanced_query = query
            
            # Parse recency from query if present
            if "past day" in lower_query or "last day" in lower_query or "today" in lower_query:
                recency = "day"
            elif "past week" in lower_query or "last week" in lower_query:
                recency = "week"
            elif "past month" in lower_query or "last month" in lower_query:
                recency = "month"
            elif "past year" in lower_query or "last year" in lower_query:
                recency = "year"
                
            logger.info(f"Detected focus area: {focus_area}, recency: {recency}")
            logger.info(f"Enhanced query: {enhanced_query}")
            
            # Log before API call
            logger.info(f"Calling Perplexity API with query: {enhanced_query[:100]}...")
            
            # Call Perplexity API
            result = self.perplexity_client.search(
                query=enhanced_query,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter=recency
            )
            
            # Log response received
            logger.info(f"Received Perplexity API response with {len(result.get('citations', []))} citations")
            
            # Return complete response as JSON string
            return json.dumps(result, indent=2)
            
        except Exception as e:
            logger.error(f"Error in market research: {str(e)}")
            return json.dumps({
                "error": str(e),
                "status": "failed"
            })
    
    async def _arun(self, query: str) -> str:
        """Execute the market research query asynchronously."""
        try:
            # Log the query for debugging
            logger.info(f"Async market research query: {query}")
            
            # Parse query to determine focus area and recency
            focus_area = None
            recency = "month"  # Default recency
            
            # Simple keyword detection for focus area
            lower_query = query.lower()
            if any(word in lower_query for word in ["loan", "emi", "interest rate", "mortgage"]):
                focus_area = "loans"
                enhanced_query = format_market_research_query("loan", loan_type=query.split()[0], loan_amount="50 lac", recency=recency)
            elif any(word in lower_query for word in ["mutual fund", "stock", "investment", "equity", "bond"]):
                focus_area = "investments"
                enhanced_query = format_market_research_query("investment", investment_type=query.split()[0], goal="wealth creation", recency=recency)
            elif any(word in lower_query for word in ["tax", "income tax", "gst", "deduction", "exemption"]):
                focus_area = "tax"
                enhanced_query = format_market_research_query("tax", financial_action=query, recency=recency)
            elif any(word in lower_query for word in ["credit score", "cibil", "credit card"]):
                focus_area = "credit"
                enhanced_query = format_market_research_query("credit", recency=recency)
            elif any(word in lower_query for word in ["retirement", "pension", "epf", "nps", "ppf"]):
                focus_area = "retirement"
                enhanced_query = format_market_research_query("retirement", recency=recency)
            else:
                # No specific focus area detected, use query as is
                enhanced_query = query
            
            # Parse recency from query if present
            if "past day" in lower_query or "last day" in lower_query or "today" in lower_query:
                recency = "day"
            elif "past week" in lower_query or "last week" in lower_query:
                recency = "week"
            elif "past month" in lower_query or "last month" in lower_query:
                recency = "month"
            elif "past year" in lower_query or "last year" in lower_query:
                recency = "year"
                
            logger.info(f"Detected focus area: {focus_area}, recency: {recency}")
            logger.info(f"Enhanced query: {enhanced_query}")
            
            # Log before API call
            logger.info(f"Async calling Perplexity API with query: {enhanced_query[:100]}...")
            
            # Call Perplexity API
            result = await self.perplexity_client.search(
                query=enhanced_query,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter=recency
            )
            
            # Log response received
            logger.info(f"Received async Perplexity API response with {len(result.get('citations', []))} citations")
            
            # Return complete response as JSON string
            return json.dumps(result, indent=2)
            
        except Exception as e:
            logger.error(f"Error in async market research: {str(e)}")
            return json.dumps({
                "error": str(e),
                "status": "failed"
            })


def create_market_research_tools(perplexity_client) -> list[BaseTool]:
    """
    Create market research tools with the given client.
    
    Args:
        perplexity_client: Initialized Perplexity client
        
    Returns:
        List of LangChain tools
    """
    tools = [
        MarketResearchTool(perplexity_client=perplexity_client)
    ]
    
    logger.info(f"Created {len(tools)} market research tools")
    return tools
