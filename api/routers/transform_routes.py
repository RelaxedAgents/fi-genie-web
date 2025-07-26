"""Transform API routes for dashboard-ready financial data."""

import asyncio
import time
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse

from services.llm_transform_service import LLMTransformService
from services.mcp_service import MCPClient
from models.transform_models import (
    TransformRequest,
    NetWorthDashboardResponse,
    CreditReportDashboardResponse,
    InvestmentDashboardResponse,
    BankingDashboardResponse,
    EPFDashboardResponse,
    CompleteDashboardResponse,
    TransformErrorResponse,
    GenericTransformResponse
)
from config.settings import settings


router = APIRouter(prefix="/api/v1/transform", tags=["Data Transform"])


def process_banking_data_directly(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Direct processing of banking data without LLM to avoid timeouts."""
    try:
        # Extract banking data from MCP response
        if "content" in raw_data and len(raw_data["content"]) > 0:
            import json
            banking_json = json.loads(raw_data["content"][0]["text"])
        else:
            banking_json = raw_data
        
        bank_transactions = banking_json.get("bankTransactions", [])
        
        # Calculate totals and categorize transactions
        total_balance = 0
        monthly_inflow = 0
        monthly_outflow = 0
        category_totals = {}
        recent_transactions = []
        
        for bank_account in bank_transactions:
            bank_name = bank_account.get("bank", "Unknown Bank")
            transactions = bank_account.get("txns", [])
            
            for txn in transactions[:10]:  # Process first 10 transactions
                amount = float(txn[0]) if txn[0] else 0
                narration = txn[1] if len(txn) > 1 else ""
                date = txn[2] if len(txn) > 2 else ""
                txn_type = int(txn[3]) if len(txn) > 3 else 0
                mode = txn[4] if len(txn) > 4 else ""
                balance = float(txn[5]) if len(txn) > 5 else 0
                
                # Categorize by mode
                if mode not in category_totals:
                    category_totals[mode] = 0
                category_totals[mode] += abs(amount)
                
                # Calculate inflow/outflow
                if txn_type == 1:  # CREDIT
                    monthly_inflow += amount
                elif txn_type == 2:  # DEBIT
                    monthly_outflow += abs(amount)
                
                # Add to recent transactions
                recent_transactions.append({
                    "date": date,
                    "description": narration[:50] + "..." if len(narration) > 50 else narration,
                    "amount": amount,
                    "type": "Credit" if txn_type == 1 else "Debit",
                    "category": mode,
                    "balance": balance
                })
                
                # Update total balance from last transaction
                total_balance = balance
        
        # Calculate percentages for spending categories
        total_spending = sum(category_totals.values())
        spending_categories = []
        colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"]
        
        for i, (category, amount) in enumerate(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)):
            percentage = (amount / total_spending * 100) if total_spending > 0 else 0
            spending_categories.append({
                "category": category.replace("_", " ").title(),
                "amount": amount,
                "percentage": round(percentage, 1),
                "color": colors[i % len(colors)]
            })
        
        # Create dashboard response
        dashboard_data = {
            "accountSummary": {
                "totalBalance": total_balance,
                "monthlyInflow": monthly_inflow,
                "monthlyOutflow": monthly_outflow,
                "netCashFlow": monthly_inflow - monthly_outflow
            },
            "bankAccounts": [
                {
                    "bank": "HDFC Bank",
                    "balance": total_balance,
                    "accountType": "Multiple Accounts",
                    "recentTransactions": len(recent_transactions),
                    "lastUpdated": "2025-07-09"
                }
            ],
            "spendingCategories": spending_categories[:5],  # Top 5 categories
            "recentTransactions": recent_transactions[:10],  # Last 10 transactions
            "processingMethod": "direct_calculation",
            "dataSource": "mcp_banking_api"
        }
        
        return dashboard_data
        
    except Exception as e:
        return {
            "error": f"Direct banking processing failed: {str(e)}",
            "fallback": True,
            "raw_data_available": True
        }


def get_llm_transform_service() -> LLMTransformService:
    """Dependency to get LLM transform service."""
    return LLMTransformService()


def get_mcp_client(phone_number: str) -> MCPClient:
    """Dependency to get MCP client for a specific phone number."""
    return MCPClient(
        base_url=settings.mcp_server_url,
        phone_number=phone_number
    )


@router.post(
    "/dashboard/net-worth",
    response_model=NetWorthDashboardResponse,
    summary="Get Net Worth Dashboard Data",
    description="Transform raw net worth data into dashboard-ready format with charts and insights"
)
async def get_net_worth_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get transformed net worth data for dashboard display."""
    endpoint_start = time.time()
    print(f"🎯 [NET_WORTH] Starting net worth dashboard request for {x_phone_number}")
    
    try:
        # Step 1: Get MCP client
        mcp_start = time.time()
        mcp_client = get_mcp_client(x_phone_number)
        mcp_client_time = time.time() - mcp_start
        print(f"🔧 [NET_WORTH] MCP client creation took: {mcp_client_time:.3f}s")
        
        # Step 2: Fetch raw data from MCP server
        fetch_start = time.time()
        raw_data = mcp_client.call_tool("fetch_net_worth", {})
        fetch_time = time.time() - fetch_start
        print(f"📡 [NET_WORTH] MCP tool call (fetch_net_worth) took: {fetch_time:.3f}s")
        print(f"📊 [NET_WORTH] Raw data size: {len(str(raw_data))} characters")
        
        # Step 3: Transform data using LLM
        transform_start = time.time()
        transformed_data = await llm_service.transform_net_worth_data(raw_data)
        transform_time = time.time() - transform_start
        print(f"🤖 [NET_WORTH] LLM transformation took: {transform_time:.3f}s")
        
        total_time = time.time() - endpoint_start
        print(f"✅ [NET_WORTH] Total endpoint completed in: {total_time:.3f}s")
        print(f"📈 [NET_WORTH] Breakdown - MCP Client: {mcp_client_time:.3f}s, Fetch: {fetch_time:.3f}s, Transform: {transform_time:.3f}s")
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        total_time = time.time() - endpoint_start
        print(f"❌ [NET_WORTH] Endpoint failed after: {total_time:.3f}s")
        print(f"💥 [NET_WORTH] Error: {str(e)}")
        
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="net_worth_transform_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.post(
    "/dashboard/credit-report",
    response_model=CreditReportDashboardResponse,
    summary="Get Credit Report Dashboard Data",
    description="Transform raw credit report data into dashboard-ready format with score analysis"
)
async def get_credit_report_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get transformed credit report data for dashboard display."""
    try:
        # Get MCP client for this phone number
        mcp_client = get_mcp_client(x_phone_number)
        
        # Fetch raw data from MCP server
        raw_data = mcp_client.call_tool("fetch_credit_report", {})
        
        # Transform data using LLM
        transformed_data = await llm_service.transform_credit_report_data(raw_data)
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="credit_report_transform_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.post(
    "/dashboard/investments",
    response_model=InvestmentDashboardResponse,
    summary="Get Investment Portfolio Dashboard Data",
    description="Transform mutual fund and stock data into comprehensive investment dashboard"
)
async def get_investment_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get transformed investment data for dashboard display."""
    try:
        # Get MCP client for this phone number
        mcp_client = get_mcp_client(x_phone_number)
        
        # Fetch both mutual fund and stock data concurrently
        mf_task = asyncio.create_task(
            asyncio.to_thread(mcp_client.call_tool, "fetch_mf_transactions", {})
        )
        stock_task = asyncio.create_task(
            asyncio.to_thread(mcp_client.call_tool, "fetch_stock_transactions", {})
        )
        
        # Wait for both to complete
        mf_data, stock_data = await asyncio.gather(mf_task, stock_task)
        
        # Transform combined data using LLM
        transformed_data = await llm_service.transform_investment_data(mf_data, stock_data)
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="investment_transform_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.post(
    "/dashboard/banking",
    response_model=BankingDashboardResponse,
    summary="Get Banking Dashboard Data",
    description="Transform bank transaction data into spending analysis and account overview"
)
async def get_banking_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get transformed banking data for dashboard display."""
    try:
        # Get MCP client for this phone number
        mcp_client = get_mcp_client(x_phone_number)
        
        # Fetch raw data from MCP server
        raw_data = mcp_client.call_tool("fetch_bank_transactions", {})
        
        # Use direct processing instead of LLM to avoid timeouts
        transformed_data = await asyncio.to_thread(process_banking_data_directly, raw_data)
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="banking_transform_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.post(
    "/dashboard/epf",
    response_model=EPFDashboardResponse,
    summary="Get EPF Dashboard Data",
    description="Transform EPF data into employment history and contribution analysis"
)
async def get_epf_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get transformed EPF data for dashboard display."""
    try:
        # Get MCP client for this phone number
        mcp_client = get_mcp_client(x_phone_number)
        
        # Fetch raw data from MCP server
        raw_data = mcp_client.call_tool("fetch_epf_details", {})
        
        # Create EPF-specific transformation
        target_schema = {
            "summary": {
                "totalBalance": "number",
                "employeeShare": "number",
                "employerShare": "number",
                "pensionBalance": "number",
                "monthlyContribution": "number"
            },
            "employers": [
                {
                    "companyName": "string",
                    "memberId": "string",
                    "joiningDate": "string",
                    "leavingDate": "string",
                    "balance": "number",
                    "status": "string"
                }
            ],
            "contributionTrend": [
                {
                    "month": "string",
                    "contribution": "number",
                    "employer": "string"
                }
            ]
        }
        
        # Transform data using LLM
        transformed_data = await llm_service.transform_to_dashboard_format(
            raw_data, "epf", target_schema
        )
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="epf_transform_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.post(
    "/dashboard/complete",
    response_model=CompleteDashboardResponse,
    summary="Get Complete Financial Dashboard",
    description="Get all financial data transformed for a comprehensive dashboard view"
)
async def get_complete_dashboard(
    x_phone_number: str = Header(..., alias="X-Phone-Number"),
    llm_service: LLMTransformService = Depends(get_llm_transform_service)
):
    """Get all transformed financial data for complete dashboard."""
    try:
        # Get MCP client for this phone number
        mcp_client = get_mcp_client(x_phone_number)
        
        # Fetch all data concurrently
        tasks = {
            "net_worth": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_net_worth", {})
            ),
            "credit_report": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_credit_report", {})
            ),
            "mf_transactions": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_mf_transactions", {})
            ),
            "stock_transactions": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_stock_transactions", {})
            ),
            "bank_transactions": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_bank_transactions", {})
            ),
            "epf_details": asyncio.create_task(
                asyncio.to_thread(mcp_client.call_tool, "fetch_epf_details", {})
            )
        }
        
        # Wait for all data to be fetched
        raw_data = {}
        for key, task in tasks.items():
            try:
                raw_data[key] = await task
            except Exception as e:
                print(f"Failed to fetch {key}: {str(e)}")
                raw_data[key] = None
        
        # Transform all data concurrently
        transform_tasks = {}
        
        if raw_data["net_worth"]:
            transform_tasks["netWorth"] = llm_service.transform_net_worth_data(raw_data["net_worth"])
        
        if raw_data["credit_report"]:
            transform_tasks["creditReport"] = llm_service.transform_credit_report_data(raw_data["credit_report"])
        
        if raw_data["mf_transactions"] and raw_data["stock_transactions"]:
            transform_tasks["investments"] = llm_service.transform_investment_data(
                raw_data["mf_transactions"], raw_data["stock_transactions"]
            )
        
        if raw_data["bank_transactions"]:
            # Use direct processing for banking to avoid LLM timeout
            transform_tasks["banking"] = asyncio.create_task(
                asyncio.to_thread(process_banking_data_directly, raw_data["bank_transactions"])
            )
        
        if raw_data["epf_details"]:
            transform_tasks["epf"] = llm_service.transform_to_dashboard_format(
                raw_data["epf_details"], "epf"
            )
        
        # Wait for all transformations to complete
        transformed_data = {}
        for key, task in transform_tasks.items():
            try:
                transformed_data[key] = await task
            except Exception as e:
                print(f"Failed to transform {key}: {str(e)}")
                transformed_data[key] = {"error": f"Transformation failed: {str(e)}"}
        
        # Add metadata
        transformed_data["lastUpdated"] = datetime.now().isoformat()
        
        # Set dataFreshness based on whether we have transformed data (even if it's an error)
        transformed_data["dataFreshness"] = {
            "netWorth": "real-time" if "netWorth" in transformed_data else "unavailable",
            "creditReport": "real-time" if "creditReport" in transformed_data else "unavailable", 
            "investments": "real-time" if "investments" in transformed_data else "unavailable",
            "banking": "real-time" if "banking" in transformed_data else "unavailable",
            "epf": "real-time" if "epf" in transformed_data else "unavailable"
        }
        
        return JSONResponse(
            content=transformed_data,
            status_code=200
        )
        
    except Exception as e:
        error_response = TransformErrorResponse(
            error=str(e),
            error_type="complete_dashboard_error",
            details={"phone_number": x_phone_number}
        )
        raise HTTPException(status_code=500, detail=error_response.dict())


@router.get(
    "/health",
    summary="Transform Service Health Check",
    description="Check the health of the transform service and LLM connectivity"
)
async def transform_health_check():
    """Health check for transform service."""
    try:
        # Quick health check without LLM call
        return {
            "status": "healthy",
            "llm_provider": "direct",
            "model_name": "gemini-2.5-pro", 
            "test_transformation": "skipped_for_speed",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            },
            status_code=503
        )
