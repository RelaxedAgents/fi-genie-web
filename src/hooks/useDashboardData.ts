"use client"

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/lib/dashboardData';
import { DashboardApiResponse } from '@/lib/api/dashboardApi';
import masterData from '@/../../sampleMasterData.json';

export function useDashboardData() {
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get data from localStorage
    const storedData = getDashboardData();
    
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
