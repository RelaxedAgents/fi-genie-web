"""Test script for the complete Financial AI Assistant system."""

import asyncio
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our system components
from services import GeminiService, PerplexityService, MCPClient
from memory import MemoryManager
from agent import (
    OrchestratorAgent,
    FinancialDataAgent,
    MarketResearchAgent,
    AdvisoryAgent
)


async def test_individual_agents():
    """Test each agent individually."""
    print("\n" + "="*50)
    print("TESTING INDIVIDUAL AGENTS")
    print("="*50)
    
    # Initialize services
    memory_manager = MemoryManager(
        mem0_base_url=os.getenv("MEM0_BASE_URL", "https://mem0-server-sbizyecxta-el.a.run.app")
    )
    
    gemini_service = GeminiService(
        project_id=os.getenv("GCP_PROJECT_ID"),
        location=os.getenv("GCP_LOCATION", "us-central1")
    )
    
    mcp_client = MCPClient(
        base_url=os.getenv("FI_MCP_BASE_URL"),
        phone_number=os.getenv("FI_MCP_PHONE_NUMBER", "2222222222")
    )
    
    perplexity_service = PerplexityService(
        api_key=os.getenv("PERPLEXITY_API_KEY")
    )
    
    # Test Financial Data Agent
    print("\n1. Testing Financial Data Agent...")
    financial_agent = FinancialDataAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        mcp_client=mcp_client
    )
    
    result = await financial_agent.process(
        query="What are my recent transactions and spending patterns?",
        user_id="test_user_123"
    )
    print(f"Financial Agent Response: {result['response'][:200]}...")
    print(f"Tools used: {result.get('tools_used', [])}")
    
    # Test Market Research Agent
    print("\n2. Testing Market Research Agent...")
    market_agent = MarketResearchAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        perplexity_client=perplexity_service
    )
    
    result = await market_agent.process(
        query="What's the current market outlook for technology stocks?",
        user_id="test_user_123"
    )
    print(f"Market Agent Response: {result['response'][:200]}...")
    print(f"Insights found: {len(result.get('insights', []))}")
    
    # Test Advisory Agent
    print("\n3. Testing Advisory Agent...")
    advisory_agent = AdvisoryAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model()
    )
    
    result = await advisory_agent.process(
        query="How can I improve my financial situation?",
        user_id="test_user_123"
    )
    print(f"Advisory Agent Response: {result['response'][:200]}...")
    print(f"Recommendations: {len(result.get('recommendations', []))}")


