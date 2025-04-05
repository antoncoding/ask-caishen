'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import AccountConnect from '@/components/layout/header/AccountConnect';
import { Button } from '@/components/common/Button';
import axios from 'axios';

interface TokenData {
  symbol: string;
  balance: string;
  value: number;
}

interface PortfolioData {
  address: string;
  tokens: TokenData[];
  totalValue: number;
  profitLoss?: {
    absValue: number;
    percentage: number;
  };
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  // Load portfolio data when user is connected
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchPortfolioData = async () => {
      setIsLoading(true);
      try {
        // Fetch current portfolio value
        const valueResponse = await axios.get('/api/portfolio/current-value?chain_id=1');
        const valueData = valueResponse.data;
        
        // Fetch profit/loss data
        const pnlResponse = await axios.get('/api/portfolio/profit-and-loss?chain_id=1&timerange=1week');
        const pnlData = pnlResponse.data[0]; // Get first entry
        
        // Example portfolio data structure
        const data: PortfolioData = {
          address: address,
          tokens: [
            { symbol: 'ETH', balance: '1.25', value: 4500 },
            { symbol: 'USDC', balance: '2500', value: 2500 },
            { symbol: 'WBTC', balance: '0.08', value: 3600 }
          ],
          totalValue: valueData.value_usd || 10600,
          profitLoss: {
            absValue: pnlData?.abs_profit_usd || 0,
            percentage: pnlData?.roi ? pnlData.roi * 100 : 0
          }
        };
        
        setPortfolioData(data);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        
        // Fallback to sample data if API fails
        const fallbackData: PortfolioData = {
          address: address,
          tokens: [
            { symbol: 'ETH', balance: '1.25', value: 4500 },
            { symbol: 'USDC', balance: '2500', value: 2500 },
            { symbol: 'WBTC', balance: '0.08', value: 3600 }
          ],
          totalValue: 10600,
          profitLoss: {
            absValue: -6.59,
            percentage: -4.35
          }
        };
        
        setPortfolioData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [isConnected, address]);

  // Navigate to AI analysis page
  const goToAiAnalysis = () => {
    // In a real implementation, you would also pass portfolio data to the analysis page
    // either through URL params, state management, or a backend endpoint
    router.push('/portfolio/ai-analysis');
  };

  // Not connected state - show connect button
  if (!isConnected) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary">Connect Your Wallet</h1>
        <p className="mb-10 max-w-md text-center text-secondary">
          Connect your wallet to get personalized investment advice based on your on-chain portfolio.
        </p>
        <div className="w-48">
          <AccountConnect />
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary">Analyzing Your Portfolio</h1>
        <p className="mb-6 text-xl text-secondary">
          Eve is reviewing your on-chain activity...
        </p>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Portfolio loaded state
  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <h1 className="mb-6 text-4xl text-primary text-center">Your DeFi Portfolio</h1>
      
      {portfolioData && (
        <div className="mb-8">
          <div className="mb-6 rounded-lg bg-surface p-6">
            <h2 className="mb-4 text-2xl text-primary text-center">Portfolio Overview</h2>
            <p className="mb-2 text-3xl text-primary text-center">
              ${portfolioData.totalValue.toLocaleString()}
            </p>
            
            {portfolioData.profitLoss && (
              <p className={`text-center mb-6 ${portfolioData.profitLoss.absValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioData.profitLoss.absValue >= 0 ? '▲' : '▼'} 
                ${Math.abs(portfolioData.profitLoss.absValue).toFixed(2)} 
                ({portfolioData.profitLoss.percentage.toFixed(2)}%) past week
              </p>
            )}
            
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {portfolioData.tokens.map((token) => (
                <div key={token.symbol} className="rounded-md bg-main p-4 text-center">
                  <p className="text-sm text-secondary">{token.symbol}</p>
                  <p className="text-lg text-primary">{token.balance}</p>
                  <p className="text-sm text-secondary">${token.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="cta" 
              className="w-full sm:w-auto"
              onClick={goToAiAnalysis}
            >
              Get Investment Advice
            </Button>
            
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => router.push('/history')}
            >
              View Transaction History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 