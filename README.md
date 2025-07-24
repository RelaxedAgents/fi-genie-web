# 🏦 Financial Agent - LangGraph with MCP

A sophisticated financial agent built with LangGraph that integrates with a custom MCP (Model Context Protocol) server to provide AI-powered financial data access and analysis.

## 🚀 Features

- **LangGraph Agent**: Powered by Google Gemini 2.0 Flash for intelligent financial reasoning
- **MCP Integration**: Connects to deployed MCP server with 6 financial tools
- **Natural Language Interface**: Ask questions in plain English about your financial data  
- **RESTful API**: Clean API endpoints for programmatic access
- **Health Monitoring**: Built-in health checks for agent and MCP server

## 🛠️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Client    │    │  FastAPI Server  │    │  LangGraph      │
│   (HTTP/REST)   ├────┤   (API Layer)    ├────┤  Agent          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   MCP Client     ├────┤  MCP Server     │
                       │  (HTTP/JSON-RPC) │    │  (6 Tools)      │
                       └──────────────────┘    └─────────────────┘
```

## 📊 Available Financial Tools

The agent has access to 6 financial data tools via MCP:

1. **fetch_net_worth** - Get total net worth including assets and liabilities
2. **fetch_credit_report** - Retrieve credit score and credit report information  
3. **fetch_epf_details** - Access EPF (Employee Provident Fund) account details
4. **fetch_mf_transactions** - Get mutual fund transaction history
5. **fetch_bank_transactions** - Retrieve bank account transactions
6. **fetch_stock_transactions** - Access stock trading history

## 🔧 Setup & Installation

### Prerequisites

- Python 3.8+
- Google Cloud Project with Vertex AI enabled
- Access to the MCP server (already configured)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd ai-agent
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Google Cloud credentials:**
   ```bash
   # Authenticate with Google Cloud
   gcloud auth application-default login
   
   # Or set environment variable for service account
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
   ```

4. **Run the application:**
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8080`

## 🌐 API Endpoints

### Health Check
```http
GET /health
```
Returns agent and MCP server health status.

### List Available Tools
```http
GET /agent/tools
```
Returns list of available financial tools.

### Query Agent
```http
POST /agent/query
Content-Type: application/json
X-Phone-Number: your_phone_number

{
  "query": "What's my net worth?"
}
```
Send natural language queries to the financial agent. **Requires X-Phone-Number header**.

### Direct Tool Execution
```http
POST /agent/tool/{tool_name}
X-Phone-Number: your_phone_number
```
Execute specific tools directly (bypass agent reasoning). **Requires X-Phone-Number header**.

Available tool names:
- `fetch_net_worth`
- `fetch_credit_report` 
- `fetch_epf_details`
- `fetch_mf_transactions`
- `fetch_bank_transactions`
- `fetch_stock_transactions`

## 💬 Example Queries

Try these natural language queries with the agent:

- "What is my current net worth?"
- "Show me my recent bank transactions"
- "What is my credit score?"
- "How much do I have in my EPF account?"
- "Show me my mutual fund investments"
- "What are my recent stock transactions?"
- "Give me a financial summary"

## 🔍 Usage Examples

### Using cURL

**Health Check:**
```bash
curl http://localhost:8080/health
```

**Query Agent:**
```bash
curl -X POST http://localhost:8080/agent/query \
  -H "Content-Type: application/json" \
  -H "X-Phone-Number: 9876543210" \
  -d '{"query": "What is my net worth?"}'
```

**Direct Tool Call:**
```bash
curl -X POST http://localhost:8080/agent/tool/fetch_net_worth \
  -H "X-Phone-Number: 9876543210"
```

## 🏗️ Project Structure

```
ai-agent/
├── agent/                 # Individual MCP agent implementations
│   ├── __init__.py
│   └── fi_mcp_agent.py    # Financial MCP Agent (LangGraph implementation)
├── prompts/               # Centralized prompt templates
│   ├── __init__.py
│   └── fi_mcp_prompts.py  # Financial MCP Agent prompts (broken into sections)
├── api/                   # FastAPI application
│   ├── __init__.py
│   ├── main.py            # FastAPI app
│   └── routers/
│       ├── __init__.py
│       └── fi_mcp_routes.py # Financial MCP endpoints
├── services/              # Business logic
│   ├── __init__.py
│   └── mcp_service.py     # MCP client service
├── tools/                 # Tool implementations
│   ├── __init__.py
│   └── fi_mcp_tools.py    # Financial MCP tool wrappers
├── config/                # Configuration
│   ├── __init__.py
│   ├── settings.py        # App settings
│   └── vertex_ai_config.json # Vertex AI configuration
├── utils/                 # Utilities
│   ├── __init__.py
│   └── helpers.py         # General helpers (if needed)
├── main.py                # Entry point (imports FastAPI app)
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## ⚙️ Configuration

The application uses `config/vertex_ai_config.json` for Vertex AI configuration:

```json
{
  "project_id": "your-google-cloud-project",
  "location": "asia-south1", 
  "staging_bucket": "gs://your-staging-bucket"
}
```

MCP server configuration is handled automatically:
- **Server URL**: `https://idx-fi-mcp-dev-94592976-554022930653.asia-south1.run.app`
- **Protocol**: HTTP with JSON-RPC 2.0
- **Authentication**: Phone number header + session ID

## 🔒 Security

- Phone number authentication for MCP server access
- Session-based communication with unique session IDs
- Google Cloud IAM for Vertex AI access
- No sensitive data stored locally

## 🐛 Troubleshooting

### Common Issues

1. **Agent initialization fails:**
   - Check Google Cloud credentials
   - Verify Vertex AI is enabled in your project
   - Ensure config.json has correct values

2. **MCP server connection fails:**
   - Check internet connectivity
   - Verify MCP server is running
   - Check phone number format

3. **Tool execution errors:**
   - Verify MCP server has access to financial data
   - Check session ID validity
   - Review server logs for detailed errors

### Debug Mode

Run with debug enabled:
```bash
export FLASK_DEBUG=1
python main.py
```

## 🚦 Health Monitoring

The application includes comprehensive health checks:

- **Agent Status**: Confirms LangGraph agent is initialized
- **MCP Connection**: Tests MCP server connectivity  
- **Tool Availability**: Verifies all financial tools are accessible
- **Session Management**: Tracks MCP session status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the AI Agent development framework.

## 🙏 Acknowledgments

- Built with [LangGraph](https://langchain-ai.github.io/langgraph/) for agent orchestration
- Powered by [Google Vertex AI](https://cloud.google.com/vertex-ai) and Gemini
- Uses [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for tool integration
- FastAPI for the web framework

---

**Note**: This agent is designed for financial data access and analysis. Always verify financial information through official sources.