async def test_orchestrator():
    """Test the orchestrator with various queries."""
    print("\n" + "="*50)
    print("TESTING ORCHESTRATOR")
    print("="*50)
    
    # Initialize all components
    memory_manager = MemoryManager(
        mem0_base_url=os.getenv("MEM0_BASE_URL", "https://mem0-server-sbizyecxta-el.a.run.app")
    )
    
    gemini_service = GeminiService(
        project_id=os.getenv("GCP_PROJECT_ID"),
        location=os.getenv("GCP_LOCATION", "us-central1")
    )
    
    mcp_client = MCPClient(
        base_url=os.getenv("FI_MCP_BASE_URL"),
        phone_number=os.getenv("FI_MCP_PHONE_NUMBER", "2222222222")
    )
    
    perplexity_service = PerplexityService(
        api_key=os.getenv("PERPLEXITY_API_KEY")
    )
    
    # Initialize agents
    financial_agent = FinancialDataAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        mcp_client=mcp_client
    )
    
    market_agent = MarketResearchAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        perplexity_client=perplexity_service
    )
    
    advisory_agent = AdvisoryAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model()
    )
    
    # Initialize orchestrator
    orchestrator = OrchestratorAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        sub_agents={
            "financial_data": financial_agent,
            "market_research": market_agent,
            "advisory": advisory_agent
        }
    )
    
    # Test queries
    test_queries = [
        "What's my current financial status and spending patterns?",
        "Should I invest in technology stocks given my risk profile?",
        "How can I reduce my expenses and save more money?",
        "What are the market trends for renewable energy investments?",
        "Create a budget plan based on my income and expenses"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: {query}")
        print("-" * 50)
        
        result = await orchestrator.process(
            query=query,
            user_id="test_user_123",
            session_id=f"test_session_{i}"
        )
        
        print(f"Response: {result['response'][:300]}...")
        print(f"Agents used: {result['metadata']['agents_used']}")
        print(f"Execution type: {result['metadata']['execution_type']}")


async def test_streaming():
    """Test streaming functionality."""
    print("\n" + "="*50)
    print("TESTING STREAMING")
    print("="*50)
    
    # Initialize components
    memory_manager = MemoryManager(
        mem0_base_url=os.getenv("MEM0_BASE_URL", "https://mem0-server-sbizyecxta-el.a.run.app")
    )
    
    gemini_service = GeminiService(
        project_id=os.getenv("GCP_PROJECT_ID"),
        location=os.getenv("GCP_LOCATION", "us-central1")
    )
    
    mcp_client = MCPClient(
        base_url=os.getenv("FI_MCP_BASE_URL"),
        phone_number=os.getenv("FI_MCP_PHONE_NUMBER", "2222222222")
    )
    
    perplexity_service = PerplexityService(
        api_key=os.getenv("PERPLEXITY_API_KEY")
    )
    
    # Initialize agents
    financial_agent = FinancialDataAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        mcp_client=mcp_client
    )
    
    market_agent = MarketResearchAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        perplexity_client=perplexity_service
    )
    
    advisory_agent = AdvisoryAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model()
    )
    
    # Initialize orchestrator
    orchestrator = OrchestratorAgent(
        memory_manager=memory_manager,
        gemini_service=gemini_service.get_model(),
        sub_agents={
            "financial_data": financial_agent,
            "market_research": market_agent,
            "advisory": advisory_agent
        }
    )
    
    print("\nStreaming query: 'Analyze my spending and suggest improvements'")
    print("-" * 50)
    
    # Stream events
    event_count = 0
    async for event in orchestrator.aquery_stream_events(
        query="Analyze my spending and suggest improvements",
        user_id="test_user_123",
        context={"session_id": "test_stream_1"}
    ):
        event_count += 1
        event_type = event.get("type", "unknown")
        
        if event_type == "progress":
            print(f"[PROGRESS] {event.get('content', '')}")
        elif event_type == "token":
            print(event.get("content", ""), end="", flush=True)
        elif event_type == "tool_start":
            print(f"\n[TOOL] Starting: {event.get('content', '')}")
        elif event_type == "agent_start":
            print(f"\n[AGENT] Starting: {event.get('content', '')}")
        
        # Limit output for demo
        if event_count > 50:
            print("\n... (truncated for demo)")
            break


async def test_memory_persistence():
    """Test memory persistence across sessions."""
    print("\n" + "="*50)
    print("TESTING MEMORY PERSISTENCE")
    print("="*50)
    
    memory_manager = MemoryManager(
        mem0_base_url=os.getenv("MEM0_BASE_URL", "https://mem0-server-sbizyecxta-el.a.run.app")
    )
    
    user_id = "test_memory_user"
    
    # Store a preference
    print("\n1. Storing user preference...")
    await memory_manager.mem0_client.create_memory(
        messages=[{
            "role": "system",
            "content": "User prefers conservative investments with focus on dividend stocks"
        }],
        user_id=user_id,
        agent_id="orchestrator",
        metadata={
            "type": "preference",
            "preferences": {
                "risk_tolerance": "conservative",
                "investment_focus": ["dividend_stocks", "bonds"]
            }
        }
    )
    print("Preference stored!")
    
    # Retrieve context
    print("\n2. Retrieving user context...")
    context = await memory_manager.get_user_context(user_id)
    print(f"Risk tolerance: {context.risk_tolerance}")
    print(f"Preferences: {context.preferences}")
    
    # Search memories
    print("\n3. Searching memories...")
    memories = await memory_manager.mem0_client.search_memories(
        query="investment preferences",
        user_id=user_id,
        limit=5
    )
    print(f"Found {len(memories)} relevant memories")
    for memory in memories:
        print(f"- {memory.get('content', '')[:100]}...")


async def main():
    """Run all tests."""
    print("\n" + "="*70)
    print("FINANCIAL AI ASSISTANT - COMPLETE SYSTEM TEST")
    print("="*70)
    print(f"Started at: {datetime.now()}")
    
    try:
        # Check environment variables
        required_vars = [
            "GCP_PROJECT_ID",
            "FI_MCP_BASE_URL",
            "PERPLEXITY_API_KEY",
            "MEM0_BASE_URL"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            print(f"\nERROR: Missing environment variables: {missing_vars}")
            print("Please set these in your .env file")
            return
        
        # Run tests
        await test_individual_agents()
        await test_orchestrator()
        await test_streaming()
        await test_memory_persistence()
        
        print("\n" + "="*70)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*70)
        
    except Exception as e:
        print(f"\nERROR during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Run the tests
    asyncio.run(main())
