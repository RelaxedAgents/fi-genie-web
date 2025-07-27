// Dashboard data management utilities

import { DashboardApiResponse } from './api/dashboardApi';

const DASHBOARD_DATA_KEY = 'figenie_dashboard_data';
const API_STATUS_KEY = 'figenie_api_status';
const DATA_EXPIRY_HOURS = 24;

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

interface StoredDashboardData {
  data: DashboardApiResponse;
  timestamp: number;
}

// Save dashboard data to localStorage
export function saveDashboardData(data: DashboardApiResponse): void {
  try {
    const storedData: StoredDashboardData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.error('Error saving dashboard data:', error);
  }
}

// Get dashboard data from localStorage
export function getDashboardData(): DashboardApiResponse | null {
  try {
    const stored = localStorage.getItem(DASHBOARD_DATA_KEY);
    if (!stored) return null;

    const storedData: StoredDashboardData = JSON.parse(stored);
    
    // Check if data is expired
    if (!isDashboardDataValid(storedData.timestamp)) {
      clearDashboardData();
      return null;
    }

    return storedData.data;
  } catch (error) {
    console.error('Error reading dashboard data:', error);
    return null;
  }
}

// Clear dashboard data
export function clearDashboardData(): void {
  try {
    localStorage.removeItem(DASHBOARD_DATA_KEY);
  } catch (error) {
    console.error('Error clearing dashboard data:', error);
  }
}

// Check if dashboard data is valid (within 24 hours)
export function isDashboardDataValid(timestamp?: number): boolean {
  if (!timestamp) {
    const stored = localStorage.getItem(DASHBOARD_DATA_KEY);
    if (!stored) return false;
    
    try {
      const storedData: StoredDashboardData = JSON.parse(stored);
      timestamp = storedData.timestamp;
    } catch {
      return false;
    }
  }

  const now = Date.now();
  const expiryTime = timestamp + (DATA_EXPIRY_HOURS * 60 * 60 * 1000);
  return now < expiryTime;
}

// API Status Management
export function getApiStatus(): ApiStatus {
  try {
    const status = localStorage.getItem(API_STATUS_KEY);
    return (status as ApiStatus) || 'idle';
  } catch {
    return 'idle';
  }
}

export function setApiStatus(status: ApiStatus): void {
  try {
    localStorage.setItem(API_STATUS_KEY, status);
  } catch (error) {
    console.error('Error setting API status:', error);
  }
}

export function clearApiStatus(): void {
  try {
    localStorage.removeItem(API_STATUS_KEY);
  } catch (error) {
    console.error('Error clearing API status:', error);
  }
}
