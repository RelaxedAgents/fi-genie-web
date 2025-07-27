"""Models package for the Financial MCP Agent Transform API."""

from .transform_models import (
    # Request Models
    TransformRequest,
    
    # Net Worth Models
    NetWorthSummary,
    AssetBreakdownItem,
    LiabilityBreakdownItem,
    AccountInfo,
    NetWorthDashboardResponse,
    
    # Credit Report Models
    CreditScore,
    AccountSummary,
    DebtBreakdownItem,
    CreditAccount,
    CreditInquiry,
    CreditReportDashboardResponse,
    
    # Investment Models
    PortfolioSummary,
    AssetAllocationItem,
    TopHolding,
    RecentTransaction,
    InvestmentDashboardResponse,
    
    # Banking Models
    BankingAccountSummary,
    BankAccount,
    SpendingCategory,
    BankTransaction,
    BankingDashboardResponse,
    
    # EPF Models
    EPFSummary,
    EPFEmployer,
    EPFDashboardResponse,
    
    # Combined Models
    CompleteDashboardResponse,
    
    # Error and Generic Models
    TransformErrorResponse,
    GenericTransformResponse,
)

__all__ = [
    # Request Models
    "TransformRequest",
    
    # Net Worth Models
    "NetWorthSummary",
    "AssetBreakdownItem", 
    "LiabilityBreakdownItem",
    "AccountInfo",
    "NetWorthDashboardResponse",
    
    # Credit Report Models
    "CreditScore",
    "AccountSummary",
    "DebtBreakdownItem",
    "CreditAccount",
    "CreditInquiry",
    "CreditReportDashboardResponse",
    
    # Investment Models
    "PortfolioSummary",
    "AssetAllocationItem",
    "TopHolding",
    "RecentTransaction",
    "InvestmentDashboardResponse",
    
    # Banking Models
    "BankingAccountSummary",
    "BankAccount",
    "SpendingCategory",
    "BankTransaction",
    "BankingDashboardResponse",
    
    # EPF Models
    "EPFSummary",
    "EPFEmployer",
    "EPFDashboardResponse",
    
    # Combined Models
    "CompleteDashboardResponse",
    
    # Error and Generic Models
    "TransformErrorResponse",
    "GenericTransformResponse",
]
