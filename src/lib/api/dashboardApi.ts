// Dashboard API service for fetching user financial data

export interface DashboardApiResponse {
  status: string;
  timestamp: string;
  financialOverview: any;
  bankingData: any;
  investmentData: any;
  wealthProfile: any;
  creditReport: any;
  historicalData: any;
  monthlyFinancialSnapshot: any;
  aiGeneratedInsights: any;
}

const API_URL = 'https://idx-ai-agent-42802736-371876271303.asia-south1.run.app/api/v1/transform/dashboard/complete';

export async function fetchDashboardData(phoneNumber: string): Promise<DashboardApiResponse> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Phone-Number': phoneNumber,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
