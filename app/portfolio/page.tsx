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

  const { 
    data: balanceData, 
    isLoading: balancesLoading,
    isError: balancesError,
    error: balancesErrorData
  } = useUserBalances(address);

  const {
    totalValue,
    profitLoss,
    chartData,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorData
  } = usePortfolioData(address, '1', timerange);

  console.log('totalValue', totalValue)

  const isLoading = balancesLoading || portfolioLoading;
  const hasError = balancesError || portfolioError;

  const handleAiAnalysis = () => {
    router.push('/portfolio/ai-analysis');
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimerange(newTimeRange);
  };

  // Add logging to debug the data
  React.useEffect(() => {
    console.log('Portfolio Data:', {
      totalValue,
      chartData: chartData?.length ? chartData[chartData.length - 1] : null,
      profitLoss
    });
  }, [totalValue, chartData, profitLoss]);

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

            <MotionList className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {recognizedTokens.map((token) => {
                // Since we filtered for tokens with images, this will always exist
                const tokenInfo = findToken(token.address, 1)!;
                const formattedBalance = formatTokenBalance(token.balance, tokenInfo.decimals);
                
                return (
                  <MotionListItem 
                    key={token.address} 
                    className="rounded-md bg-main p-4 text-center flex flex-col items-center"
                  >
                    <div className="mb-2">
                      <Image 
                        src={tokenInfo.img!} // We can safely assert non-null here due to our filter
                        alt={token.symbol || 'Token Icon'} 
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