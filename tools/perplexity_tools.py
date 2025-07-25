"""Perplexity AI tools for real-time financial market research."""

from typing import Dict, Any, Optional
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
import json


class PerplexityResearchInput(BaseModel):
    """Input schema for Perplexity financial research tool."""
    query: str = Field(
        description="Natural language query about financial information",
        examples=[
            "home loan rates for 50 lakhs",
            "best ELSS funds for tax saving",
            "current FD rates in major banks",
            "gold loan interest rates comparison"
        ]
    )
    focus_area: Optional[str] = Field(
        default=None,
        description="Specific area to focus on: loans, investments, tax, insurance, banking, market_trends"
    )
    recency: Optional[str] = Field(
        default="week",
        description="How recent the information should be: day, week, month, year"
    )


class FinancialResearchTool(BaseTool):
    """
    Real-time financial market research tool using Perplexity AI.
    
    Capabilities:
    - Current market rates (loans, deposits, investments)
    - Financial product comparisons across providers
    - Investment recommendations and analysis
    - Tax planning strategies
    - Financial regulations and compliance
    - Market trends and news
    - Economic indicators
    """
    
    name: str = "financial_research"
    description: str = """Search for real-time financial information including:
    - Loan rates (home, personal, car, education)
    - Investment options (mutual funds, stocks, bonds)
    - Tax planning strategies
    - Insurance products
    - Banking products (FD, RD, savings)
    - Market trends and analysis
    - Financial regulations
    
    Returns complete Perplexity response with answer, citations, and related questions."""
    
    args_schema: type[BaseModel] = PerplexityResearchInput
    perplexity_client: Any = Field(exclude=True)
    
    def _run(self, query: str, focus_area: Optional[str] = None, recency: Optional[str] = "week") -> str:
        """Execute the financial research query."""
        try:
            # Call Perplexity API
            result = self.perplexity_client.search(
                query=query,
                model="sonar-pro",
                max_tokens=500,
                temperature=0.1,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter=recency
            )
            
            # Return complete response as JSON string
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "status": "failed"
            })
    
    async def _arun(self, query: str, focus_area: Optional[str] = None, recency: Optional[str] = "week") -> str:
        """Execute the financial research query asynchronously."""
        try:
            # Call Perplexity API
            result = await self.perplexity_client.search(
                query=query,
                model="sonar-pro",
                max_tokens=500,
                temperature=0.1,
                return_citations=True,
                return_related_questions=True,
                search_recency_filter=recency
            )
            
            # Return complete response as JSON string
            return json.dumps(result, indent=2)
            
        except Exception as e:
            return json.dumps({
                "error": str(e),
                "status": "failed"
            })


def create_perplexity_tools(perplexity_client) -> list[BaseTool]:
    """
    Create Perplexity tools with the given client.
    
    Args:
        perplexity_client: Initialized Perplexity client
        
    Returns:
        List of LangChain tools
    """
    return [
        FinancialResearchTool(perplexity_client=perplexity_client)
    ]
