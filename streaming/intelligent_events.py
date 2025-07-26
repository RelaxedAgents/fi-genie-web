"""Intelligent Event Interpreter - Convert raw LangGraph events into user-friendly streaming updates."""

from typing import Dict, Any
import logging

base_logger = logging.getLogger(__name__)


class IntelligentEventInterpreter:
    """Convert raw LangGraph events into user-friendly streaming updates."""
    
    def __init__(self):
        # Create unique logger instance to avoid triple logging
        import uuid
        instance_id = str(uuid.uuid4())[:8]
        self.logger = logging.getLogger(f"{__name__}.{instance_id}")
        
        self.tool_messages = {
            "fetch_credit_report": "🔍 Accessing your credit profile...",
            "fetch_net_worth": "💰 Analyzing your financial portfolio...",
            "fetch_epf_details": "🏦 Checking your retirement savings...",
            "market_research": "📊 Researching current market trends...",
            "fetch_mf_transactions": "📈 Analyzing your mutual fund investments...",
            "fetch_stock_transactions": "📊 Reviewing your stock portfolio...",
        }
        
        self.completion_messages = {
            "fetch_credit_report": "✅ Credit analysis complete - found key insights!",
            "fetch_net_worth": "✅ Portfolio analysis done - calculating metrics...",
            "fetch_epf_details": "✅ Retirement data retrieved - projecting growth...",
            "market_research": "✅ Market research complete - found relevant opportunities!",
            "fetch_mf_transactions": "✅ Mutual fund analysis complete - performance calculated!",
            "fetch_stock_transactions": "✅ Stock portfolio review done - returns analyzed!",
        }
    
    def get_tool_start_message(self, tool_name: str) -> str:
        """Get user-friendly message for tool start event."""
        message = self.tool_messages.get(tool_name, f"🔧 Using {tool_name.replace('_', ' ')}...")
        self.logger.info(f"Tool start message for {tool_name}: {message}")
        return message
    
    def get_tool_complete_message(self, tool_name: str) -> str:
        """Get user-friendly message for tool completion event."""
        message = self.completion_messages.get(tool_name, f"✅ Completed {tool_name.replace('_', ' ')}")
        self.logger.info(f"Tool complete message for {tool_name}: {message}")
        return message
