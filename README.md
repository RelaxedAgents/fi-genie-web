# Financial AI Assistant

A complete multi-agent financial assistant powered by Google's Gemini 2.0 Flash, with real financial data access through Fi MCP, market research via Perplexity, and persistent memory using Mem0.

## 🚀 Features

- **Multi-Agent Architecture**: Orchestrator coordinates specialized agents for comprehensive financial analysis
- **Real Financial Data**: Access actual bank transactions, net worth, credit reports via Fi MCP
- **Market Research**: Real-time market data and news through Perplexity API
- **Persistent Memory**: User preferences and conversation history with Mem0
- **Streaming Responses**: Real-time progress updates and token streaming
- **Personalized Advice**: Tailored recommendations based on user profile and goals

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Query                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                         │
│  • Intent Classification                                      │
│  • Agent Routing                                              │
│  • Response Synthesis                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────────┐
        ▼             ▼             ▼                 ▼
┌───────────┐ ┌───────────┐ ┌───────────┐    ┌───────────┐
│Financial  │ │  Market   │ │ Advisory  │    │  Memory   │
│Data Agent │ │ Research  │ │   Agent   │    │  Manager  │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘    └─────┬─────┘
      │             │             │                 │
      ▼             ▼             ▼                 ▼
┌───────────┐ ┌───────────┐ ┌───────────┐    ┌───────────┐
│  Fi MCP   │ │Perplexity │ │  Gemini   │    │   Mem0    │
│   APIs    │ │    API    │ │    LLM    │    │    API    │
└───────────┘ └───────────┘ └───────────┘    └───────────┘
```

## 📋 Prerequisites

- Python 3.9+
- Google Cloud Project with Vertex AI enabled
- Perplexity API key
- Access to Fi MCP endpoints
- Access to Mem0 service

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/thepm25/google_hackathon_finance_agent.git
cd google_hackathon_finance_agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Configure Google Cloud credentials:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
# Or use gcloud auth
gcloud auth application-default login
```

## 🚀 Running the Application

### Start the API Server

```bash
# Using uvicorn directly
uvicorn api.main_v2:app --host 0.0.0.0 --port 8080 --reload

# Or using Python
python -m api.main_v2
```

### Test the System

```bash
# Run comprehensive tests
python test_agentic_system.py
```

## 📡 API Endpoints

### Chat Endpoints

- `POST /chat/query` - Process a financial query
- `GET /chat/history/{user_id}` - Get chat history
- `GET /chat/context/{user_id}` - Get user context
- `POST /chat/feedback` - Submit feedback
- `POST /chat/preferences` - Update user preferences

### Streaming Endpoints

- `POST /stream/query` - Stream query response with progress
- `POST /stream/agent/{agent_name}` - Stream to specific agent
- `GET /stream/test` - Test streaming functionality
- `POST /stream/events` - Stream with event filtering

### System Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /agents` - List all agents
- `GET /agents/{agent_name}/capabilities` - Get agent capabilities

## 💬 Example Queries

```python
# Basic financial status
"What's my current financial status and spending patterns?"

# Investment advice
"Should I invest in technology stocks given my risk profile?"

# Budget planning
"How can I reduce my expenses and save more money?"

# Market research
"What are the market trends for renewable energy investments?"

# Comprehensive planning
"Create a budget plan based on my income and expenses"
```

## 🔧 Configuration

All configurations are in `.env` file:

- **LLM Settings**: Model, temperature, max tokens
- **API Keys**: Perplexity, Gemini (if using direct API)
- **Agent Behavior**: Timeouts, parallel execution, caching
- **Feature Flags**: Enable/disable specific features

## 🏛️ System Components

### Agents

1. **Orchestrator Agent**: Master coordinator
   - Routes queries to appropriate agents
   - Manages parallel/sequential execution
   - Synthesizes final responses

2. **Financial Data Agent**: Personal finance specialist
   - Fetches transactions, net worth, credit reports
   - Analyzes spending patterns
   - Detects anomalies

3. **Market Research Agent**: External data analyst
   - Searches market trends and news
   - Provides investment insights
   - Tracks economic indicators

4. **Advisory Agent**: Recommendation engine
   - Provides personalized advice
   - Creates action plans
   - Suggests improvements

### Services

- **Gemini Service**: LLM operations via Vertex AI
- **Perplexity Service**: Market research and web search
- **MCP Client**: Financial data access
- **Memory Manager**: User context and history

## 🔒 Security

- Environment-based configuration
- API rate limiting
- CORS protection
- Secure credential management

## 📊 Monitoring

- Comprehensive logging
- Error tracking
- Performance metrics
- Health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini team for the powerful LLM
- Fi team for financial data access
- Perplexity for market research capabilities
- Mem0 for memory persistence
