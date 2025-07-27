# 🚀 Transform API - LLM-Powered Financial Data Transformation

The Transform API is a powerful addition to the Financial MCP Agent that uses **Gemini LLM** to intelligently transform raw financial data into dashboard-ready JSON formats optimized for frontend consumption.

## 🎯 **Overview**

The Transform API bridges the gap between raw MCP financial data and frontend dashboard requirements by:

- **🤖 LLM-Powered Intelligence**: Uses Gemini 2.5 Pro to understand and restructure financial data
- **📊 Dashboard-Optimized**: Provides JSON formats perfect for charts, tables, and UI components
- **🎨 UI-Ready**: Includes colors, percentages, trends, and calculated fields
- **⚡ High Performance**: Concurrent data fetching and transformation
- **🔧 Flexible**: Custom transformation schemas and endpoints

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Transform API   │    │  Existing MCP   │
│   (Dashboard)   ├────┤  (LLM-powered)   ├────┤  Tools          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Gemini LLM      │
                       │  (Data Structuring)│
                       └──────────────────┘
```

## 📋 **API Endpoints**

### **Dashboard Endpoints**

| Endpoint | Description | Response Format |
|----------|-------------|-----------------|
| `POST /api/v1/transform/dashboard/net-worth` | Net worth with asset/liability breakdown | Dashboard charts & summaries |
| `POST /api/v1/transform/dashboard/credit-report` | Credit score analysis & account details | Credit dashboard with insights |
| `POST /api/v1/transform/dashboard/investments` | Portfolio analysis (MF + Stocks) | Investment performance dashboard |
| `POST /api/v1/transform/dashboard/banking` | Banking & spending analysis | Transaction categorization & trends |
| `POST /api/v1/transform/dashboard/epf` | EPF employment history & contributions | EPF dashboard with employer details |
| `POST /api/v1/transform/dashboard/complete` | All financial data combined | Complete financial overview |

### **Utility Endpoints**

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/transform/custom` | Custom transformation with user-defined schema |
| `GET /api/v1/transform/health` | Transform service health check |

## 🔧 **Configuration**

The Transform API uses your existing `.env` configuration:

```env
# LLM Provider Selection
GEMINI_PROVIDER=direct  # Options: 'direct' or 'vertex'

# Direct Gemini API (when GEMINI_PROVIDER=direct)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_DIRECT=gemini-2.5-pro

# Vertex AI (when GEMINI_PROVIDER=vertex)
GCP_PROJECT_ID=your_project_id
GCP_LOCATION=asia-south1
GEMINI_MODEL_VERTEX=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7

# MCP Configuration
FI_MCP_BASE_URL=https://idx-fi-mcp-dev-94592976-554022930653.asia-south1.run.app
FI_MCP_PHONE_NUMBER=your_phone_number
```

## 📊 **Response Formats**

### **Net Worth Dashboard**
```json
{
  "summary": {
    "totalNetWorth": 868721,
    "totalAssets": 932721,
    "totalLiabilities": 64000,
    "netWorthGrowth": "+12.5%"
  },
  "assetBreakdown": [
    {
      "category": "Mutual Funds",
      "value": 84613,
      "percentage": 9.7,
      "color": "#4CAF50"
    }
  ],
  "liabilityBreakdown": [
    {
      "category": "Home Loan",
      "value": 17000,
      "percentage": 26.6,
      "color": "#F44336"
    }
  ],
  "accounts": [
    {
      "bank": "HDFC Bank",
      "type": "Savings",
      "balance": 106775,
      "accountNumber": "****8697"
    }
  ]
}
```

### **Credit Report Dashboard**
```json
{
  "creditScore": {
    "score": 746,
    "rating": "Good",
    "confidenceLevel": "High",
    "trend": "+15 points",
    "color": "#4CAF50"
  },
  "accountSummary": {
    "totalAccounts": 6,
    "activeAccounts": 6,
    "defaultAccounts": 0,
    "totalOutstanding": 75000
  },
  "debtBreakdown": [
    {
      "type": "Secured",
      "amount": 44000,
      "percentage": 59,
      "color": "#2196F3"
    }
  ],
  "creditAccounts": [
    {
      "lender": "HDFC Bank",
      "type": "Credit Card",
      "balance": 5000,
      "pastDue": 1000,
      "paymentRating": "5",
      "interestRate": "11.5%",
      "status": "Active"
    }
  ]
}
```

