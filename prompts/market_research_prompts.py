"""Specialized prompts for market research tool."""

# Market research query templates
LOAN_RESEARCH_TEMPLATE = """Provide detailed information about current {loan_type} loan options in India from the past {recency}:
1. Current interest rates from major banks (HDFC, SBI, ICICI, Axis)
2. Eligibility criteria for {loan_amount} loan amount
3. Processing fees and charges
4. Special offers or promotions
5. Required documentation
6. Comparison of fixed vs floating rate options
7. Prepayment policies

Focus on data from the specified time period for accuracy."""

INVESTMENT_RESEARCH_TEMPLATE = """Provide detailed analysis of {investment_type} options for {goal} based on data from the past {recency}:
1. Top performing options in the last 1-3 years
2. Risk assessment and volatility metrics
3. Expense ratios and fee structures
4. Minimum investment requirements
5. Tax implications
6. Expert recommendations and outlook
7. Historical returns compared to benchmarks

Focus on data from the specified time period for accuracy."""

TAX_RESEARCH_TEMPLATE = """Provide detailed information about tax implications of {financial_action} based on information from the past {recency}:
1. Applicable tax rates and slabs
2. Available deductions and exemptions
3. Documentation requirements
4. Filing deadlines and procedures
5. Recent changes in tax regulations
6. Tax-saving strategies
7. Expert recommendations

Focus on the most recent tax year and regulations from the specified time period."""

CREDIT_RESEARCH_TEMPLATE = """Provide detailed information about credit score improvement strategies based on information from the past {recency}:
1. Factors affecting credit scores in India
2. Best practices for improving credit scores
3. Common mistakes to avoid
4. Timeline for seeing improvements
5. Impact of different actions on credit score
6. Credit monitoring services available
7. Expert recommendations

Focus on the most recent credit bureau practices and regulations from the specified time period."""

RETIREMENT_RESEARCH_TEMPLATE = """Provide detailed information about retirement planning in India based on information from the past {recency}:
1. Current retirement product options (EPF, NPS, PPF, etc.)
2. Expected returns and tax benefits
3. Withdrawal rules and regulations
4. Comparison of different retirement products
5. Inflation projections and their impact
6. Recommended corpus calculations
7. Expert retirement planning strategies

Focus on the most recent retirement planning best practices from the specified time period."""

# Function to format research queries
def format_market_research_query(query_type, recency="month", **kwargs):
    """Format a market research query based on template."""
    templates = {
        "loan": LOAN_RESEARCH_TEMPLATE,
        "investment": INVESTMENT_RESEARCH_TEMPLATE,
        "tax": TAX_RESEARCH_TEMPLATE,
        "credit": CREDIT_RESEARCH_TEMPLATE,
        "retirement": RETIREMENT_RESEARCH_TEMPLATE
    }
    
    # Add recency if not already in kwargs
    if "recency" not in kwargs:
        kwargs["recency"] = recency
    
    template = templates.get(query_type, "{query}")
    return template.format(**kwargs)

# Sample queries for different financial scenarios
SAMPLE_QUERIES = {
    "home_loan": "Current home loan interest rates for 50 lac loans in India",
    "personal_loan": "Best personal loan options for 5 lac with credit score of 750",
    "mutual_funds": "Top performing ELSS mutual funds for tax saving in 2025",
    "credit_score": "Most effective ways to improve credit score from 700 to 750 in 6 months",
    "retirement": "Comparison of NPS vs EPF vs PPF for retirement planning in India",
    "tax_saving": "Best tax saving investment options under 80C for salaried individuals",
    "real_estate": "Current real estate market trends in major Indian cities",
    "stock_market": "Latest analysis of Indian stock market sectors with growth potential",
    "fd_rates": "Current fixed deposit rates comparison across major Indian banks",
    "insurance": "Term insurance plans comparison for 1 crore coverage in India"
}
