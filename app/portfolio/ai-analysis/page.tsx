'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'invest' | 'divest' | 'hold';
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  action: string;
}

export default function AiAnalysisPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Check if user is connected, redirect if not
  useEffect(() => {
    if (!isConnected) {
      router.push('/portfolio');
      return;
    }

    // Simulate loading AI recommendations
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would:
        // 1. Fetch recommendations from your AI backend
        // 2. Process the data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Example recommendations
        const mockRecommendations: Recommendation[] = [
          {
            id: '1',
            title: 'Increase ETH position',
            description: 'Based on your portfolio and current market conditions, increasing your ETH exposure could be beneficial.',
            type: 'invest',
            riskLevel: 'medium',
            expectedReturn: '10-15% (3 months)',
            action: 'Buy ETH',
          },
          {
            id: '2',
            title: 'Diversify with stablecoins',
            description: 'Your portfolio could benefit from more stable assets as a hedge against market volatility.',
            type: 'invest',
            riskLevel: 'low',
            expectedReturn: '4-6% (Annual)',
            action: 'Buy USDC',
          },
          {
            id: '3',
            title: 'Reduce exposure to WBTC',
            description: 'Current market trends suggest a potential downward movement for Bitcoin in the short term.',
            type: 'divest',
            riskLevel: 'medium',
            expectedReturn: 'Risk mitigation',
            action: 'Sell WBTC',
          }
        ];
        
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error('Error loading AI recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [isConnected, router]);

  // Get recommendation card color based on type
  const getCardColorClass = (type: Recommendation['type']) => {
    switch (type) {
      case 'invest':
        return 'border-l-4 border-green-500';
      case 'divest':
        return 'border-l-4 border-red-500';
      case 'hold':
        return 'border-l-4 border-blue-500';
      default:
        return '';
    }
  };

  // Get badge color based on risk level
  const getRiskBadgeClass = (risk: Recommendation['riskLevel']) => {
    const baseClass = 'text-xs px-2 py-1 rounded-full';
    switch (risk) {
      case 'low':
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'medium':
        return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'high':
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return baseClass;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl text-primary">Vennett is Thinking...</h1>
        <p className="mb-8 text-xl text-secondary">Analyzing market data and your portfolio</p>
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl text-primary">Investment Recommendations</h1>
        <p className="text-secondary">
          Personalized suggestions based on your on-chain activity and current market conditions
        </p>
      </div>

      <div className="mb-8 space-y-6">
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`bg-surface rounded-lg p-6 shadow-sm ${getCardColorClass(rec.type)}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl text-primary">{rec.title}</h2>
              <span className={getRiskBadgeClass(rec.riskLevel)}>
                {rec.riskLevel.charAt(0).toUpperCase() + rec.riskLevel.slice(1)} Risk
              </span>
            </div>
            
            <p className="mb-4 text-secondary">{rec.description}</p>
            
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <p className="text-sm text-secondary">Expected Return:</p>
                <p className="text-lg text-primary">{rec.expectedReturn}</p>
              </div>
              
              <Button variant="cta" size="sm" className="mt-2 sm:mt-0">
                {rec.action}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-surface p-6">
        <h2 className="mb-4 text-2xl text-primary">Ask Vennett for more advice</h2>
        <div className="mb-4 flex items-center">
          <input 
            type="text" 
            placeholder="Ask a specific question about your investments..." 
            className="bg-main flex-1 rounded-l-lg border-0 px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button variant="cta" className="rounded-l-none">
            Ask Vennett
          </Button>
        </div>
      </div>
    </div>
  );
} 