'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { usePortfolioDetails } from './usePortfolioDetails';

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
  portfolioSummary: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Formats a USD value with appropriate decimals
 */
const formatUSD = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
};

/**
 * Custom hook to fetch portfolio data from multiple endpoints and networks
 */
export function usePortfolioData(
  address: string | undefined, 
  timerange: string = '1week'
): PortfolioData {
  // Add portfolio details hook
  const { positions } = usePortfolioDetails(address);

  // Fetch Mainnet portfolio value
  const { 
    data: mainnetValueData,
    isLoading: mainnetValueLoading,
    isError: mainnetValueError,
    error: mainnetValueErrorData
  } = useQuery({
    queryKey: ['portfolioValue', '1', address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/current-value?chain_id=1&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mainnet portfolio value');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Base portfolio value
  const { 
    data: baseValueData,
    isLoading: baseValueLoading,
    isError: baseValueError,
    error: baseValueErrorData
  } = useQuery({
    queryKey: ['portfolioValue', '8453', address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/current-value?chain_id=8453&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch base portfolio value');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Mainnet profit/loss data
  const { 
    data: mainnetPnlData,
    isLoading: mainnetPnlLoading,
    isError: mainnetPnlError,
    error: mainnetPnlErrorData
  } = useQuery({
    queryKey: ['portfolioPnL', '1', timerange, address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/profit-and-loss?chain_id=1&timerange=${timerange}&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mainnet profit/loss data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Base profit/loss data
  const { 
    data: basePnlData,
    isLoading: basePnlLoading,
    isError: basePnlError,
    error: basePnlErrorData
  } = useQuery({
    queryKey: ['portfolioPnL', '8453', timerange, address],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/profit-and-loss?chain_id=8453&timerange=${timerange}&address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch base profit/loss data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Mainnet chart data
  const { 
    data: mainnetChartData,
    isLoading: mainnetChartLoading,
    isError: mainnetChartError,
    error: mainnetChartErrorData
  } = useQuery({
    queryKey: ['portfolioChart', '1', timerange, address],
    queryFn: async () => {
      const response = await fetch(
        `/api/portfolio/value-chart?chain_id=1&timerange=${timerange}&address=${address}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch mainnet chart data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Base chart data
  const { 
    data: baseChartData,
    isLoading: baseChartLoading,
    isError: baseChartError,
    error: baseChartErrorData
  } = useQuery({
    queryKey: ['portfolioChart', '8453', timerange, address],
    queryFn: async () => {
      const response = await fetch(
        `/api/portfolio/value-chart?chain_id=8453&timerange=${timerange}&address=${address}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch base chart data');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Combine the values
  const mainnetValue = mainnetValueData?.[0]?.value_usd ?? 0;
  const baseValue = baseValueData?.[0]?.value_usd ?? 0;
  const totalValue = mainnetValue + baseValue;

  // Combine profit/loss data
  const mainnetPnL = mainnetPnlData?.[0] ?? { abs_profit_usd: 0, roi: 0 };
  const basePnL = basePnlData?.[0] ?? { abs_profit_usd: 0, roi: 0 };
  
  const combinedPnL = {
    absValue: mainnetPnL.abs_profit_usd + basePnL.abs_profit_usd,
    percentage: ((mainnetPnL.abs_profit_usd + basePnL.abs_profit_usd) / totalValue * 100) || 0
  };

  // Combine chart data by timestamp
  const combinedChartData = React.useMemo(() => {
    const mainnetPoints = mainnetChartData?.chart_data ?? [];
    const basePoints = baseChartData?.chart_data ?? [];
    
    // Create a map of timestamps to combined values
    const timeMap = new Map<number, number>();
    
    // Add mainnet values
    mainnetPoints.forEach((point: ChartDataPoint) => {
      timeMap.set(point.timestamp, point.value_usd);
    });
    
    // Add base values
    basePoints.forEach((point: ChartDataPoint) => {
      const existingValue = timeMap.get(point.timestamp) ?? 0;
      timeMap.set(point.timestamp, existingValue + point.value_usd);
    });
    
    // Convert map back to array and sort by timestamp
    return Array.from(timeMap.entries())
      .map(([timestamp, value_usd]) => ({ timestamp, value_usd }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [mainnetChartData, baseChartData]);

  // Generate portfolio summary
  const portfolioSummary = React.useMemo(() => {
    if (!positions?.length) {
      return 'No active DeFi positions found.';
    }

    const mainnetPositions = positions.filter(p => p.chain_id === 1);
    const basePositions = positions.filter(p => p.chain_id === 8453);

    const formatPosition = (position: typeof positions[0]): string => {
      const profitText = position.profit_abs_usd !== null
        ? `${position.profit_abs_usd >= 0 ? 'earning' : 'lost'} ${formatUSD(Math.abs(position.profit_abs_usd))}`
        : 'no profit data';
      
      const aprText = position.weighted_apr !== null
        ? ` at ${(position.weighted_apr * 100).toFixed(2)}% APR`
        : '';

      return `${position.protocol_name} (${position.name})
${formatUSD(position.value_usd)} invested, ${profitText}${aprText}
Active for ${position.holding_time_days} days\n`;
    };

    const sections = [];
    
    sections.push('User current position summary.\n');

    if (mainnetPositions.length > 0) {
      sections.push('Ethereum Mainnet:');
      mainnetPositions.forEach(pos => {
        sections.push(formatPosition(pos));
      });
      sections.push('');
    }

    if (basePositions.length > 0) {
      sections.push('Base:');
      basePositions.forEach(pos => {
        sections.push(formatPosition(pos));
      });
    }

    return sections.join('\n');
  }, [positions]);

  console.log('portfolioSummary', portfolioSummary)

  const isLoading = 
    mainnetValueLoading || baseValueLoading ||
    mainnetPnlLoading || basePnlLoading ||
    mainnetChartLoading || baseChartLoading;

  const isError = 
    mainnetValueError || baseValueError ||
    mainnetPnlError || basePnlError ||
    mainnetChartError || baseChartError;

  const error = 
    mainnetValueErrorData ?? baseValueErrorData ??
    mainnetPnlErrorData ?? basePnlErrorData ??
    mainnetChartErrorData ?? baseChartErrorData ?? null;

  return {
    totalValue,
    profitLoss: combinedPnL,
    chartData: combinedChartData,
    portfolioSummary,
    isLoading,
    isError,
    error
  };
} 