#!/usr/bin/env python3
"""Comprehensive test script for mem0 API endpoints to understand response formats and edge cases."""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_URL = "https://mem0-server-sbizyecxta-el.a.run.app"

class Mem0APITester:
    """Test all mem0 API endpoints and edge cases."""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        self.test_agent_id = f"test_agent_{uuid.uuid4().hex[:8]}"
        self.created_memory_ids = []
        
    async def log_response(self, endpoint: str, method: str, response: Dict[str, Any], status: int):
        """Log API response details."""
        logger.info(f"\n{'='*80}")
        logger.info(f"Endpoint: {method} {endpoint}")
        logger.info(f"Status: {status}")
        logger.info(f"Response: {json.dumps(response, indent=2)}")
        logger.info(f"Response Type: {type(response)}")
        if isinstance(response, dict):
            logger.info(f"Response Keys: {list(response.keys())}")
        logger.info(f"{'='*80}\n")
        
    async def make_request(
        self, 
        session: aiohttp.ClientSession,
        method: str,
        endpoint: str,
        json_data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> tuple[Dict[str, Any], int]:
        """Make HTTP request and return response with status."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with session.request(
                method=method,
                url=url,
                json=json_data,
                params=params,
                headers={"Content-Type": "application/json"} if json_data else None
            ) as response:
                try:
                    data = await response.json()
                except:
                    data = {"text": await response.text()}
                
                return data, response.status
                
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return {"error": str(e)}, 0
    
    async def test_health_check(self, session: aiohttp.ClientSession):
        """Test health check endpoint."""
        logger.info("\n🏥 Testing Health Check")
        response, status = await self.make_request(session, "GET", "/health")
        await self.log_response("/health", "GET", response, status)
        
    async def test_create_memory(self, session: aiohttp.ClientSession) -> Optional[str]:
        """Test memory creation with various scenarios."""
        logger.info("\n📝 Testing Memory Creation")
        
        # Test 1: Normal memory creation
        data = {
            "messages": [
                {"role": "user", "content": "My name is Alice and I love programming"},
                {"role": "assistant", "content": "Nice to meet you, Alice! Programming is amazing."}
            ],
            "user_id": self.test_user_id,
            "agent_id": self.test_agent_id,
            "metadata": {"session": "chat_001", "category": "personal"}
        }
        response, status = await self.make_request(session, "POST", "/memories", data)
        await self.log_response("/memories", "POST", response, status)
        
        memory_id = None
        if status == 200 and isinstance(response, dict):
            # Try different possible field names for memory ID
            memory_id = response.get('id') or response.get('memory_id') or response.get('_id')
            if memory_id:
                self.created_memory_ids.append(memory_id)
        
        # Test 2: Minimal data
        data = {
            "messages": [{"role": "user", "content": "Test message"}],
            "user_id": self.test_user_id
        }
        response, status = await self.make_request(session, "POST", "/memories", data)
        await self.log_response("/memories (minimal)", "POST", response, status)
        
        # Test 3: Empty messages
        data = {
            "messages": [],
            "user_id": self.test_user_id
        }
        response, status = await self.make_request(session, "POST", "/memories", data)
        await self.log_response("/memories (empty messages)", "POST", response, status)
        
        # Test 4: Missing user_id
        data = {
            "messages": [{"role": "user", "content": "Test"}]
        }
        response, status = await self.make_request(session, "POST", "/memories", data)
        await self.log_response("/memories (no user_id)", "POST", response, status)
        
        return memory_id
    
    async def test_get_memories(self, session: aiohttp.ClientSession):
        """Test getting memories with various filters."""
        logger.info("\n📚 Testing Get Memories")
        
        # Test 1: Get by user_id
        response, status = await self.make_request(
            session, "GET", "/memories", 
            params={"user_id": self.test_user_id}
        )
        await self.log_response("/memories?user_id", "GET", response, status)
        
        # Analyze response structure
        if isinstance(response, dict):
            if 'memories' in response:
                logger.info(f"Response has 'memories' field with {len(response['memories'])} items")
                if response['memories']:
                    logger.info(f"First memory structure: {json.dumps(response['memories'][0], indent=2)}")
            elif 'results' in response:
                logger.info(f"Response has 'results' field with {len(response['results'])} items")
            elif isinstance(response, list):
                logger.info(f"Response is a list with {len(response)} items")
        
        # Test 2: Get by agent_id
        response, status = await self.make_request(
            session, "GET", "/memories",
            params={"agent_id": self.test_agent_id}
        )
        await self.log_response("/memories?agent_id", "GET", response, status)
        
        # Test 3: Get with multiple filters
        response, status = await self.make_request(
            session, "GET", "/memories",
            params={"user_id": self.test_user_id, "agent_id": self.test_agent_id}
        )
        await self.log_response("/memories?user_id&agent_id", "GET", response, status)
        
        # Test 4: Non-existent user
        response, status = await self.make_request(
            session, "GET", "/memories",
            params={"user_id": "non_existent_user"}
        )
        await self.log_response("/memories?non_existent_user", "GET", response, status)
    
    async def test_search_memories(self, session: aiohttp.ClientSession):
        """Test memory search functionality."""
        logger.info("\n🔍 Testing Memory Search")
        
        # Test 1: Basic search
        data = {
            "query": "What is my name?",
            "user_id": self.test_user_id
        }
        response, status = await self.make_request(session, "POST", "/search", data)
        await self.log_response("/search", "POST", response, status)
        
        # Analyze search response structure
        if isinstance(response, dict):
            logger.info(f"Search response keys: {list(response.keys())}")
            if 'results' in response:
                logger.info(f"Has 'results' field with {len(response.get('results', []))} items")
            if 'memories' in response:
                logger.info(f"Has 'memories' field with {len(response.get('memories', []))} items")
        
        # Test 2: Search with filters
        data = {
            "query": "programming preferences",
            "user_id": self.test_user_id,
            "agent_id": self.test_agent_id,
            "filters": {"category": "personal"}
        }
        response, status = await self.make_request(session, "POST", "/search", data)
        await self.log_response("/search (with filters)", "POST", response, status)
        
        # Test 3: Empty query
        data = {
            "query": "",
            "user_id": self.test_user_id
        }
        response, status = await self.make_request(session, "POST", "/search", data)
        await self.log_response("/search (empty query)", "POST", response, status)
        
        # Test 4: Missing user_id
        data = {
            "query": "test query"
        }
        response, status = await self.make_request(session, "POST", "/search", data)
        await self.log_response("/search (no user_id)", "POST", response, status)
    
    async def test_get_memory_by_id(self, session: aiohttp.ClientSession, memory_id: Optional[str]):
        """Test getting a specific memory by ID."""
        logger.info("\n🎯 Testing Get Memory by ID")
        
        if not memory_id:
            logger.warning("No memory ID available for testing")
            return
        
        # Test 1: Valid memory ID
        response, status = await self.make_request(session, "GET", f"/memories/{memory_id}")
        await self.log_response(f"/memories/{memory_id}", "GET", response, status)
        
        # Test 2: Invalid memory ID
        fake_id = str(uuid.uuid4())
        response, status = await self.make_request(session, "GET", f"/memories/{fake_id}")
        await self.log_response(f"/memories/{fake_id} (invalid)", "GET", response, status)
    
    async def test_update_memory(self, session: aiohttp.ClientSession, memory_id: Optional[str]):
        """Test memory update functionality."""
        logger.info("\n✏️ Testing Memory Update")
        
        if not memory_id:
            logger.warning("No memory ID available for testing")
            return
        
        # Test 1: Update with data field (as shown in curl example)
        data = {
            "data": "Updated memory content - Alice is a senior developer"
        }
        response, status = await self.make_request(session, "PUT", f"/memories/{memory_id}", data)
        await self.log_response(f"/memories/{memory_id}", "PUT", response, status)
        
        # Test 2: Update with messages field (our current implementation)
        data = {
            "messages": [
                {"role": "user", "content": "I'm now a senior developer"},
                {"role": "assistant", "content": "Congratulations on your promotion!"}
            ]
        }
        response, status = await self.make_request(session, "PUT", f"/memories/{memory_id}", data)
        await self.log_response(f"/memories/{memory_id} (messages)", "PUT", response, status)
        
        # Test 3: Update metadata only
        data = {
            "metadata": {"updated": True, "level": "senior"}
        }
        response, status = await self.make_request(session, "PUT", f"/memories/{memory_id}", data)
        await self.log_response(f"/memories/{memory_id} (metadata)", "PUT", response, status)
    
    async def test_memory_history(self, session: aiohttp.ClientSession, memory_id: Optional[str]):
        """Test memory history endpoint."""
        logger.info("\n📜 Testing Memory History")
        
        if not memory_id:
            logger.warning("No memory ID available for testing")
            return
        
        response, status = await self.make_request(session, "GET", f"/memories/{memory_id}/history")
        await self.log_response(f"/memories/{memory_id}/history", "GET", response, status)
    
    async def test_delete_operations(self, session: aiohttp.ClientSession):
        """Test delete operations."""
        logger.info("\n🗑️ Testing Delete Operations")
        
        # Create a memory to delete
        data = {
            "messages": [{"role": "user", "content": "Memory to delete"}],
            "user_id": f"delete_test_{uuid.uuid4().hex[:8]}",
            "agent_id": "delete_test_agent"
        }
        create_response, create_status = await self.make_request(session, "POST", "/memories", data)
        
        if create_status == 200 and isinstance(create_response, dict):
            memory_id = create_response.get('id') or create_response.get('memory_id')
            
            if memory_id:
                # Test 1: Delete by ID
                response, status = await self.make_request(session, "DELETE", f"/memories/{memory_id}")
                await self.log_response(f"/memories/{memory_id}", "DELETE", response, status)
        
        # Test 2: Delete by user_id
        response, status = await self.make_request(
            session, "DELETE", "/memories",
            params={"user_id": "delete_test_user"}
        )
        await self.log_response("/memories?user_id", "DELETE", response, status)
    
    async def cleanup(self, session: aiohttp.ClientSession):
        """Clean up created test memories."""
        logger.info("\n🧹 Cleaning up test data")
        
        for memory_id in self.created_memory_ids:
            try:
                await self.make_request(session, "DELETE", f"/memories/{memory_id}")
                logger.info(f"Deleted memory: {memory_id}")
            except:
                pass
    
    async def run_all_tests(self):
        """Run all API tests."""
        logger.info("🚀 Starting mem0 API Tests")
        logger.info(f"Test User ID: {self.test_user_id}")
        logger.info(f"Test Agent ID: {self.test_agent_id}")
        
        async with aiohttp.ClientSession() as session:
            # Run tests in order
            await self.test_health_check(session)
            
            # Create memory and get ID for subsequent tests
            memory_id = await self.test_create_memory(session)
            
            # Test other endpoints
            await self.test_get_memories(session)
            await self.test_search_memories(session)
            await self.test_get_memory_by_id(session, memory_id)
            await self.test_update_memory(session, memory_id)
            await self.test_memory_history(session, memory_id)
            await self.test_delete_operations(session)
            
            # Cleanup
            await self.cleanup(session)
        
        logger.info("\n✅ All tests completed!")
        logger.info("\n📊 Summary:")
        logger.info("- Check the logs above for response formats")
        logger.info("- Note any unexpected response structures")
        logger.info("- Identify fields that might be None or missing")


async def main():
    """Run the test suite."""
    tester = Mem0APITester()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
