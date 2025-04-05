'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { SquareLoader } from 'react-spinners';
import AccountConnect from '@/components/layout/header/AccountConnect';
import { Button } from '@/components/common/Button';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { usePortfolioDetails } from '@/hooks/usePortfolioDetails';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import { MotionWrapper, MotionList, MotionListItem } from '@/components/animations/MotionWrapper';
import Image from 'next/image';

enum TimeRange {
  Day = '1day',
  Week = '1week',
  Month = '1month'
}

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: TimeRange.Day, label: '24H' },
  { value: TimeRange.Week, label: '7D' },
  { value: TimeRange.Month, label: '30D' },
];

const chainNames: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base'
};

export const PortfolioPage = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [timerange, setTimerange] = React.useState<TimeRange>(TimeRange.Week);

  const { 
    positions,
    isLoading: positionsLoading,
    isError: positionsError,
    error: positionsErrorData
  } = usePortfolioDetails(address);

  const {
    totalValue,
    profitLoss,
    chartData,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorData,
    portfolioSummary
  } = usePortfolioData(address, timerange);

  const isLoading = positionsLoading || portfolioLoading;
  const hasError = positionsError || portfolioError;


  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimerange(newTimeRange);
  };

  const handleGetAdvice = () => {
    localStorage.setItem('portfolioContext', portfolioSummary);
    router.push('/agent-interface');
  };

  // Add logging to debug the data
  React.useEffect(() => {
    console.log('Portfolio Data:', {
      positions,
      totalValue,
      chartData: chartData?.length ? chartData[chartData.length - 1] : null,
      profitLoss
    });
  }, [positions, totalValue, chartData, profitLoss]);

  if (!isConnected) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">Connect Your Wallet</h1>
        <p className="mb-10 max-w-md text-center text-secondary font-inter">
          Connect your wallet to get personalized investment advice based on your on-chain portfolio.
        </p>
        <div className="w-48 mx-auto">
          <AccountConnect />
        </div>
      </MotionWrapper>
    );
  }

  if (isLoading) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">Analyzing Your Portfolio</h1>
        <p className="mb-6 text-xl text-secondary font-inter">
          Fetching your DeFi positions...
        </p>
        <SquareLoader 
          color="#8fa6cb"
          size={40}
        />
      </MotionWrapper>
    );
  }

  if (hasError) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">Error Loading Portfolio</h1>
        <p className="mb-6 text-xl text-red-500 font-inter">
          Unable to fetch portfolio data. Please try again later.
        </p>
        <Button 
          variant="cta"
          onClick={() => window.location.reload()}
          className="w-48"
        >
          Retry
        </Button>
      </MotionWrapper>
    );
  }

  if (!positions.length) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">No DeFi Positions Found</h1>
        <p className="mb-10 max-w-md text-center text-secondary font-inter">
          We couldn't find any active DeFi positions in your wallet. Try investing in some DeFi protocols to view portfolio details.
        </p>
      </MotionWrapper>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <MotionWrapper>
        <h1 className="mb-6 text-center text-4xl text-primary font-inter">Your DeFi Portfolio</h1>
        
        <div className="mb-8">
          <div className="mb-6 rounded-lg bg-surface p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl text-primary font-inter">Portfolio Overview</h2>
              <div className="flex gap-2">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeRangeChange(option.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors font-inter
                      ${timerange === option.value 
                        ? 'bg-primary text-white' 
                        : 'bg-surface text-secondary hover:bg-hovered'
                      }`}
                    aria-pressed={timerange === option.value}
                    role="tab"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mb-2 text-center text-3xl text-primary font-inter">
              ${totalValue?.toLocaleString() ?? '0'}
            </p>
            
            <p className={`mb-6 text-center font-inter ${profitLoss.absValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitLoss.absValue >= 0 ? '▲' : '▼'} 
              ${Math.abs(profitLoss.absValue).toFixed(2)} 
              ({profitLoss.percentage.toFixed(2)}%) past {timerange === TimeRange.Day ? 'day' : timerange === TimeRange.Week ? 'week' : 'month'}
            </p>

            <MotionList className="mt-4 grid gap-4">
              {positions.map((position) => (
                <MotionListItem 
                  key={`${position.chain_id}-${position.contract_address}-${position.protocol}`} 
                  className="rounded-md bg-main p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image 
                        src={position.protocol_icon}
                        alt={position.protocol_name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="text-primary font-inter font-medium">{position.protocol_name}</h3>
                        <p className="text-sm text-secondary font-inter">{position.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-inter">${position.value_usd.toLocaleString()}</p>
                      {position.profit_abs_usd !== null && (
                        <p className={`text-sm font-inter ${position.profit_abs_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {position.profit_abs_usd >= 0 ? '+' : ''}{position.profit_abs_usd.toLocaleString()}
                          {position.roi !== null && ` (${(position.roi * 100).toFixed(2)}%)`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-secondary font-inter">
                    <div>
                      <span className="mr-2">Chain:</span>
                      <span className="text-primary">{chainNames[position.chain_id] || `Chain ${position.chain_id}`}</span>
                    </div>
                    {position.weighted_apr !== null && (
                      <div>
                        <span className="mr-2">APR:</span>
                        <span className="text-primary">{(position.weighted_apr * 100).toFixed(2)}%</span>
                      </div>
                    )}
                    <div>
                      <span className="mr-2">Time:</span>
                      <span className="text-primary">{position.holding_time_days} days</span>
                    </div>
                  </div>
                </MotionListItem>
              ))}
            </MotionList>
          </div>

          <div className="mb-6">
            <PortfolioChart 
              data={chartData}
              timerange={timerange}
            />
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button 
              variant="cta" 
              className="w-full sm:w-auto font-inter"
              onClick={handleGetAdvice}
            >
              Get Eve Advice
            </Button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}

export default PortfolioPage; 