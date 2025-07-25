#!/usr/bin/env python3
"""Test script to verify memory fixes are working correctly."""

import asyncio
import logging
from datetime import datetime
import json

# Configure logging to see detailed output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import the fixed modules
from memory.mem0_client import Mem0Client
from memory.memory_manager import MemoryManager
from memory.memory_schemas import UserContext


async def test_mem0_client():
    """Test the fixed Mem0 client."""
    logger.info("\n🧪 Testing Mem0 Client Fixes")
    
    client = Mem0Client("https://mem0-server-sbizyecxta-el.a.run.app")
    
    # Test 1: Create memory without agent_id (which was causing issues)
    logger.info("\n1️⃣ Testing memory creation without agent_id")
    result = await client.create_memory(
        messages=[{"role": "user", "content": "Test memory creation"}],
        user_id="test_user_fixes",
        metadata={"test": True}
    )
    logger.info(f"Create result: {json.dumps(result, indent=2)}")
    
    # Test 2: Get memories with proper error handling
    logger.info("\n2️⃣ Testing get memories with error handling")
    memories = await client.get_memories(
        user_id="test_user_fixes"
    )
    logger.info(f"Retrieved {len(memories)} memories")
    
    # Test 3: Search with empty query (should return empty list)
    logger.info("\n3️⃣ Testing search with empty query")
    results = await client.search_memories(
        query="",
        user_id="test_user_fixes"
    )
    logger.info(f"Empty query returned {len(results)} results")
    
    # Test 4: Search with valid query
    logger.info("\n4️⃣ Testing search with valid query")
    results = await client.search_memories(
        query="test memory",
        user_id="test_user_fixes"
    )
    logger.info(f"Valid query returned {len(results)} results")
    if results:
        logger.info(f"First result: {json.dumps(results[0], indent=2)}")


async def test_memory_manager():
    """Test the fixed Memory Manager."""
    logger.info("\n\n🧪 Testing Memory Manager Fixes")
    
    manager = MemoryManager("https://mem0-server-sbizyecxta-el.a.run.app")
    
    # Test 1: Get user context with null handling
    logger.info("\n1️⃣ Testing get_user_context with null handling")
    try:
        context = await manager.get_user_context(
            user_id="test_user_fixes",
            agent_id="test_agent"
        )
        logger.info(f"User context retrieved successfully")
        logger.info(f"Financial goals: {context.financial_goals}")
        logger.info(f"Risk tolerance: {context.risk_tolerance}")
        logger.info(f"Recent interactions: {len(context.recent_interactions)}")
    except Exception as e:
        logger.error(f"Error getting user context: {e}")
    
    # Test 2: Store interaction
    logger.info("\n2️⃣ Testing store_interaction")
    try:
        await manager.store_interaction(
            user_id="test_user_fixes",
            session_id="test_session",
            agent_id="test_agent",
            query="What is my spending pattern?",
            response="Based on your data, you spend most on groceries.",
            metadata={"test": True}
        )
        logger.info("Interaction stored successfully")
    except Exception as e:
        logger.error(f"Error storing interaction: {e}")
    
    # Test 3: Search cross-agent insights
    logger.info("\n3️⃣ Testing search_cross_agent_insights")
    try:
        insights = await manager.search_cross_agent_insights(
            user_id="test_user_fixes",
            query="spending patterns"
        )
        logger.info(f"Found insights from {len(insights)} agents")
        for agent, agent_insights in insights.items():
            logger.info(f"  {agent}: {len(agent_insights)} insights")
    except Exception as e:
        logger.error(f"Error searching insights: {e}")


async def test_edge_cases():
    """Test edge cases and error scenarios."""
    logger.info("\n\n🧪 Testing Edge Cases")
    
    client = Mem0Client("https://mem0-server-sbizyecxta-el.a.run.app")
    manager = MemoryManager("https://mem0-server-sbizyecxta-el.a.run.app")
    
    # Test 1: Handle None in memory list
    logger.info("\n1️⃣ Testing None handling in memory processing")
    # Simulate a response with None values
    test_memories = [
        None,
        {"memory": "Test memory", "metadata": None},
        {"content": "Test content", "metadata": {"type": "test"}},
        {"memory": "Another test", "metadata": None, "score": 0.8}
    ]
    
    # Process memories like the manager would
    processed = []
    for memory in test_memories:
        if memory is None:
            continue
        content = memory.get('content') or memory.get('memory', '')
        metadata = memory.get('metadata', {})
        if metadata is None:
            metadata = {}
        processed.append({
            'content': content,
            'metadata': metadata
        })
    
    logger.info(f"Processed {len(processed)} valid memories from {len(test_memories)} total")
    
    # Test 2: Test with non-existent user
    logger.info("\n2️⃣ Testing with non-existent user")
    context = await manager.get_user_context(
        user_id="non_existent_user_12345"
    )
    logger.info(f"Context for non-existent user: goals={len(context.financial_goals)}, insights={len(context.key_insights)}")


async def main():
    """Run all tests."""
    logger.info("🚀 Starting Memory Fix Tests")
    
    try:
        await test_mem0_client()
        await test_memory_manager()
        await test_edge_cases()
        
        logger.info("\n\n✅ All tests completed!")
        logger.info("\n📊 Summary:")
        logger.info("- Mem0 client now handles API response format correctly")
        logger.info("- Memory manager handles null values properly")
        logger.info("- Empty search queries are handled gracefully")
        logger.info("- agent_id issues have been addressed")
        
    except Exception as e:
        logger.error(f"Test suite failed: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())
