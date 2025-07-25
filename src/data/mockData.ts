// This file contains mock data for demonstration purposes
// It can be easily removed when integrating with real APIs

export const mockUserData = {
  name: "John Doe",
  balance: 124567.89,
  monthlyGrowth: 12.5,
  savingsGoalProgress: 89,
  creditScore: 782,
  monthlySavings: 2350,
  investments: 45000,
  expenses: 3200,
}

export const mockChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  values: [40, 65, 45, 70, 55, 85, 60],
}

export const mockInsights = [
  {
    id: 1,
    type: "savings",
    title: "Optimize Subscriptions",
    description: "Save $350 by canceling unused subscriptions",
    impact: 350,
    priority: "high",
  },
  {
    id: 2,
    type: "investment",
    title: "Rebalance Portfolio",
    description: "Your tech stocks are overweighted by 15%",
    impact: null,
    priority: "medium",
  },
  {
    id: 3,
    type: "expense",
    title: "Dining Out Alert",
    description: "You've exceeded your dining budget by 40%",
    impact: -180,
    priority: "low",
  },
]

export const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "FiGenie helped me save over $10,000 in just 6 months. The AI insights are incredibly accurate!",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    content: "The automated savings feature is a game-changer. I'm finally on track with my retirement goals.",
    rating: 5,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    content: "Being able to ask questions in plain English about my finances makes everything so much easier.",
    rating: 5,
    avatar: "ER",
  },
]

export const mockStats = {
  totalUsers: 50000,
  monthlySaved: 2500000,
  userRating: 4.9,
  uptime: 99.9,
  transactionsProcessed: 12000000,
  aiAccuracy: 97.5,
}

export const mockFeatures = {
  aiInsights: {
    enabled: true,
    accuracy: 0.975,
    lastUpdated: new Date().toISOString(),
  },
  security: {
    encryptionLevel: "256-bit AES",
    twoFactor: true,
    biometric: true,
  },
  integrations: {
    banks: 150,
    creditCards: true,
    investments: true,
    crypto: false, // Coming soon
  },
}
