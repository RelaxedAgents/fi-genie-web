"""Pydantic models for transform API requests and responses."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# Request Models
class TransformRequest(BaseModel):
    """Base request model for transform endpoints."""
    phone_number: Optional[str] = Field(None, description="Phone number for MCP authentication")


# Response Models for Net Worth Dashboard
class NetWorthSummary(BaseModel):
    """Net worth summary data."""
    totalNetWorth: float = Field(..., description="Total net worth in INR")
    totalAssets: float = Field(..., description="Total assets in INR")
    totalLiabilities: float = Field(..., description="Total liabilities in INR")
    netWorthGrowth: str = Field(..., description="Net worth growth percentage")


class AssetBreakdownItem(BaseModel):
    """Individual asset category breakdown."""
    category: str = Field(..., description="Asset category name")
    value: float = Field(..., description="Asset value in INR")
    percentage: float = Field(..., description="Percentage of total assets")
    color: str = Field(..., description="Hex color code for UI")


class LiabilityBreakdownItem(BaseModel):
    """Individual liability category breakdown."""
    category: str = Field(..., description="Liability category name")
    value: float = Field(..., description="Liability value in INR")
    percentage: float = Field(..., description="Percentage of total liabilities")
    color: str = Field(..., description="Hex color code for UI")


class AccountInfo(BaseModel):
    """Bank account information."""
    bank: str = Field(..., description="Bank name")
    type: str = Field(..., description="Account type")
    balance: float = Field(..., description="Account balance in INR")
    accountNumber: str = Field(..., description="Masked account number")


class NetWorthDashboardResponse(BaseModel):
    """Complete net worth dashboard response."""
    summary: NetWorthSummary
    assetBreakdown: List[AssetBreakdownItem]
    liabilityBreakdown: List[LiabilityBreakdownItem]
    accounts: List[AccountInfo]


# Response Models for Credit Report Dashboard
class CreditScore(BaseModel):
    """Credit score information."""
    score: int = Field(..., description="Credit score")
    rating: str = Field(..., description="Credit rating (Excellent, Good, etc.)")
    confidenceLevel: str = Field(..., description="Confidence level")
    trend: str = Field(..., description="Score trend")
    color: str = Field(..., description="Color based on score range")


class AccountSummary(BaseModel):
    """Credit account summary."""
    totalAccounts: int = Field(..., description="Total number of accounts")
    activeAccounts: int = Field(..., description="Number of active accounts")
    defaultAccounts: int = Field(..., description="Number of defaulted accounts")
    totalOutstanding: float = Field(..., description="Total outstanding amount")


class DebtBreakdownItem(BaseModel):
    """Debt breakdown by type."""
    type: str = Field(..., description="Debt type (Secured/Unsecured)")
    amount: float = Field(..., description="Amount in INR")
    percentage: float = Field(..., description="Percentage of total debt")
    color: str = Field(..., description="Color for UI")


class CreditAccount(BaseModel):
    """Individual credit account details."""
    lender: str = Field(..., description="Lender name")
    type: str = Field(..., description="Account type")
    balance: float = Field(..., description="Current balance")
    pastDue: float = Field(..., description="Past due amount")
    paymentRating: str = Field(..., description="Payment rating")
    interestRate: str = Field(..., description="Interest rate")
    status: str = Field(..., description="Account status")


class CreditInquiry(BaseModel):
    """Recent credit inquiry."""
    lender: str = Field(..., description="Lender name")
    date: str = Field(..., description="Inquiry date")
    purpose: str = Field(..., description="Inquiry purpose")


class CreditReportDashboardResponse(BaseModel):
    """Complete credit report dashboard response."""
    creditScore: CreditScore
    accountSummary: AccountSummary
    debtBreakdown: List[DebtBreakdownItem]
    creditAccounts: List[CreditAccount]
    recentInquiries: List[CreditInquiry]


# Response Models for Investment Dashboard
class PortfolioSummary(BaseModel):
    """Investment portfolio summary."""
    totalValue: float = Field(..., description="Total portfolio value")
    totalInvested: float = Field(..., description="Total invested amount")
    totalReturns: float = Field(..., description="Total returns")
    returnPercentage: float = Field(..., description="Return percentage")
    xirr: float = Field(..., description="XIRR value")


class AssetAllocationItem(BaseModel):
    """Asset allocation breakdown."""
    type: str = Field(..., description="Asset type")
    value: float = Field(..., description="Value in INR")
    percentage: float = Field(..., description="Percentage of portfolio")
    color: str = Field(..., description="Color for UI")


class TopHolding(BaseModel):
    """Top portfolio holding."""
    name: str = Field(..., description="Investment name")
    type: str = Field(..., description="Investment type")
    currentValue: float = Field(..., description="Current value")
    investedValue: float = Field(..., description="Invested value")
    returns: float = Field(..., description="Returns amount")
    returnPercentage: float = Field(..., description="Return percentage")
    units: float = Field(..., description="Number of units")


class RecentTransaction(BaseModel):
    """Recent investment transaction."""
    date: str = Field(..., description="Transaction date")
    type: str = Field(..., description="Transaction type (BUY/SELL)")
    scheme: str = Field(..., description="Scheme/stock name")
    amount: float = Field(..., description="Transaction amount")
    units: float = Field(..., description="Units transacted")
    nav: float = Field(..., description="NAV/Price per unit")


class InvestmentDashboardResponse(BaseModel):
    """Complete investment dashboard response."""
    portfolioSummary: PortfolioSummary
    assetAllocation: List[AssetAllocationItem]
    topHoldings: List[TopHolding]
    recentTransactions: List[RecentTransaction]


# Response Models for Banking Dashboard
class BankingAccountSummary(BaseModel):
    """Banking account summary."""
    totalBalance: float = Field(..., description="Total balance across accounts")
    monthlyInflow: float = Field(..., description="Monthly inflow")
    monthlyOutflow: float = Field(..., description="Monthly outflow")
    netCashFlow: float = Field(..., description="Net cash flow")


class BankAccount(BaseModel):
    """Individual bank account."""
    bank: str = Field(..., description="Bank name")
    balance: float = Field(..., description="Account balance")
    accountType: str = Field(..., description="Account type")
    recentTransactions: int = Field(..., description="Number of recent transactions")
    lastUpdated: str = Field(..., description="Last update date")


class SpendingCategory(BaseModel):
    """Spending category breakdown."""
    category: str = Field(..., description="Spending category")
    amount: float = Field(..., description="Amount spent")
    percentage: float = Field(..., description="Percentage of total spending")
    color: str = Field(..., description="Color for UI")


class BankTransaction(BaseModel):
    """Individual bank transaction."""
    date: str = Field(..., description="Transaction date")
    description: str = Field(..., description="Transaction description")
    amount: float = Field(..., description="Transaction amount")
    type: str = Field(..., description="Transaction type (CREDIT/DEBIT)")
    category: str = Field(..., description="Transaction category")
    balance: float = Field(..., description="Balance after transaction")


class BankingDashboardResponse(BaseModel):
    """Complete banking dashboard response."""
    accountSummary: BankingAccountSummary
    bankAccounts: List[BankAccount]
    spendingCategories: List[SpendingCategory]
    recentTransactions: List[BankTransaction]


# EPF Dashboard Models
class EPFSummary(BaseModel):
    """EPF account summary."""
    totalBalance: float = Field(..., description="Total EPF balance")
    employeeShare: float = Field(..., description="Employee contribution")
    employerShare: float = Field(..., description="Employer contribution")
    pensionBalance: float = Field(..., description="Pension balance")
    monthlyContribution: float = Field(..., description="Monthly contribution")


class EPFEmployer(BaseModel):
    """EPF employer details."""
    companyName: str = Field(..., description="Company name")
    memberId: str = Field(..., description="Member ID")
    joiningDate: str = Field(..., description="Date of joining")
    leavingDate: Optional[str] = Field(None, description="Date of leaving")
    balance: float = Field(..., description="Balance with this employer")
    status: str = Field(..., description="Employment status")


class EPFDashboardResponse(BaseModel):
    """Complete EPF dashboard response."""
    summary: EPFSummary
    employers: List[EPFEmployer]
    contributionTrend: List[Dict[str, Any]] = Field(..., description="Monthly contribution trend")


# Combined Dashboard Response
class CompleteDashboardResponse(BaseModel):
    """Complete financial dashboard with all data."""
    netWorth: NetWorthDashboardResponse
    creditReport: CreditReportDashboardResponse
    investments: InvestmentDashboardResponse
    banking: BankingDashboardResponse
    epf: EPFDashboardResponse
    lastUpdated: str = Field(..., description="Last update timestamp")
    dataFreshness: Dict[str, str] = Field(..., description="Freshness of each data source")


# Error Response Model
class TransformErrorResponse(BaseModel):
    """Error response for transform endpoints."""
    error: str = Field(..., description="Error message")
    error_type: str = Field(..., description="Type of error")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    fallback_data: Optional[Dict[str, Any]] = Field(None, description="Fallback data if available")


# Generic Transform Response
class GenericTransformResponse(BaseModel):
    """Generic transform response for flexible data."""
    data: Dict[str, Any] = Field(..., description="Transformed data")
    metadata: Dict[str, Any] = Field(..., description="Transformation metadata")
    success: bool = Field(True, description="Transformation success status")
    timestamp: str = Field(..., description="Transformation timestamp")
