'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartDataPoint {
  timestamp: number;
  value_usd: number;
}

interface PortfolioChartProps {
  data: ChartDataPoint[];
  timerange: string;
}

const formatTimestamp = (timestamp: number, timerange: string): string => {
  const date = new Date(timestamp * 1000);
  
  if (timerange === '1day') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timerange === '1week') {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString(undefined, { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

export default function PortfolioChart({ data, timerange }: PortfolioChartProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  // Memoize chart data processing
  const { chartData, startValue, endValue, isPositiveTrend, chartColor } = useMemo(() => {
    const processedData = data.map(point => ({
      timestamp: point.timestamp,
      value: point.value_usd,
      formattedDate: formatTimestamp(point.timestamp, timerange)
    }));

    const first = processedData[0]?.value || 0;
    const last = processedData[processedData.length - 1]?.value || 0;
    const trend = last >= first;

    return {
      chartData: processedData,
      startValue: first,
      endValue: last,
      isPositiveTrend: trend,
      chartColor: trend ? '#4ade80' : '#ef4444'
    };
  }, [data, timerange]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      setHoveredValue(dataPoint.value);
      
      return (
        <div className="bg-surface p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-secondary">{dataPoint.formattedDate}</p>
          <p className="text-lg text-primary font-medium">
            {formatCurrency(dataPoint.value)}
          </p>
        </div>
      );
    }
    
    setHoveredValue(null);
    return null;
  };

  // Don't render the chart if there's no data
  if (!data.length) {
    return (
      <div className="w-full rounded-lg bg-surface p-4 h-64 flex items-center justify-center">
        <p className="text-secondary">No historical data available</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-surface p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-primary font-inter">Historical Value</h3>
        <div className="text-right">
          <p className="text-2xl text-primary font-inter">
            {formatCurrency(hoveredValue ?? endValue)}
          </p>
          {!hoveredValue && (
            <p className={`text-sm ${isPositiveTrend ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveTrend ? '▲' : '▼'} 
              {formatCurrency(Math.abs(endValue - startValue))} 
              ({((endValue - startValue) / startValue * 100).toFixed(2)}%)
            </p>
          )}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
            <XAxis 
              dataKey="formattedDate" 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              fillOpacity={1}
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 