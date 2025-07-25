"""Mem0 API client for memory management."""

import os
import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class Mem0Client:
    """Async client for Mem0 API operations."""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        """
        Initialize Mem0 client.
        
        Args:
            base_url: Base URL for Mem0 API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            'Content-Type': 'application/json'
        }
        if api_key:
            self.headers['Authorization'] = f'Bearer {api_key}'
        
        # Check if SSL should be disabled
        self.disable_ssl = os.getenv('DISABLE_SSL_VERIFICATION', 'false').lower() == 'true'
        if self.disable_ssl:
            logger.info("SSL verification disabled for Mem0 client")
    
    async def create_memory(
        self,
        messages: List[Dict[str, str]],
        user_id: str,
        agent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new memory entry.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            user_id: User identifier
            agent_id: Optional agent identifier
            metadata: Optional metadata for the memory
            
        Returns:
            Created memory response
        """
        # Validate messages
        if not messages:
            logger.warning("No messages provided for memory creation")
            return {"results": [], "relations": {}}
            
        payload = {
            'messages': messages,
            'user_id': user_id,
            'metadata': metadata or {}
        }
        
        # Note: agent_id seems to cause issues with the API, so we'll skip it for now
        # if agent_id:
        #     payload['agent_id'] = agent_id
        
        try:
            # Conditionally disable SSL for aiohttp
            connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.post(
                    f"{self.base_url}/memories",
                    json=payload,
                    headers=self.headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Failed to create memory: {response.status} - {error_text}")
                        return {"error": error_text, "status": response.status}
                    
                    result = await response.json()
                    logger.info(f"Created memory for user {user_id}")
                    return result
        except Exception as e:
            logger.error(f"Error creating memory: {e}")
            return {"error": str(e)}
    
    async def get_memories(
        self,
        user_id: str,
        agent_id: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get memories for a user.
        
        Args:
            user_id: User identifier
            agent_id: Optional agent identifier
            limit: Maximum number of memories to return
            offset: Offset for pagination
            
        Returns:
            List of memory entries
        """
        params = {
            'user_id': user_id,
            'limit': limit,
            'offset': offset
        }
        
        if agent_id:
            params['agent_id'] = agent_id
        
        try:
            # Conditionally disable SSL for aiohttp
            connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.get(
                    f"{self.base_url}/memories",
                    params=params,
                    headers=self.headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Failed to get memories: {response.status} - {error_text}")
                        return []
                    
                    result = await response.json()
                    # Handle both 'results' and 'memories' fields for compatibility
                    memories = result.get('results', result.get('memories', []))
                    if not isinstance(memories, list):
                        memories = []
                    
                    logger.info(f"Retrieved {len(memories)} memories for user {user_id}")
                    return memories
        except Exception as e:
            logger.error(f"Error getting memories: {e}")
            return []
    
    async def search_memories(
        self,
        query: str,
        user_id: str,
        agent_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search memories using semantic search.
        
        Args:
            query: Search query
            user_id: User identifier
            agent_id: Optional agent identifier
            limit: Maximum number of results
            
        Returns:
            List of relevant memories
        """
        # Validate query is not empty
        if not query or not query.strip():
            logger.warning("Empty search query provided")
            return []
            
        payload = {
            'query': query,
            'user_id': user_id,
            'limit': limit
        }
        
        if agent_id:
            payload['agent_id'] = agent_id
        
        # Log the exact request details
        url = f"{self.base_url}/search"
        logger.info(f"[MEM0 API] POST {url}")
        logger.info(f"[MEM0 API] Headers: {json.dumps(self.headers, indent=2)}")
        logger.info(f"[MEM0 API] Payload: {json.dumps(payload, indent=2)}")
        
        try:
            # Conditionally disable SSL for aiohttp
            connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.post(
                    url,
                    json=payload,
                    headers=self.headers
                ) as response:
                    response_text = await response.text()
                    logger.info(f"[MEM0 API] Response Status: {response.status}")
                    logger.info(f"[MEM0 API] Response Body: {response_text[:500]}...")
                    
                    if response.status != 200:
                        logger.error(f"Search failed: {response.status} - {response_text}")
                        return []
                    
                    result = json.loads(response_text)
                    # The API returns 'results' not 'memories'
                    memories = result.get('results', result.get('memories', []))
                    if not isinstance(memories, list):
                        memories = []
                    
                    # Normalize memory format
                    normalized_memories = []
                    for memory in memories:
                        if isinstance(memory, dict):
                            # Map 'memory' field to 'content' for consistency
                            if 'memory' in memory and 'content' not in memory:
                                memory['content'] = memory['memory']
                            normalized_memories.append(memory)
                    
                    logger.info(f"Found {len(normalized_memories)} memories for query: {query[:50]}...")
                    return normalized_memories
        except Exception as e:
            logger.error(f"Error searching memories: {e}", exc_info=True)
            return []
    
    async def update_memory(
        self,
        memory_id: str,
        messages: Optional[List[Dict[str, str]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update an existing memory.
        
        Args:
            memory_id: Memory identifier
            messages: Optional updated messages
            metadata: Optional updated metadata
            
        Returns:
            Updated memory response
        """
        payload = {}
        if messages:
            payload['messages'] = messages
        if metadata:
            payload['metadata'] = metadata
        
        # Conditionally disable SSL for aiohttp
        connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.put(
                f"{self.base_url}/memories/{memory_id}",
                json=payload,
                headers=self.headers
            ) as response:
                response.raise_for_status()
                result = await response.json()
                logger.info(f"Updated memory {memory_id}")
                return result
    
    async def delete_memory(self, memory_id: str) -> bool:
        """
        Delete a memory.
        
        Args:
            memory_id: Memory identifier
            
        Returns:
            True if successful
        """
        # Conditionally disable SSL for aiohttp
        connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.delete(
                f"{self.base_url}/memories/{memory_id}",
                headers=self.headers
            ) as response:
                response.raise_for_status()
                logger.info(f"Deleted memory {memory_id}")
                return True
    
    async def get_memory_by_id(self, memory_id: str) -> Dict[str, Any]:
        """
        Get a specific memory by ID.
        
        Args:
            memory_id: Memory identifier
            
        Returns:
            Memory entry
        """
        # Conditionally disable SSL for aiohttp
        connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(
                f"{self.base_url}/memories/{memory_id}",
                headers=self.headers
            ) as response:
                response.raise_for_status()
                result = await response.json()
                return result
    
    async def health_check(self) -> bool:
        """
        Check if Mem0 service is healthy.
        
        Returns:
            True if service is healthy
        """
        try:
            # Conditionally disable SSL for health check
            connector = aiohttp.TCPConnector(ssl=False if self.disable_ssl else None)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.get(
                    f"{self.base_url}/health",
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
