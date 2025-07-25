# Streaming Architecture for LangGraph Agent

This document describes the streaming architecture implementation for LangGraph agents, enabling real-time streaming of both LLM tokens and intermediate reasoning steps.

## 🏗️ Architecture Overview

The streaming implementation uses a **decorator-based approach** making it easy to add streaming to any LangGraph agent without modifying its core logic.

### 1. Event System (`streaming/event_types.py`)
- **EventType Enum**: Defines all possible event types
- **StreamEvent**: Base dataclass for all events with timestamp and metadata
- **Specialized Events**: ToolEvent, NodeEvent, LLMEvent for specific event types

### 2. Event Formatters (`streaming/formatters.py`)
- **EventFormatter**: Utility class for creating formatted events
- **StreamEventBuffer**: Buffer for batching events to optimize streaming

### 3. Callback Handlers (`streaming/callbacks.py`)
- **StreamingCallbackHandler**: Async callback that captures LangGraph execution events with enhanced progress tracking
- **StreamingEventIterator**: Async iterator for consuming events from the callback

### 4. Configuration System (`streaming/config.py`)
- **StreamingConfig**: Customizable configuration for streaming behavior
- **Pre-defined configs**: DefaultStreamingConfig, FinancialAgentStreamingConfig
- Configurable progress stages, modes, and feature toggles

### 5. Base Functionality (`streaming/base.py`)
- **StreamingMixin**: Core mixin providing streaming capabilities
- Handles agent initialization, event streaming, and message preparation

### 6. Decorator System (`streaming/decorator.py`)
- **make_streamable**: Main decorator to add streaming to any agent class
- **Pre-configured decorators**: streamable, streamable_financial, streamable_conversational, streamable_research
- **add_streaming_to_instance**: Add streaming to existing agent instances

### 7. API Endpoints (`api/routers/streaming_routes.py`)
- **POST /agent/stream/query**: Main streaming endpoint with custom callbacks
- **GET /agent/stream/query**: Alternative GET endpoint for SSE
- **POST /agent/stream/query/native**: Native LangGraph event streaming
- **GET /agent/stream/test**: Test endpoint to verify SSE functionality

## 🎯 Using the Decorator Approach

### Basic Usage

```python
from streaming import streamable

@streamable
class MyAgent:
    def __init__(self):
        self.model = ChatVertexAI()
        self.tools = [...]  # Your tools
```

### Custom Configuration

```python
from streaming import make_streamable, StreamingConfig

@make_streamable(StreamingConfig(
    progress_stages={
        1: "Understanding query",
        2: "Processing request",
        3: "Executing tools",
        4: "Generating response"
    },
    enable_token_streaming=True,
    progress_mode="adaptive"
))
class MyCustomAgent:
    def __init__(self):
        self.model = ChatVertexAI()
        self.tools = [...]
```

### Adding Streaming to Existing Instances

```python
from streaming import add_streaming_to_instance

# Existing agent instance
agent = MyAgent()

# Add streaming capabilities
streaming_agent = add_streaming_to_instance(agent)
```

## 📋 Event Types

The system emits the following event types:

### Agent Lifecycle
- `reasoning_start`: Agent begins processing
- `reasoning_complete`: Agent finishes processing

### LangGraph Nodes
- `node_start`: Node execution begins
- `node_complete`: Node execution completes

### Tool Events
- `tool_start`: Tool invocation begins
- `tool_complete`: Tool execution completes
- `tool_error`: Tool encounters an error

### LLM Events
- `llm_start`: LLM generation begins
- `llm_token`: Individual token from LLM
- `llm_complete`: LLM generation completes

### Status Events
- `status`: General status updates
- `error`: Error events
- `progress`: Progress tracking with percentage
- `parsing_intent`: Agent parsing user intent
- `searching_documents`: Document search in progress
- `synthesizing`: Final answer synthesis

## 🧪 Testing the Streaming

### 1. Test Endpoint
First, verify SSE is working with the test endpoint:

```bash
curl -N -H "Accept: text/event-stream" \
  http://localhost:8080/agent/stream/test
```

Expected output:
```
data: {"type": "reasoning_start", "content": "Starting test stream..."}

data: {"type": "progress", "content": "Step 1 of 5: Parsing user intent", "metadata": {"current_step": 1, "total_steps": 5, "progress_percentage": 10.0, "step_name": "Parsing user intent"}}

data: {"type": "progress", "content": "Step 2 of 5: Analyzing request", "metadata": {"current_step": 2, "total_steps": 5, "progress_percentage": 20.0, "step_name": "Analyzing request"}}

data: {"type": "tool_start", "content": "Calling test tool"}

data: {"type": "progress", "content": "Step 3 of 5: Executing tools", "metadata": {"current_step": 3, "total_steps": 5, "progress_percentage": 30.0, "step_name": "Executing tools", "details": "Executing test_tool (1/2)"}}

...
```

### 2. Real Agent Streaming

Using curl:
```bash
curl -N -X POST \
  -H "Content-Type: application/json" \
  -H "X-Phone-Number: 1234567890" \
  -H "Accept: text/event-stream" \
  -d '{"query": "What is my net worth?"}' \
  http://localhost:8080/agent/stream/query
```

Using Python with SSE client:
```python
import requests
import json

# Install: pip install sseclient-py
from sseclient import SSEClient

url = "http://localhost:8080/agent/stream/query"
headers = {
    "X-Phone-Number": "1234567890",
    "Content-Type": "application/json"
}
data = {"query": "What is my net worth?"}

response = requests.post(url, headers=headers, json=data, stream=True)
client = SSEClient(response)

for event in client.events():
    if event.data:
        event_data = json.loads(event.data)
        print(f"[{event_data['type']}] {event_data['content']}")
```

### 3. JavaScript/Frontend Integration

```javascript
// Create EventSource for SSE
const query = "What is my net worth?";
const phoneNumber = "1234567890";

// Using POST endpoint
async function streamWithPost() {
    const response = await fetch('/agent/stream/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Phone-Number': phoneNumber
        },
        body: JSON.stringify({ query })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                handleEvent(data);
            }
        }
    }
}

// Using GET endpoint (simpler)
const eventSource = new EventSource(
    `/agent/stream/query?query=${encodeURIComponent(query)}`,
    {
        headers: {
            'X-Phone-Number': phoneNumber
        }
    }
);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleEvent(data);
};

eventSource.addEventListener('complete', () => {
    console.log('Stream complete');
    eventSource.close();
});

function handleEvent(data) {
    switch(data.type) {
        case 'reasoning_start':
            console.log('🤔 Agent thinking...');
            break;
        case 'progress':
            // Update progress bar
            const percentage = data.metadata.progress_percentage;
            document.getElementById('progress-bar').style.width = `${percentage}%`;
            document.getElementById('progress-text').textContent = data.content;
            console.log(`📊 Progress: ${percentage}% - ${data.metadata.step_name}`);
            break;
        case 'tool_start':
            console.log(`🔧 Using tool: ${data.metadata.tool_name}`);
            break;
        case 'llm_token':
            // Append token to response
            document.getElementById('response').innerHTML += data.content;
            break;
        case 'reasoning_complete':
            console.log('✅ Analysis complete');
            // Hide progress bar
            document.getElementById('progress-container').style.display = 'none';
            break;
        default:
            console.log(`[${data.type}] ${data.content}`);
    }
}
```

## 🔄 Data Flow

1. **User Query** → API Endpoint
2. **StreamingFiMcpAgent** created with phone number
3. **Agent Execution** begins with StreamingCallbackHandler
4. **Callback Events** are emitted to event queue
5. **Event Iterator** yields events from queue
6. **SSE Generator** formats events for streaming
7. **Client** receives and processes events in real-time

## 📊 Event Format

Each event follows this structure:

