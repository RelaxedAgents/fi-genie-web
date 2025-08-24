"use client"

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/lib/dashboardData';
import { DashboardApiResponse } from '@/lib/api/dashboardApi';
import { getCurrentUser } from '@/lib/auth';
import masterData from '@/../../sampleMasterData.json';

export function useDashboardData() {
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user's phone number
    const user = getCurrentUser();
    const phoneNumber = user?.phone;
    
    // Try to get data from localStorage with phone number validation
    const storedData = phoneNumber ? getDashboardData(phoneNumber) : null;
    
    if (storedData) {
      setData(storedData);
    } else {
      // Fallback to mock data
      setData(masterData as DashboardApiResponse);
    }
    
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
  };
}
