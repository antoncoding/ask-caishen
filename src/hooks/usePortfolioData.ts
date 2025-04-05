'use client';

import { useQuery } from '@tanstack/react-query';

export interface ChartDataPoint {
  timestamp: number;
  value_usd: number;
}

interface ProfitLossData {
  chain_id: number | null;
  abs_profit_usd: number;
  roi: number;
}

export interface PortfolioData {
  totalValue: number;
  profitLoss: {
    absValue: number;
    percentage: number;
  };
  chartData: ChartDataPoint[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch portfolio data from multiple endpoints
 */
export function usePortfolioData(
  address: string | undefined, 
  chainId: string = '1',
  timerange: string = '1week'
): PortfolioData {
  // Fetch current portfolio value
  const { 
    data: valueData,
    isLoading: valueLoading,
    isError: valueError,
    error: valueErrorData
  } = useQuery({
    queryKey: ['portfolioValue', chainId, address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/current-value?chain_id=${chainId}&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio value');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch profit/loss data
  const { 
    data: pnlData,
    isLoading: pnlLoading,
    isError: pnlError,
    error: pnlErrorData
  } = useQuery({
    queryKey: ['portfolioPnL', chainId, timerange, address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/profit-and-loss?chain_id=${chainId}&timerange=${timerange}&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profit/loss data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch chart data
  const { 
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
    error: chartErrorData
  } = useQuery({
    queryKey: ['portfolioChart', chainId, timerange, address],
    queryFn: async () => {
      const response = await fetch(
        `/api/portfolio/value-chart?chain_id=${chainId}&timerange=${timerange}&address=${address}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000, // Refetch every minute
  });

  // Process the profit/loss data
  const processedPnL = pnlData?.[0] ? {
    absValue: pnlData[0].abs_profit_usd,
    percentage: pnlData[0].roi * 100
  } : {
    absValue: 0,
    percentage: 0
  };

  // Determine if any of the requests are loading or have errored
  const isLoading = valueLoading || pnlLoading || chartLoading;
  const isError = valueError || pnlError || chartError;
  const error = valueErrorData ?? pnlErrorData ?? chartErrorData ?? null;

  return {
    totalValue: valueData?.value_usd ?? 0,
    profitLoss: processedPnL,
    chartData: chartData?.chart_data ?? [],
    isLoading,
    isError,
    error
  };
} 