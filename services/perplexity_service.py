"""Perplexity API service for market research."""

import os
import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
import logging
import json

logger = logging.getLogger(__name__)


class PerplexityService:
    """Service for interacting with Perplexity API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Perplexity service.
        
        Args:
            api_key: Perplexity API key (uses env var if not provided)
        """
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("Perplexity API key not provided")
        
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Model settings from environment
        self.model = os.getenv("PERPLEXITY_MODEL", "llama-3.1-sonar-large-128k-online")
        self.temperature = float(os.getenv("PERPLEXITY_TEMPERATURE", "0.2"))
        self.max_tokens = int(os.getenv("PERPLEXITY_MAX_TOKENS", "1024"))
        
        logger.info("Initialized Perplexity service")
    
    async def search(
        self,
        query: str,
        search_domain_filter: Optional[List[str]] = None,
        return_citations: bool = True,
        return_images: bool = False,
        return_related_questions: bool = False,
        search_recency_filter: Optional[str] = None,
        top_p: Optional[float] = None,
        stream: bool = False,
        presence_penalty: Optional[float] = None,
        frequency_penalty: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Perform a search using Perplexity API.
        
        Args:
            query: The search query
            search_domain_filter: List of domains to restrict search
            return_citations: Whether to return citations
            return_images: Whether to return images
            return_related_questions: Whether to return related questions
            search_recency_filter: Time filter (e.g., "week", "month", "year")
            top_p: Nucleus sampling parameter
            stream: Whether to stream the response
            presence_penalty: Presence penalty for generation
            frequency_penalty: Frequency penalty for generation
            
        Returns:
            Search results from Perplexity
        """
        # Prepare the request payload exactly as in the working curl command
        payload = {
            "model": "sonar-pro",  # Use the model that works with the API
            "messages": [
                {
                    "role": "user",
                    "content": query
                }
            ],
            "max_tokens": 500,
            "temperature": 0.1,
            "return_citations": return_citations,
            "return_related_questions": return_related_questions
        }
        
        # Add optional parameters if provided
        if search_recency_filter:
            # Add a note about recency in the query itself
            payload["messages"][0]["content"] += f" (focusing on information from the past {search_recency_filter})"
        
        logger.info(f"Sending direct request to Perplexity API with query: {query[:100]}...")
        logger.debug(f"Full payload: {payload}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers=self.headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    result = await response.json()
                    
                    logger.info(f"Received response from Perplexity API: status={response.status}")
                    
                    # Extract the response
                    if result.get("choices"):
                        content = result["choices"][0]["message"]["content"]
                        
                        # Format the response with citations if available
                        formatted_result = {
                            "content": content,
                            "citations": result.get("citations", []),
                            "related_questions": result.get("related_questions", []),
                            "usage": result.get("usage", {})
                        }
                        
                        logger.info(f"Perplexity search completed for query: {query[:50]}...")
                        return formatted_result
                    else:
                        logger.error("No choices in Perplexity response")
                        return {"content": "No results found", "error": "No choices in response"}
                        
        except aiohttp.ClientError as e:
            logger.error(f"Perplexity API error: {e}")
            return {"content": f"Search error: {str(e)}", "error": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error in Perplexity search: {e}")
            return {"content": f"Unexpected error: {str(e)}", "error": str(e)}
    
    def search_sync(self, query: str, **kwargs) -> Dict[str, Any]:
        """
        Synchronous wrapper for search method.
        
        Args:
            query: The search query
            **kwargs: Additional search parameters
            
        Returns:
            Search results
        """
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        if loop.is_running():
            # If loop is already running, create a task
            future = asyncio.ensure_future(self.search(query, **kwargs))
            return future
        else:
            return loop.run_until_complete(self.search(query, **kwargs))
    
    async def search_financial_news(
        self,
        query: str,
        recency: str = "week"
    ) -> Dict[str, Any]:
        """
        Search specifically for financial news.
        
        Args:
            query: The search query
            recency: Time filter (week, month, year)
            
        Returns:
            Financial news search results
        """
        # Add financial context to the query
        enhanced_query = f"Financial news and market analysis: {query}"
        
        # Use financial news domains
        financial_domains = [
            "bloomberg.com",
            "reuters.com",
            "wsj.com",
            "ft.com",
            "cnbc.com",
            "marketwatch.com",
            "yahoo.com/finance",
            "seekingalpha.com"
        ]
        
        return await self.search(
            query=enhanced_query,
            search_domain_filter=financial_domains,
            search_recency_filter=recency,
            return_citations=True
        )
    
    async def search_market_data(
        self,
        query: str,
        include_analysis: bool = True
    ) -> Dict[str, Any]:
        """
        Search for market data and analysis.
        
        Args:
            query: The search query
            include_analysis: Whether to include market analysis
            
        Returns:
            Market data search results
        """
        # Enhance query for market data
        if include_analysis:
            enhanced_query = f"Market data, trends, and analysis for: {query}"
        else:
            enhanced_query = f"Current market data and statistics for: {query}"
        
        return await self.search(
            query=enhanced_query,
            search_recency_filter="week",
            return_citations=True
        )
    
    async def search_company_info(
        self,
        company: str,
        aspects: List[str] = None
    ) -> Dict[str, Any]:
        """
        Search for company-specific information.
        
        Args:
            company: Company name or ticker
            aspects: Specific aspects to search (e.g., ["financials", "news", "analysis"])
            
        Returns:
            Company information search results
        """
        if aspects:
            aspects_str = ", ".join(aspects)
            query = f"{company} company information: {aspects_str}"
        else:
            query = f"{company} company financial information, recent news, and analysis"
        
        return await self.search(
            query=query,
            search_recency_filter="month",
            return_citations=True
        )
    
    def update_config(
        self,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """Update service configuration."""
        if model:
            self.model = model
        if temperature is not None:
            self.temperature = temperature
        if max_tokens is not None:
            self.max_tokens = max_tokens
        
        logger.info(f"Updated Perplexity config: model={self.model}, temp={self.temperature}")


def create_perplexity_service(api_key: Optional[str] = None) -> PerplexityService:
    """
    Factory function to create Perplexity service.
    
    Args:
        api_key: Perplexity API key
        
    Returns:
        Configured PerplexityService instance
    """
    return PerplexityService(api_key=api_key)
