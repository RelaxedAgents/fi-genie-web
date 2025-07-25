"""Data Intelligence Agent for personal financial data using Fi MCP."""

from typing import Dict, Any, Optional, List
import json
from agents.base_agent import BaseAgent
from tools.simple_fi_mcp_tools import create_simple_mcp_tools
from services.mcp_service import MCPClient


class DataIntelligenceAgent(BaseAgent):
    """Agent for accessing personal financial data via Fi MCP."""
    
    def __init__(self, mcp_client: MCPClient):
        super().__init__(
            name="data_intelligence",
            description="Accesses personal financial data including net worth, credit score, and transactions"
        )
        
        self.mcp_client = mcp_client
        
        # Add Fi MCP tools
        mcp_tools = create_simple_mcp_tools(mcp_client)
        self.add_tools(mcp_tools)
        
        # Tool mapping for easy access
        self.tool_map = {tool.name: tool for tool in self.tools}
    
    async def process(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process query to fetch personal financial data."""
        try:
            query_lower = query.lower()
            
            # Determine which tool to use based on query
            tool_name = self._determine_tool(query_lower)
            
            if tool_name and tool_name in self.tool_map:
                # Execute the appropriate tool
                tool = self.tool_map[tool_name]
                self.logger.info(f"Executing tool: {tool_name}")
                
                # Run the tool
                result = tool._run()
                
                # Parse result if it's a string
                if isinstance(result, str):
                    try:
                        parsed_result = json.loads(result)
                    except:
                        parsed_result = {"raw_response": result}
                else:
                    parsed_result = result
                
                response = {
                    "status": "success",
                    "tool_used": tool_name,
                    "data": parsed_result,
                    "response": self._format_response(tool_name, parsed_result)
                }
                
            else:
                # No specific tool identified, provide general response
                response = {
                    "status": "success",
                    "response": "I can help you with your financial data. You can ask about:\n" +
                              "- Net worth and assets\n" +
                              "- Credit score and report\n" +
                              "- EPF balance\n" +
                              "- Mutual fund transactions\n" +
                              "- Bank transactions\n" +
                              "- Stock transactions",
                    "data": None
                }
            
            self.log_execution(query, response)
            return response
            
        except Exception as e:
            self.logger.error(f"Error in data intelligence agent: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "response": f"I encountered an error accessing your financial data: {str(e)}"
            }
    
    def _determine_tool(self, query: str) -> Optional[str]:
        """Determine which tool to use based on query."""
        tool_keywords = {
            "fetch_net_worth": ["net worth", "assets", "liabilities", "wealth", "worth"],
            "fetch_credit_report": ["credit", "cibil", "credit score", "credit report"],
            "fetch_epf_details": ["epf", "provident fund", "pf", "retirement"],
            "fetch_mf_transactions": ["mutual fund", "mf", "sip", "mutual funds"],
            "fetch_bank_transactions": ["bank", "transaction", "spending", "expense"],
            "fetch_stock_transactions": ["stock", "shares", "equity", "trading"]
        }
        
        for tool_name, keywords in tool_keywords.items():
            if any(keyword in query for keyword in keywords):
                return tool_name
        
        return None
    
    def _format_response(self, tool_name: str, data: Dict[str, Any]) -> str:
        """Format the response based on tool and data."""
        if "error" in data:
            return f"Unable to fetch data: {data['error']}"
        
        # Format based on tool type
        if tool_name == "fetch_net_worth":
            return self._format_net_worth(data)
        elif tool_name == "fetch_credit_report":
            return self._format_credit_report(data)
        elif tool_name == "fetch_epf_details":
            return self._format_epf_details(data)
        elif tool_name == "fetch_mf_transactions":
            return self._format_mf_transactions(data)
        elif tool_name == "fetch_bank_transactions":
            return self._format_bank_transactions(data)
        elif tool_name == "fetch_stock_transactions":
            return self._format_stock_transactions(data)
        else:
            return f"Retrieved {tool_name} data successfully."
    
    def _format_net_worth(self, data: Dict[str, Any]) -> str:
        """Format net worth response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        # Try to extract key information
        return "Your net worth data has been retrieved. Please check the detailed breakdown in the data field."
    
    def _format_credit_report(self, data: Dict[str, Any]) -> str:
        """Format credit report response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        return "Your credit report has been retrieved. Please review your credit score and credit history details."
    
    def _format_epf_details(self, data: Dict[str, Any]) -> str:
        """Format EPF details response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        return "Your EPF account details have been retrieved."
    
    def _format_mf_transactions(self, data: Dict[str, Any]) -> str:
        """Format mutual fund transactions response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        return "Your mutual fund transactions have been retrieved."
    
    def _format_bank_transactions(self, data: Dict[str, Any]) -> str:
        """Format bank transactions response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        return "Your bank transactions have been retrieved."
    
    def _format_stock_transactions(self, data: Dict[str, Any]) -> str:
        """Format stock transactions response."""
        if isinstance(data, dict) and "raw_response" in data:
            return data["raw_response"]
        
        return "Your stock transactions have been retrieved."
