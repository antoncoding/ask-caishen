'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { SquareLoader } from 'react-spinners';
import AccountConnect from '@/components/layout/header/AccountConnect';
import { Button } from '@/components/common/Button';
import { useUserBalances } from '@/hooks/useUserBalances';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import { MotionWrapper, MotionList, MotionListItem } from '@/components/animations/MotionWrapper';
import { findToken } from '@/utils/tokens';
import Image from 'next/image';
import { Chain, formatUnits } from 'viem';

enum TimeRange {
  Day = '1day',
  Week = '1week',
  Month = '1month'
}

interface TokenBalance {
  address: string;
  chainId: string | number;
  symbol: string;
  balance: string;
  value?: number;
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

// Default token icon as a simple data URL circle
const DEFAULT_TOKEN_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';

// Add a helper function to format the balance
const formatTokenBalance = (balance: string, decimals: number) => {
  try {
    const formatted = formatUnits(BigInt(balance), decimals);
    // Format with appropriate decimal places based on the value
    const value = parseFloat(formatted);
    if (value < 0.0001) {
      return '< 0.0001';
    }
    if (value < 1) {
      return value.toFixed(4);
    }
    if (value < 1000) {
      return value.toFixed(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
};

export const PortfolioPage = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [timerange, setTimerange] = React.useState<TimeRange>(TimeRange.Week);
  const [isChartLoading, setIsChartLoading] = React.useState(false);

  const { 
    data: balanceData, 
    isLoading: balancesLoading,
    isError: balancesError,
  } = useUserBalances(address);

  const {
    totalValue,
    profitLoss,
    chartData,
    isLoading: portfolioLoading,
    isError: portfolioError,
  } = usePortfolioData(address, '1', timerange);

  // Get the current value from the latest chart data point
  const currentValue = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return totalValue;
    return chartData[chartData.length - 1].value_usd;
  }, [chartData, totalValue]);

  const isInitialLoading = balancesLoading || portfolioLoading;
  const hasError = balancesError || portfolioError;

  const handleAiAnalysis = () => {
    router.push('/portfolio/ai-analysis');
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    if (timerange === newTimeRange) return; // Don't reload if same timerange
    setIsChartLoading(true);
    setTimerange(newTimeRange);
  };

  // Clear chart loading state when new data arrives
  React.useEffect(() => {
    if (chartData && chartData.length > 0) {
      setIsChartLoading(false);
    }
  }, [chartData]);

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

  if (isInitialLoading) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">Analyzing Your Portfolio</h1>
        <p className="mb-6 text-xl text-secondary font-inter">
          Fetching your on-chain balances...
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

  // Filter recognized tokens and ensure they have token info
  const recognizedTokens = balanceData?.tokens.filter(token => {
    const tokenInfo = findToken(token.address, 1); // Using mainnet chainId
    return tokenInfo?.img !== undefined; // Only include tokens with defined images
  }) || [];

  if (!recognizedTokens.length) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">No Recognized Assets Found</h1>
        <p className="mb-10 max-w-md text-center text-secondary font-inter">
          We couldn't find any recognized tokens in your wallet. Make sure you have some supported assets to view portfolio details.
        </p>
      </MotionWrapper>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <MotionWrapper>
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

            <div className="mb-6">
              <p className="text-center text-3xl text-primary font-inter">
                ${currentValue?.toLocaleString() ?? '0'}
              </p>
              
              {profitLoss && (
                <p className={`text-center font-inter ${profitLoss.absValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitLoss.absValue >= 0 ? '▲' : '▼'} 
                  ${Math.abs(profitLoss.absValue).toFixed(2)} 
                  ({profitLoss.percentage.toFixed(2)}%) past {timerange === TimeRange.Day ? '24h' : timerange === TimeRange.Week ? '7d' : '30d'}
                </p>
              )}
            </div>
            
            <MotionList className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {recognizedTokens.map((token) => {
                const tokenInfo = findToken(token.address, 1)!;
                const formattedBalance = formatTokenBalance(token.balance, tokenInfo.decimals);
                
                return (
                  <MotionListItem 
                    key={token.address} 
                    className="rounded-md bg-main p-4 text-center flex flex-col items-center"
                  >
                    <div className="mb-2">
                      <Image 
                        src={tokenInfo.img!}
                        alt={token.symbol} 
                        width={32} 
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <p className="text-sm text-secondary font-inter">{token.symbol}</p>
                    <p className="text-lg text-primary font-inter">{formattedBalance}</p>
                    <p className="text-sm text-secondary font-inter">
                      ${token.value?.toLocaleString() ?? '0'}
                    </p>
                  </MotionListItem>
                );
              })}
            </MotionList>
          </div>

          <div className="mb-6 relative">
            {isChartLoading && (
              <div className="absolute inset-0 bg-surface bg-opacity-50 flex items-center justify-center z-10">
                <SquareLoader color="#8fa6cb" size={30} />
              </div>
            )}
            <PortfolioChart 
              data={chartData}
              timerange={timerange}
            />
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button 
              variant="cta" 
              className="w-full sm:w-auto font-inter"
              onClick={handleAiAnalysis}
            >
              Get Investment Advice
            </Button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}

export default PortfolioPage; 