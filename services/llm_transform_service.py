"""LLM-powered data transformation service using Gemini."""

import os
import json
import asyncio
import time
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import aiplatform
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, SystemMessage

# Ensure .env file is loaded
load_dotenv()


class LLMTransformService:
    """Service for transforming financial data using LLM intelligence."""
    
    def __init__(self):
        """Initialize the LLM transform service based on .env configuration."""
        self.provider = os.getenv('GEMINI_PROVIDER', 'direct')
        self.temperature = float(os.getenv('GEMINI_TEMPERATURE', '0.7'))
        
        if self.provider == 'direct':
            # Try multiple API key sources
            self.api_key = (
                os.getenv('GEMINI_API_KEY') or 
                os.getenv('GOOGLE_API_KEY')
            )
            self.model_name = os.getenv('GEMINI_MODEL_DIRECT', 'gemini-2.5-pro')
            
            if self.api_key:
                # Ensure both environment variables are set for compatibility
                os.environ['GOOGLE_API_KEY'] = self.api_key
                os.environ['GEMINI_API_KEY'] = self.api_key
                
                # Configure the Gemini API
                genai.configure(api_key=self.api_key)
                print(f"LLM Transform Service: API key configured for {self.model_name}")
            else:
                print("Warning: No API key found for LLM Transform Service - using fallback mode")
            
            self.model = genai.GenerativeModel(self.model_name)
        else:
            # Vertex AI configuration
            self.project_id = os.getenv('GCP_PROJECT_ID')
            self.location = os.getenv('GCP_LOCATION', 'asia-south1')
            self.model_name = os.getenv('GEMINI_MODEL_VERTEX', 'gemini-1.5-flash')
            
            aiplatform.init(project=self.project_id, location=self.location)
            self.model = ChatVertexAI(
                model_name=self.model_name,
                project=self.project_id,
                location=self.location,
                temperature=self.temperature
            )
    
    async def transform_to_dashboard_format(
        self, 
        raw_data: Dict[str, Any], 
        data_type: str,
        target_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Transform raw financial data to dashboard-ready format using LLM.
        
        Args:
            raw_data: Raw data from MCP tools
            data_type: Type of data (net_worth, credit_report, etc.)
            target_schema: Optional target schema for transformation
            
        Returns:
            Transformed data in dashboard format
        """
        start_time = time.time()
        print(f"🚀 [TIMER] Starting LLM transformation for {data_type}")
        
        try:
            # Step 1: Build prompt
            prompt_start = time.time()
            prompt = self._build_transform_prompt(raw_data, data_type, target_schema)
            prompt_time = time.time() - prompt_start
            print(f"⚡ [TIMER] Prompt building took: {prompt_time:.3f}s")
            print(f"📏 [INFO] Prompt length: {len(prompt)} characters")
            
            # Step 2: LLM API call
            llm_start = time.time()
            if self.provider == 'direct':
                response = await self._transform_with_direct_api(prompt)
            else:
                response = await self._transform_with_vertex_ai(prompt)
            llm_time = time.time() - llm_start
            print(f"🤖 [TIMER] LLM API call took: {llm_time:.3f}s")
            print(f"📄 [INFO] Response length: {len(response)} characters")
            
            # Step 3: Parse response
            parse_start = time.time()
            transformed_data = self._parse_llm_response(response)
            parse_time = time.time() - parse_start
            print(f"🔍 [TIMER] Response parsing took: {parse_time:.3f}s")
            
            total_time = time.time() - start_time
            print(f"✅ [TIMER] Total transformation completed in: {total_time:.3f}s")
            
            return transformed_data
            
        except Exception as e:
            total_time = time.time() - start_time
            print(f"❌ [TIMER] Transformation failed after: {total_time:.3f}s")
            print(f"Error in LLM transformation: {str(e)}")
            # Fallback to basic transformation
            return self._fallback_transform(raw_data, data_type)
    
    def _build_transform_prompt(
        self, 
        raw_data: Dict[str, Any], 
        data_type: str,
        target_schema: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build a simple, fast transformation prompt."""
        
        # Preprocess and truncate data
        processed_data = self._preprocess_raw_data(raw_data, data_type)
        raw_data_str = json.dumps(processed_data, indent=2)
        original_size = len(raw_data_str)
        
        # More aggressive truncation for speed
        if original_size > 15000:  # Reduced from 30KB
            truncated_data = self._truncate_large_data(processed_data, data_type)
            raw_data_str = json.dumps(truncated_data, indent=2)
            print(f"🔄 [PROMPT] Truncated data from {original_size} to {len(raw_data_str)} characters")
        
        # Ultra-simple prompt for speed
        prompt = f"""Convert to dashboard JSON:

Type: {data_type}
Data: {raw_data_str}

Return JSON with summary, breakdown by category with percentages, and recent items. Use INR amounts and hex colors.
"""
        
        return prompt
    
    def _preprocess_raw_data(self, raw_data: Dict[str, Any], data_type: str) -> Dict[str, Any]:
        """Preprocess raw data to extract nested JSON strings and simplify structure."""
        
        if data_type == "investments":
            # Handle nested JSON strings in investment data
            processed_data = {}
            
            if "mutual_funds" in raw_data:
                mf_content = raw_data["mutual_funds"].get("content", [])
                if mf_content and len(mf_content) > 0:
                    text_content = mf_content[0].get("text", "{}")
                    try:
                        mf_json = json.loads(text_content)
                        processed_data["mutual_funds"] = mf_json
                    except:
                        processed_data["mutual_funds"] = {"error": "Failed to parse MF data"}
            
            if "stocks" in raw_data:
                stock_content = raw_data["stocks"].get("content", [])
                if stock_content and len(stock_content) > 0:
                    text_content = stock_content[0].get("text", "{}")
                    try:
                        stock_json = json.loads(text_content)
                        processed_data["stocks"] = stock_json
                    except:
                        processed_data["stocks"] = {"error": "Failed to parse stock data"}
            
            return processed_data
            
        elif data_type == "banking":
            # Handle nested JSON strings in banking data
            if "content" in raw_data and len(raw_data["content"]) > 0:
                text_content = raw_data["content"][0].get("text", "{}")
                try:
                    banking_json = json.loads(text_content)
                    return banking_json
                except:
                    return {"error": "Failed to parse banking data"}
            
            return raw_data
        
        return raw_data
    
    def _truncate_large_data(self, raw_data: Dict[str, Any], data_type: str) -> Dict[str, Any]:
        """Truncate large data to reduce prompt size while keeping essential information."""
        
        if data_type == "net_worth":
            # Keep ALL essential net worth data - don't truncate the core data
            truncated = {}
            if "netWorthResponse" in raw_data:
                truncated["netWorthResponse"] = raw_data["netWorthResponse"]  # Keep everything
            
            # Keep account details but limit to top-level structure
            if "accountDetailsBulkResponse" in raw_data:
                account_details = raw_data["accountDetailsBulkResponse"]
                if "accountDetailsMap" in account_details:
                    # Keep first 8 accounts only to reduce size
                    account_map = account_details["accountDetailsMap"]
                    limited_accounts = dict(list(account_map.items())[:8])
                    truncated["accountDetailsBulkResponse"] = {"accountDetailsMap": limited_accounts}
            
            return truncated
            
        elif data_type == "investments":
            # AGGRESSIVE truncation for investments
            truncated = {}
            if "mutual_funds" in raw_data:
                mf_data = raw_data["mutual_funds"]
                if "mfTransactions" in mf_data:
                    # Keep only first 3 MF transactions
                    truncated["mutual_funds"] = {"mfTransactions": mf_data["mfTransactions"][:3]}
                elif "mfSchemeAnalytics" in mf_data:
                    # Keep only top 2 schemes with essential data
                    schemes = mf_data["mfSchemeAnalytics"].get("schemeAnalytics", [])[:2]
                    simplified_schemes = []
                    for scheme in schemes:
                        simplified_schemes.append({
                            "schemeDetail": scheme.get("schemeDetail", {}),
                            "currentValue": scheme.get("enrichedAnalytics", {}).get("analytics", {}).get("schemeDetails", {}).get("currentValue", {})
                        })
                    truncated["mutual_funds"] = {"schemeAnalytics": simplified_schemes}
            
            if "stocks" in raw_data:
                stock_data = raw_data["stocks"]
                if "stockTransactions" in stock_data:
                    # Keep only first 3 stock transactions
                    truncated["stocks"] = {"stockTransactions": stock_data["stockTransactions"][:3]}
            
            return truncated
            
        elif data_type == "banking":
            # MODERATE truncation for banking - only 8 transactions from first bank
            truncated = {}
            if "bankTransactions" in raw_data:
                # Keep only first bank and only 8 transactions
                bank_data = raw_data["bankTransactions"][0] if raw_data["bankTransactions"] else {}
                if "txns" in bank_data:
                    # Keep only first 8 transactions
                    bank_data["txns"] = bank_data["txns"][:8]
                truncated["bankTransactions"] = [bank_data]
                truncated["schemaDescription"] = "Bank transactions. Schema: [amount, narration, date, type(1=CREDIT,2=DEBIT), mode, balance]"
            return truncated
            
        elif data_type == "epf":
            # Truncate EPF data
            truncated = {}
            if "uanAccounts" in raw_data:
                accounts = raw_data["uanAccounts"][:1]  # Keep only first account
                truncated["uanAccounts"] = accounts
            return truncated
            
        else:
            # For other data types, just return first 100 items if it's a list
            if isinstance(raw_data, list):
                return raw_data[:100]
            elif isinstance(raw_data, dict):
                # Keep only the first few keys
                truncated = {}
                count = 0
                for key, value in raw_data.items():
                    if count >= 10:  # Limit to 10 top-level keys
                        break
                    truncated[key] = value
                    count += 1
                return truncated
            
            return raw_data
    
    async def _transform_with_direct_api(self, prompt: str) -> str:
        """Transform data using direct Gemini API."""
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.temperature,
                    max_output_tokens=8192,
                )
            )
            return response.text
        except Exception as e:
            raise Exception(f"Direct API transformation failed: {str(e)}")
    
    async def _transform_with_vertex_ai(self, prompt: str) -> str:
        """Transform data using Vertex AI."""
        try:
            messages = [
                SystemMessage(content="You are a financial data transformation expert."),
                HumanMessage(content=prompt)
            ]
            response = await self.model.ainvoke(messages)
            return response.content
        except Exception as e:
            raise Exception(f"Vertex AI transformation failed: {str(e)}")
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse and validate LLM response."""
        try:
            # Clean the response (remove markdown formatting if present)
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
            
            # Parse JSON
            parsed_data = json.loads(cleaned_response.strip())
            return parsed_data
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse LLM response as JSON: {str(e)}")
            print(f"Raw response: {response}")
            raise Exception("Invalid JSON response from LLM")
    
    def _fallback_transform(self, raw_data: Dict[str, Any], data_type: str) -> Dict[str, Any]:
        """Fallback transformation when LLM fails."""
        return {
            "error": "LLM transformation failed",
            "fallback": True,
            "data_type": data_type,
            "raw_data": raw_data,
            "message": "Using fallback transformation. Please check LLM configuration."
        }
    
    async def transform_net_worth_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Specific transformation for net worth data."""
        target_schema = {
            "summary": {
                "totalNetWorth": "number",
                "totalAssets": "number", 
                "totalLiabilities": "number",
                "netWorthGrowth": "string"
            },
            "assetBreakdown": [
                {
                    "category": "string",
                    "value": "number",
                    "percentage": "number",
                    "color": "string"
                }
            ],
            "liabilityBreakdown": [
                {
                    "category": "string",
                    "value": "number", 
                    "percentage": "number",
                    "color": "string"
                }
            ],
            "accounts": [
                {
                    "bank": "string",
                    "type": "string",
                    "balance": "number",
                    "accountNumber": "string"
                }
            ]
        }
        
        return await self.transform_to_dashboard_format(raw_data, "net_worth", target_schema)
    
    async def transform_credit_report_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Specific transformation for credit report data."""
        target_schema = {
            "creditScore": {
                "score": "number",
                "rating": "string",
                "confidenceLevel": "string",
                "trend": "string",
                "color": "string"
            },
            "accountSummary": {
                "totalAccounts": "number",
                "activeAccounts": "number",
                "defaultAccounts": "number",
                "totalOutstanding": "number"
            },
            "debtBreakdown": [
                {
                    "type": "string",
                    "amount": "number",
                    "percentage": "number",
                    "color": "string"
                }
            ],
            "creditAccounts": [
                {
                    "lender": "string",
                    "type": "string",
                    "balance": "number",
                    "pastDue": "number",
                    "paymentRating": "string",
                    "interestRate": "string",
                    "status": "string"
                }
            ],
            "recentInquiries": [
                {
                    "lender": "string",
                    "date": "string",
                    "purpose": "string"
                }
            ]
        }
        
        return await self.transform_to_dashboard_format(raw_data, "credit_report", target_schema)
    
    async def transform_investment_data(self, mf_data: Dict[str, Any], stock_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform combined investment data (MF + Stocks)."""
        combined_data = {
            "mutual_funds": mf_data,
            "stocks": stock_data
        }
        
        target_schema = {
            "portfolioSummary": {
                "totalValue": "number",
                "totalInvested": "number",
                "totalReturns": "number",
                "returnPercentage": "number",
                "xirr": "number"
            },
            "assetAllocation": [
                {
                    "type": "string",
                    "value": "number",
                    "percentage": "number",
                    "color": "string"
                }
            ],
            "topHoldings": [
                {
                    "name": "string",
                    "type": "string",
                    "currentValue": "number",
                    "investedValue": "number",
                    "returns": "number",
                    "returnPercentage": "number",
                    "units": "number"
                }
            ],
            "recentTransactions": [
                {
                    "date": "string",
                    "type": "string",
                    "scheme": "string",
                    "amount": "number",
                    "units": "number",
                    "nav": "number"
                }
            ]
        }
        
        return await self.transform_to_dashboard_format(combined_data, "investments", target_schema)
    
    async def transform_banking_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Specific transformation for banking data."""
        target_schema = {
            "accountSummary": {
                "totalBalance": "number",
                "monthlyInflow": "number",
                "monthlyOutflow": "number",
                "netCashFlow": "number"
            },
            "bankAccounts": [
                {
                    "bank": "string",
                    "balance": "number",
                    "accountType": "string",
                    "recentTransactions": "number",
                    "lastUpdated": "string"
                }
            ],
            "spendingCategories": [
                {
                    "category": "string",
                    "amount": "number",
                    "percentage": "number",
                    "color": "string"
                }
            ],
            "recentTransactions": [
                {
                    "date": "string",
                    "description": "string",
                    "amount": "number",
                    "type": "string",
                    "category": "string",
                    "balance": "number"
                }
            ]
        }
        
        return await self.transform_to_dashboard_format(raw_data, "banking", target_schema)
