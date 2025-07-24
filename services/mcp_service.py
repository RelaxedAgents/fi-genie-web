"""MCP Client for communicating with the deployed MCP server."""

import requests
import json
import uuid
from typing import Dict, Any, Optional
from pydantic import BaseModel


class MCPRequest(BaseModel):
    """MCP JSON-RPC 2.0 request model."""
    jsonrpc: str = "2.0"
    id: int
    method: str
    params: Dict[str, Any]


class MCPClient:
    """Client for communicating with MCP server via HTTP."""
    
    def __init__(self, base_url: str, phone_number: str):
        """
        Initialize MCP client.
        
        Args:
            base_url: Base URL of the MCP server
            phone_number: Phone number for authentication
        """
        self.base_url = base_url
        self.phone_number = phone_number
        self.session_id = f"mcp-session-{uuid.uuid4()}"
        
    def call_tool(self, tool_name: str, arguments: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Call a tool on the MCP server.
        
        Args:
            tool_name: Name of the tool to call
            arguments: Arguments to pass to the tool
            
        Returns:
            Dict containing the tool response
            
        Raises:
            Exception: If the request fails or returns an error
        """
        if arguments is None:
            arguments = {}
            
        # Prepare the request
        request_data = MCPRequest(
            id=1,
            method="tools/call",
            params={
                "name": tool_name,
                "arguments": arguments
            }
        )
        
        headers = {
            "Content-Type": "application/json",
            "X-Phone-Number": self.phone_number,
            "Mcp-Session-Id": self.session_id
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/mcp/stream",
                headers=headers,
                json=request_data.dict(),
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Check for JSON-RPC errors
            if "error" in result:
                raise Exception(f"MCP Error: {result['error']}")
                
            return result.get("result", {})
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to call MCP tool {tool_name}: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from MCP server: {str(e)}")
    
    def list_tools(self) -> Dict[str, Any]:
        """
        List available tools from the MCP server.
        
        Returns:
            Dict containing available tools
        """
        request_data = MCPRequest(
            id=2,
            method="tools/list",
            params={}
        )
        
        headers = {
            "Content-Type": "application/json",
            "X-Phone-Number": self.phone_number,
            "Mcp-Session-Id": self.session_id
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/mcp/stream",
                headers=headers,
                json=request_data.dict(),
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            
            if "error" in result:
                raise Exception(f"MCP Error: {result['error']}")
                
            return result.get("result", {})
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to list MCP tools: {str(e)}")
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from MCP server: {str(e)}")
