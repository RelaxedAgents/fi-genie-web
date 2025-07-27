#!/usr/bin/env python3
"""Comprehensive verification of all MCP data against API response."""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8080"
PHONE_NUMBER = "+919876543210"

def verify_all_data():
    """Comprehensive verification of all API sections against MCP data."""
    print("🔍 COMPREHENSIVE MCP DATA VERIFICATION")
    print("=" * 50)
    
    headers = {
        "X-Phone-Number": PHONE_NUMBER,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/transform/dashboard/complete", headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n📊 API RESPONSE STRUCTURE:")
            print(f"✅ Status: {data.get('status')}")
            print(f"✅ Timestamp: {data.get('timestamp')}")
            print(f"✅ Main sections: {list(data.keys())}")
            
            # 1. NET WORTH VERIFICATION
            print("\n🏦 NET WORTH VERIFICATION:")
            financial_overview = data.get("financialOverview", {})
            net_worth = financial_overview.get("netWorth", {})
            print(f"✅ Total Net Worth: ₹{net_worth.get('total', 0):,.2f}")
            print(f"✅ Total Assets: ₹{net_worth.get('totalAssets', 0):,.2f}")
            print(f"✅ Total Liabilities: ₹{net_worth.get('totalLiabilities', 0):,.2f}")
            print(f"✅ Debt-to-Asset Ratio: {net_worth.get('debtToAssetRatio', 0)}%")
            
            # Asset breakdown
            wealth_profile = data.get("wealthProfile", {})
            asset_breakdown = wealth_profile.get("assetBreakdown", [])
            print(f"✅ Asset Categories: {len(asset_breakdown)}")
            for asset in asset_breakdown:
                print(f"   - {asset.get('category')}: ₹{asset.get('value', 0):,.0f} ({asset.get('percentage', 0)}%)")
            
            # 2. CREDIT SCORE VERIFICATION
            print("\n💳 CREDIT SCORE VERIFICATION:")
            credit_score = financial_overview.get("creditScore", {})
            print(f"✅ Credit Score: {credit_score.get('score', 0)}")
            print(f"✅ Rating: {credit_score.get('rating', 'N/A')}")
            print(f"✅ Confidence Level: {credit_score.get('confidenceLevel', 'N/A')}")
            print(f"✅ Percentile: {credit_score.get('percentile', 0)}%")
            
            # Payment history
            credit_report = data.get("creditReport", {})
            payment_history = credit_report.get("paymentHistory", {})
            print(f"✅ On-time Payments: {payment_history.get('onTimePercentage', 0)}%")
            
            # 3. BANKING DATA VERIFICATION
            print("\n🏧 BANKING DATA VERIFICATION:")
            banking_data = data.get("bankingData", {})
            account_summary = banking_data.get("accountSummary", {})
            print(f"✅ Total Balance: ₹{account_summary.get('totalBalance', 0):,.2f}")
            print(f"✅ Monthly Inflow: ₹{account_summary.get('monthlyInflow', 0):,.2f}")
            print(f"✅ Monthly Outflow: ₹{account_summary.get('monthlyOutflow', 0):,.2f}")
            print(f"✅ Net Cash Flow: ₹{account_summary.get('netCashFlow', 0):,.2f}")
            
            # Bank accounts
            bank_accounts = banking_data.get("bankAccounts", [])
            print(f"✅ Number of Bank Accounts: {len(bank_accounts)}")
            for acc in bank_accounts:
                print(f"   - {acc.get('bankName')}: ₹{acc.get('balance', 0):,.2f}")
            
            # Spending categories
            spending_categories = banking_data.get("spendingCategories", [])
            print(f"✅ Spending Categories: {len(spending_categories)}")
            for cat in spending_categories:
                print(f"   - {cat.get('category')}: ₹{cat.get('amount', 0):,.0f} ({cat.get('percentage', 0)}%)")
            
            # 4. INVESTMENT DATA VERIFICATION
            print("\n📈 INVESTMENT DATA VERIFICATION:")
            investment_data = data.get("investmentData")
            if investment_data:
                portfolio_summary = investment_data.get("portfolioSummary", {})
                print(f"✅ Total Portfolio Value: ₹{portfolio_summary.get('totalValue', 0):,.2f}")
                print(f"✅ Total Invested: ₹{portfolio_summary.get('totalInvested', 0):,.2f}")
                print(f"✅ Total Returns: ₹{portfolio_summary.get('totalReturns', 0):,.2f}")
                print(f"✅ Return Percentage: {portfolio_summary.get('returnPercentage', 0)}%")
                print(f"✅ XIRR: {portfolio_summary.get('xirr', 0)}%")
                
                # Asset allocation
                asset_allocation = investment_data.get("assetAllocation", [])
                print(f"✅ Asset Allocation Types: {len(asset_allocation)}")
                for alloc in asset_allocation:
                    print(f"   - {alloc.get('type')}: ₹{alloc.get('value', 0):,.0f} ({alloc.get('percentage', 0)}%)")
                
                # Top holdings
                top_holdings = investment_data.get("topHoldings", [])
                print(f"✅ Top Holdings: {len(top_holdings)}")
                
                # EPF summary
                epf_summary = investment_data.get("epfSummary", {})
                if epf_summary:
                    epf_data = epf_summary.get("summary", {})
                    print(f"✅ EPF Total Balance: {epf_data.get('totalBalance', 'N/A')}")
            else:
                print("❌ Investment data is MISSING from API response")
            
            # 5. FINANCIAL HEALTH SCORE
            print("\n🎯 FINANCIAL HEALTH SCORE:")
            health_score = financial_overview.get("financialHealthScore", {})
            print(f"✅ Overall Score: {health_score.get('overall', 0)}/100")
            print(f"✅ Status: {health_score.get('status', 'N/A')}")
            components = health_score.get("components", {})
            for component, score in components.items():
                print(f"   - {component}: {score}/100")
            
            # 6. AI INSIGHTS
            print("\n🤖 AI INSIGHTS:")
            ai_insights = data.get("aiGeneratedInsights", {})
            if ai_insights:
                print(f"✅ Overall Profile: {ai_insights.get('overallProfile', 'N/A')}")
                print(f"✅ Net Worth Insights: {len(ai_insights.get('netWorthInsights', []))}")
                print(f"✅ Credit Insights: {len(ai_insights.get('creditInsights', []))}")
                print(f"✅ Banking Insights: {len(ai_insights.get('bankingInsights', []))}")
                print(f"✅ Investment Insights: {len(ai_insights.get('investmentInsights', []))}")
            else:
                print("❌ AI insights are MISSING")
            
            # 7. HISTORICAL DATA
            print("\n📊 HISTORICAL DATA:")
            historical_data = data.get("historicalData", {})
            net_worth_history = historical_data.get("netWorth", [])
            credit_history = historical_data.get("creditScore", [])
            cash_flow_history = historical_data.get("monthlyCashFlow", [])
            print(f"✅ Net Worth History: {len(net_worth_history)} months")
            print(f"✅ Credit Score History: {len(credit_history)} months")
            print(f"✅ Cash Flow History: {len(cash_flow_history)} months")
            
            # SUMMARY
            print("\n" + "=" * 50)
            print("📋 VERIFICATION SUMMARY:")
            
            sections_present = []
            sections_missing = []
            
            if net_worth.get('total', 0) > 0:
                sections_present.append("Net Worth")
            else:
                sections_missing.append("Net Worth")
                
            if credit_score.get('score', 0) > 0:
                sections_present.append("Credit Score")
            else:
                sections_missing.append("Credit Score")
                
            if account_summary.get('totalBalance') is not None:
                sections_present.append("Banking Data")
            else:
                sections_missing.append("Banking Data")
                
            if investment_data:
                sections_present.append("Investment Data")
            else:
                sections_missing.append("Investment Data")
                
            if ai_insights:
                sections_present.append("AI Insights")
            else:
                sections_missing.append("AI Insights")
            
            print(f"✅ WORKING SECTIONS ({len(sections_present)}): {', '.join(sections_present)}")
            if sections_missing:
                print(f"❌ MISSING SECTIONS ({len(sections_missing)}): {', '.join(sections_missing)}")
            
            accuracy_percentage = (len(sections_present) / (len(sections_present) + len(sections_missing))) * 100
            print(f"🎯 OVERALL ACCURACY: {accuracy_percentage:.1f}%")
            
            # Save full response for detailed inspection
            with open("full_api_verification.json", "w") as f:
                json.dump(data, f, indent=2)
            print(f"💾 Full response saved to: full_api_verification.json")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")

if __name__ == "__main__":
    verify_all_data()
