"""Financial AI Assistant Agents."""

from .base_agent import BaseStreamableAgent
from .fi_mcp_agent import FiMcpAgent
from .finance_genie_agent import FinanceGenieAgent
from .streaming_agent import StreamingFinanceGenieAgent, CustomStreamingFinanceGenieAgent

# Note: Multi-agent system is deprecated, but still available in multi_agent directory
# from .multi_agent.orchestrator_agent import OrchestratorAgent
# from .multi_agent.financial_data_agent import FinancialDataAgent
# from .multi_agent.market_research_agent import MarketResearchAgent
# from .multi_agent.advisory_agent import AdvisoryAgent

__all__ = [
    'BaseStreamableAgent',
    'FiMcpAgent',
    'FinanceGenieAgent',
    'StreamingFinanceGenieAgent',
    'CustomStreamingFinanceGenieAgent'
]