### **Investment Dashboard**
```json
{
  "portfolioSummary": {
    "totalValue": 285255,
    "totalInvested": 238000,
    "totalReturns": 47255,
    "returnPercentage": 19.9,
    "xirr": 23.28
  },
  "assetAllocation": [
    {
      "type": "Equity Funds",
      "value": 150000,
      "percentage": 52.6,
      "color": "#4CAF50"
    }
  ],
  "topHoldings": [
    {
      "name": "ICICI Prudential Nifty 50 Index Fund",
      "type": "Mutual Fund",
      "currentValue": 20147,
      "investedValue": 20054,
      "returns": 93,
      "returnPercentage": 0.46,
      "units": 75.62
    }
  ]
}
```

## 🚀 **Usage Examples**

### **Python Client**
```python
import requests

# Configuration
base_url = "http://localhost:8080"
headers = {
    "Content-Type": "application/json",
    "X-Phone-Number": "2222222222"
}

# Get Net Worth Dashboard
response = requests.post(
    f"{base_url}/api/v1/transform/dashboard/net-worth",
    headers=headers
)

if response.status_code == 200:
    dashboard_data = response.json()
    print(f"Net Worth: ₹{dashboard_data['summary']['totalNetWorth']:,.2f}")
else:
    print(f"Error: {response.text}")
```

### **cURL Examples**

**Net Worth Dashboard:**
```bash
curl -X POST http://localhost:8080/api/v1/transform/dashboard/net-worth \
  -H "Content-Type: application/json" \
  -H "X-Phone-Number: 2222222222"
```

**Complete Dashboard:**
```bash
curl -X POST http://localhost:8080/api/v1/transform/dashboard/complete \
  -H "Content-Type: application/json" \
  -H "X-Phone-Number: 2222222222"
```

**Health Check:**
```bash
curl -X GET http://localhost:8080/api/v1/transform/health
```

### **JavaScript/Frontend Integration**
```javascript
// Fetch net worth dashboard data
async function fetchNetWorthDashboard() {
    try {
        const response = await fetch('/api/v1/transform/dashboard/net-worth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Phone-Number': '2222222222'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Use data for charts and UI
            updateNetWorthChart(data.assetBreakdown);
            updateSummaryCards(data.summary);
            updateAccountsList(data.accounts);
        }
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
    }
}

// Update pie chart with asset breakdown
function updateNetWorthChart(assetBreakdown) {
    const chartData = assetBreakdown.map(asset => ({
        label: asset.category,
        value: asset.value,
        color: asset.color
    }));
    
    // Use with Chart.js, D3.js, or any charting library
    renderPieChart(chartData);
}
```

## 🧪 **Testing**

### **Run Test Suite**
```bash
# Install dependencies
pip install requests

# Run the test suite
python examples/transform_example.py
```

### **Test Individual Endpoints**
```python
from examples.transform_example import TransformAPIClient

# Initialize client
client = TransformAPIClient(
    base_url="http://localhost:8080",
    phone_number="2222222222"
)

# Test specific endpoint
result = client.test_net_worth_dashboard()
print(result)
```

## 🎨 **Frontend Integration Guide**

### **Dashboard Components**

**1. Net Worth Summary Card**
```javascript
function NetWorthSummary({ data }) {
    return (
        <div className="summary-card">
            <h3>Net Worth</h3>
            <div className="amount">₹{data.summary.totalNetWorth.toLocaleString()}</div>
            <div className="growth">{data.summary.netWorthGrowth}</div>
        </div>
    );
}
```

**2. Asset Allocation Pie Chart**
```javascript
function AssetAllocationChart({ data }) {
    const chartData = data.assetBreakdown.map(asset => ({
        name: asset.category,
        value: asset.value,
        fill: asset.color
    }));
    
    return (
        <PieChart width={400} height={300}>
            <Pie data={chartData} dataKey="value" nameKey="name" />
        </PieChart>
    );
}
```

**3. Credit Score Gauge**
```javascript
function CreditScoreGauge({ data }) {
    const { score, rating, color } = data.creditScore;
    
    return (
        <div className="credit-score-gauge">
            <div className="score" style={{ color }}>
                {score}
            </div>
            <div className="rating">{rating}</div>
        </div>
    );
}
```

