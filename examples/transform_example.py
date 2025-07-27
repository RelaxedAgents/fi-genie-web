"""Example usage of the Transform API endpoints."""

import asyncio
import json
import requests
from typing import Dict, Any


class TransformAPIClient:
    """Client for testing Transform API endpoints."""
    
    def __init__(self, base_url: str = "http://localhost:8080", phone_number: str = "2222222222"):
        """Initialize the client."""
        self.base_url = base_url
        self.phone_number = phone_number
        self.headers = {
            "Content-Type": "application/json",
            "X-Phone-Number": phone_number
        }
    
    def test_health_check(self) -> Dict[str, Any]:
        """Test the transform service health check."""
        print("🔍 Testing Transform Service Health Check...")
        
        try:
            response = requests.get(f"{self.base_url}/api/v1/transform/health")
            result = response.json()
            
            print(f"✅ Health Check Status: {result.get('status', 'unknown')}")
            print(f"📊 LLM Provider: {result.get('llm_provider', 'unknown')}")
            print(f"🤖 Model: {result.get('model_name', 'unknown')}")
            
            return result
            
        except Exception as e:
            print(f"❌ Health check failed: {str(e)}")
            return {"error": str(e)}
    
    def test_net_worth_dashboard(self) -> Dict[str, Any]:
        """Test net worth dashboard transformation."""
        print("\n💰 Testing Net Worth Dashboard Transform...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/transform/dashboard/net-worth",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Net Worth Dashboard Transform Successful!")
                
                # Display summary
                if "summary" in result:
                    summary = result["summary"]
                    # Handle both number and dict formats
                    total_net_worth = summary.get('totalNetWorth', 0)
                    if isinstance(total_net_worth, dict):
                        total_net_worth = total_net_worth.get('value', 0)
                    
                    total_assets = summary.get('totalAssets', 0)
                    if isinstance(total_assets, dict):
                        total_assets = total_assets.get('value', 0)
                    
                    total_liabilities = summary.get('totalLiabilities', 0)
                    if isinstance(total_liabilities, dict):
                        total_liabilities = total_liabilities.get('value', 0)
                    
                    print(f"📈 Total Net Worth: ₹{total_net_worth:,.2f}")
                    print(f"💎 Total Assets: ₹{total_assets:,.2f}")
                    print(f"💸 Total Liabilities: ₹{total_liabilities:,.2f}")
                
                # Display asset breakdown
                if "assetBreakdown" in result:
                    print("\n📊 Asset Breakdown:")
                    for asset in result["assetBreakdown"]:
                        print(f"  • {asset.get('category', 'Unknown')}: ₹{asset.get('value', 0):,.2f} ({asset.get('percentage', 0):.1f}%)")
                
                return result
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"Error: {response.text}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"❌ Net worth transform failed: {str(e)}")
            return {"error": str(e)}
    
    def test_credit_report_dashboard(self) -> Dict[str, Any]:
        """Test credit report dashboard transformation."""
        print("\n📊 Testing Credit Report Dashboard Transform...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/transform/dashboard/credit-report",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Credit Report Dashboard Transform Successful!")
                
                # Display credit score
                if "creditScore" in result:
                    score_info = result["creditScore"]
                    print(f"🎯 Credit Score: {score_info.get('score', 'N/A')} ({score_info.get('rating', 'Unknown')})")
                    print(f"📈 Trend: {score_info.get('trend', 'N/A')}")
                
                # Display account summary
                if "accountSummary" in result:
                    summary = result["accountSummary"]
                    print(f"🏦 Total Accounts: {summary.get('totalAccounts', 0)}")
                    print(f"✅ Active Accounts: {summary.get('activeAccounts', 0)}")
                    print(f"💰 Total Outstanding: ₹{summary.get('totalOutstanding', 0):,.2f}")
                
                return result
            else:
                print(f"❌ Request failed with status {response.status_code}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"❌ Credit report transform failed: {str(e)}")
            return {"error": str(e)}
    
    def test_investment_dashboard(self) -> Dict[str, Any]:
        """Test investment dashboard transformation."""
        print("\n📈 Testing Investment Dashboard Transform...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/transform/dashboard/investments",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Investment Dashboard Transform Successful!")
                
                # Display portfolio summary
                if "portfolioSummary" in result:
                    portfolio = result["portfolioSummary"]
                    print(f"💼 Total Portfolio Value: ₹{portfolio.get('totalValue', 0):,.2f}")
                    print(f"💰 Total Invested: ₹{portfolio.get('totalInvested', 0):,.2f}")
                    print(f"📊 Total Returns: ₹{portfolio.get('totalReturns', 0):,.2f}")
                    print(f"📈 Return %: {portfolio.get('returnPercentage', 0):.2f}%")
                
                # Display asset allocation
                if "assetAllocation" in result:
                    print("\n🎯 Asset Allocation:")
                    for allocation in result["assetAllocation"]:
                        print(f"  • {allocation.get('type', 'Unknown')}: ₹{allocation.get('value', 0):,.2f} ({allocation.get('percentage', 0):.1f}%)")
                
                return result
            else:
                print(f"❌ Request failed with status {response.status_code}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"❌ Investment transform failed: {str(e)}")
            return {"error": str(e)}
    
    def test_banking_dashboard(self) -> Dict[str, Any]:
        """Test banking dashboard transformation."""
        print("\n🏦 Testing Banking Dashboard Transform...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/transform/dashboard/banking",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Banking Dashboard Transform Successful!")
                
                # Display account summary
                if "accountSummary" in result:
                    summary = result["accountSummary"]
                    print(f"💰 Total Balance: ₹{summary.get('totalBalance', 0):,.2f}")
                    print(f"📈 Monthly Inflow: ₹{summary.get('monthlyInflow', 0):,.2f}")
                    print(f"📉 Monthly Outflow: ₹{summary.get('monthlyOutflow', 0):,.2f}")
                    print(f"💸 Net Cash Flow: ₹{summary.get('netCashFlow', 0):,.2f}")
                
                # Display spending categories
                if "spendingCategories" in result:
                    print("\n💳 Top Spending Categories:")
                    for category in result["spendingCategories"][:5]:  # Top 5
                        print(f"  • {category.get('category', 'Unknown')}: ₹{category.get('amount', 0):,.2f} ({category.get('percentage', 0):.1f}%)")
                
                return result
            else:
                print(f"❌ Request failed with status {response.status_code}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"❌ Banking transform failed: {str(e)}")
            return {"error": str(e)}
    
    def test_complete_dashboard(self) -> Dict[str, Any]:
        """Test complete dashboard transformation."""
        print("\n🎯 Testing Complete Dashboard Transform...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/transform/dashboard/complete",
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Complete Dashboard Transform Successful!")
                
                # Display available sections
                sections = []
                if "netWorth" in result:
                    sections.append("Net Worth")
                if "creditReport" in result:
                    sections.append("Credit Report")
                if "investments" in result:
                    sections.append("Investments")
                if "banking" in result:
                    sections.append("Banking")
                if "epf" in result:
                    sections.append("EPF")
                
                print(f"📊 Available Sections: {', '.join(sections)}")
                print(f"🕒 Last Updated: {result.get('lastUpdated', 'Unknown')}")
                
                return result
            else:
                print(f"❌ Request failed with status {response.status_code}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"❌ Complete dashboard transform failed: {str(e)}")
            return {"error": str(e)}
    
    def run_all_tests(self):
        """Run all transform API tests."""
        print("🚀 Starting Transform API Tests...")
        print("=" * 50)
        
        # Test health check first
        health_result = self.test_health_check()
        
        if health_result.get("status") != "healthy":
            print("❌ Health check failed. Skipping other tests.")
            return
        
        # Run all dashboard tests
        tests = [
            self.test_net_worth_dashboard,
            self.test_credit_report_dashboard,
            self.test_investment_dashboard,
            self.test_banking_dashboard,
            self.test_complete_dashboard
        ]
        
        results = {}
        for test in tests:
            try:
                result = test()
                results[test.__name__] = result
            except Exception as e:
                print(f"❌ Test {test.__name__} failed: {str(e)}")
                results[test.__name__] = {"error": str(e)}
        
        print("\n" + "=" * 50)
        print("🎉 Transform API Tests Completed!")
        
        # Summary
        successful_tests = sum(1 for result in results.values() if "error" not in result)
        total_tests = len(results)
        print(f"✅ Successful: {successful_tests}/{total_tests}")
        
        return results


def main():
    """Main function to run the transform API tests."""
    print("🏦 Financial Transform API Test Suite")
    print("=" * 50)
    
    # Initialize client
    client = TransformAPIClient()
    
    # Run all tests
    results = client.run_all_tests()
    
    # Save results to file
    with open("transform_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Test results saved to: transform_test_results.json")


if __name__ == "__main__":
    main()
