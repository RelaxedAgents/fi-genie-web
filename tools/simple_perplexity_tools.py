"""Simple Perplexity tools without LangChain dependency."""

from typing import Dict, Any, Optional
import json


class SimplePerplexityTool:
    """Simple tool wrapper for Perplexity."""
    
    def __init__(self, name: str, description: str, perplexity_client):
        self.name = name
        self.description = description
        self.perplexity_client = perplexity_client
    
    def _run(self, query: str, **kwargs) -> str:
        """Execute the tool."""
        try:
            result = self.perplexity_client.search(query)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    async def _arun(self, query: str, **kwargs) -> str:
        """Async version of run."""
        try:
            result = await self.perplexity_client.search(query, **kwargs)
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})


def create_simple_perplexity_tools(perplexity_client) -> list:
    """Create simple Perplexity tools."""
    return [
        SimplePerplexityTool(
            "financial_research",
            "Search for real-time financial information",
            perplexity_client
        )
    ]