```json
{
    "type": "event_type",
    "timestamp": "2025-01-25T12:00:00.000Z",
    "content": "Human-readable description",
    "metadata": {
        "additional": "context",
        "tool_name": "fetch_net_worth",
        "duration_seconds": 1.23
    }
}
```

### Progress Event Format

Progress events include percentage and stage information:

```json
{
    "type": "progress",
    "timestamp": "2025-01-25T12:00:00.000Z",
    "content": "Step 3 of 5: Executing tools",
    "metadata": {
        "current_step": 3,
        "total_steps": 5,
        "progress_percentage": 45.5,
        "step_name": "Executing tools",
        "details": "Executing fetch_net_worth (1/3)"
    }
}
```

## 📈 Progress Tracking

The enhanced progress tracking system provides:

### Adaptive Progress Mode
- Progress updates on every significant event (LLM start, node execution, tool calls)
- Dynamic calculation based on actual execution flow
- Sub-progress within stages based on tool/node completion

### Fixed Progress Mode
- Progress based on predefined stages
- Consistent progress increments
- Suitable for predictable workflows

### Custom Progress Stages
Each agent can define its own progress stages:

```python
@make_streamable(StreamingConfig(
    progress_stages={
        1: "Loading data",
        2: "Analyzing patterns",
        3: "Running algorithms",
        4: "Generating insights",
        5: "Formatting results"
    }
))
class DataAnalyzer:
    pass
```

### Frontend Progress Bar Example

```html
<div id="progress-container" style="width: 100%; background-color: #f0f0f0; border-radius: 4px;">
    <div id="progress-bar" style="width: 0%; height: 20px; background-color: #4CAF50; border-radius: 4px; transition: width 0.3s;"></div>
</div>
<div id="progress-text" style="text-align: center; margin-top: 5px;">Initializing...</div>
```

```javascript
// Update progress bar when receiving progress events
function updateProgress(event) {
    const { progress_percentage, step_name, details } = event.metadata;
    
    // Update bar width
    document.getElementById('progress-bar').style.width = `${progress_percentage}%`;
    
    // Update text
    let text = `${step_name} (${Math.round(progress_percentage)}%)`;
    if (details) {
        text += ` - ${details}`;
    }
    document.getElementById('progress-text').textContent = text;
}
```

## ⚠️ Important Considerations

### 1. Rate Limiting
- Token streaming can be rapid; consider buffering on client
- The `StreamEventBuffer` class helps batch events server-side

### 2. Connection Management
- SSE connections are long-lived
- Implement proper timeout handling
- Client should handle reconnection

### 3. Error Handling
- Errors are streamed as events
- Client should handle error events gracefully
- Connection errors require reconnection

### 4. Concurrency
- Each request creates a new agent instance
- Multiple concurrent streams are supported
- Resource usage scales with concurrent connections

### 5. Proxy/Load Balancer Configuration
- Disable buffering: `X-Accel-Buffering: no`
- Keep connections alive
- Configure appropriate timeouts

## 🎯 Integration Best Practices

1. **Progressive Enhancement**
   - Keep non-streaming endpoint as fallback
   - Detect SSE support before using streaming

2. **UI Updates**
   - Show reasoning steps in real-time
   - Indicate which tool is being used
   - Stream tokens for immediate feedback

3. **Error Recovery**
   - Implement exponential backoff for reconnection
   - Store partial results
   - Provide user feedback on connection issues

4. **Performance**
   - Use event buffering to reduce UI updates
   - Throttle token display if needed
   - Clean up event listeners properly

## 🚀 Next Steps

1. **WebSocket Support** (if bidirectional communication needed)
2. **Event Filtering** (client-specified event types)
3. ~~**Progress Indicators** (percentage completion)~~ ✅ Implemented
4. **Event Replay** (for debugging)
5. **Metrics Collection** (streaming performance)
6. **Custom Progress Stages** (configurable stages per query type)
7. **Progress Persistence** (resume from last known state)

## 📚 Additional Resources

- [LangGraph Streaming Docs](https://langchain-ai.github.io/langgraph/)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [FastAPI Streaming Response](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