## 🔍 **Advanced Features**

### **Custom Transformations**
```python
# Custom schema for specific requirements
custom_schema = {
    "summary": {
        "totalValue": "number",
        "categories": ["string"]
    },
    "breakdown": [
        {
            "name": "string",
            "amount": "number",
            "trend": "string"
        }
    ]
}

# Use custom transformation
response = requests.post(
    f"{base_url}/api/v1/transform/custom",
    headers=headers,
    json={
        "tool_name": "fetch_net_worth",
        "target_schema": custom_schema
    }
)
```

### **Error Handling**
```python
def handle_transform_response(response):
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 500:
        error_data = response.json()
        if error_data.get("fallback_data"):
            # Use fallback data
            return error_data["fallback_data"]
        else:
            # Handle error
            raise Exception(f"Transform failed: {error_data['error']}")
    else:
        raise Exception(f"HTTP {response.status_code}: {response.text}")
```

## 📈 **Performance Optimization**

### **Concurrent Data Fetching**
The API automatically fetches multiple data sources concurrently:
- Net worth + Credit report + Investments + Banking + EPF data fetched in parallel
- LLM transformations run concurrently for different data types
- Optimized for minimal response time

### **Caching Recommendations**
```python
# Implement caching for frequently accessed data
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_dashboard(phone_number, dashboard_type):
    cache_key = f"dashboard:{phone_number}:{dashboard_type}"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # Fetch from API if not cached
    response = fetch_dashboard_data(dashboard_type)
    
    # Cache for 5 minutes
    redis_client.setex(cache_key, 300, json.dumps(response))
    
    return response
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**1. LLM Transformation Fails**
```python
# Check health endpoint
response = requests.get("http://localhost:8080/api/v1/transform/health")
health_data = response.json()

if health_data["status"] != "healthy":
    print(f"LLM Issue: {health_data.get('error', 'Unknown error')}")
```

**2. MCP Data Fetch Fails**
```python
# Check original MCP endpoints
response = requests.post(
    "http://localhost:8080/agent/tool/fetch_net_worth",
    headers={"X-Phone-Number": "2222222222"}
)

if response.status_code != 200:
    print(f"MCP Issue: {response.text}")
```

**3. Invalid Phone Number**
- Ensure phone number is provided in `X-Phone-Number` header
- Use the same phone number configured in `.env` file
- Format: "2222222222" (10 digits)

### **Debug Mode**
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# The transform service will log detailed information
```

## 🚀 **Deployment**

### **Production Considerations**

1. **Environment Variables**
   ```env
   GEMINI_PROVIDER=vertex  # Use Vertex AI for production
   GEMINI_TEMPERATURE=0.5  # Lower temperature for consistency
   ```

2. **Rate Limiting**
   - Implement rate limiting for transform endpoints
   - Consider LLM API quotas and costs

3. **Monitoring**
   - Monitor LLM response times and success rates
   - Set up alerts for transformation failures

4. **Caching**
   - Implement Redis caching for frequently accessed data
   - Cache transformed results for 5-15 minutes

## 📚 **API Reference**

### **Request Headers**
- `Content-Type: application/json` (required)
- `X-Phone-Number: string` (required) - Phone number for MCP authentication

### **Response Format**
All endpoints return JSON with consistent structure:
```json
{
  "data": { /* transformed data */ },
  "metadata": { /* transformation info */ },
  "timestamp": "2025-01-25T12:00:00Z"
}
```

### **Error Responses**
```json
{
  "error": "Error description",
  "error_type": "error_category",
  "details": { /* additional context */ },
  "fallback_data": { /* fallback if available */ }
}
```

## 🎉 **Next Steps**

1. **Start the Server**
   ```bash
   python main.py
   ```

2. **Test the API**
   ```bash
   python examples/transform_example.py
   ```

3. **Integrate with Frontend**
   - Use the provided JSON schemas
   - Implement dashboard components
   - Add error handling and loading states

4. **Customize**
   - Modify transformation prompts in `services/llm_transform_service.py`
   - Add new dashboard endpoints as needed
   - Implement custom business logic

---

**🏦 Transform API - Making Financial Data Dashboard-Ready with AI Intelligence!**
