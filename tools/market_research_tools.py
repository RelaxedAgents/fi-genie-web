"""Market research tools for real-time financial intelligence."""

from typing import Dict, Any, Optional
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
import json
import logging

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
    description: str = """Search for real-time financial information. Provide natural language queries for any financial topic.

Loan Research: Current interest rates, eligibility criteria, processing fees, special offers, documentation requirements, fixed vs floating rates, prepayment policies

Investment Research: Top performing options, risk assessment, expense ratios, minimum investments, tax implications, expert recommendations, historical returns

Tax Research: Applicable rates and slabs, deductions and exemptions, documentation requirements, filing procedures, recent regulation changes, tax-saving strategies

Credit Research: Credit score factors, improvement strategies, common mistakes, improvement timelines, impact analysis, monitoring services

Retirement Research: Product options (EPF, NPS, PPF), expected returns, tax benefits, withdrawal rules, inflation impact, corpus calculations

Market Research: Current trends, economic indicators, sector analysis, company information, regulatory changes

Simply ask your question naturally - the tool will find the most current and relevant information with citations."""
    
    args_schema: type[BaseModel] = MarketResearchInput
    perplexity_client: Any = Field(exclude=True)
    
    def _run(self, query: str) -> str:
        """Execute the market research query."""
        try:
            logger.info(f"🔍 MARKET RESEARCH: {query}")
            
            result = self.perplexity_client.search(
                query=query,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter="month"
            )
            
            logger.info(f"✅ PERPLEXITY RESPONSE: {len(result.get('citations', []))} citations")
            return json.dumps(result, indent=2)
            
        except Exception as e:
            logger.error(f"Market research error: {str(e)}")
            return json.dumps({"error": str(e), "status": "failed"})
    
    async def _arun(self, query: str) -> str:
        """Execute the market research query asynchronously."""
        try:
            logger.info(f"🔍 ASYNC MARKET RESEARCH: {query}")
            
            result = await self.perplexity_client.search(
                query=query,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter="month"
            )
            
            logger.info(f"✅ ASYNC PERPLEXITY RESPONSE: {len(result.get('citations', []))} citations")
            return json.dumps(result, indent=2)
            
        except Exception as e:
            logger.error(f"Async market research error: {str(e)}")
            return json.dumps({"error": str(e), "status": "failed"})


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
