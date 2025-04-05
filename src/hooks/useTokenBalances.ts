'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface TokenBalance {
  address: string;
  balance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  value?: number;
}

/**
 * Custom hook to fetch token balances for an address on a specific chain
 */
export function useTokenBalances(
  address: string | undefined, 
  chainId: string = '1'
) {
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['tokenBalances', address, chainId],
    queryFn: async () => {
      // Fetch token balances from the API
      const response = await axios.get(`/api/balances?address=${address}&chainId=${chainId}`);
      
      // For demonstration, add placeholder prices to the top 3 tokens
      // In a real implementation, you would fetch prices from a price API
      const tokens = response.data.tokens || [];
      
      // Sort by balance (descending) and take top ones
      const topTokens = tokens.slice(0, 5);
      
      // Add placeholder data until we implement token metadata fetching
      const enrichedTokens: TokenBalance[] = topTokens.map((token: TokenBalance, index: number) => {
        // Placeholder data based on token index
        const placeholderData: Record<number, { symbol: string, value: number }> = {
          0: { symbol: 'ETH', value: 4500 },
          1: { symbol: 'USDC', value: 2500 },
          2: { symbol: 'WBTC', value: 3600 },
          3: { symbol: 'UNI', value: 1200 },
          4: { symbol: 'LINK', value: 800 }
        };
        
        const placeholder = placeholderData[index] || { symbol: `TOKEN${index}`, value: 100 };
        
        return {
          ...token,
          symbol: placeholder.symbol,
          decimals: 18,
          value: placeholder.value
        };
      });
      
      return {
        tokens: enrichedTokens,
        totalValue: enrichedTokens.reduce((sum, token) => sum + (token.value || 0), 0)
      };
    },
    enabled: !!address,
    refetchInterval: 60000, // Refetch every minute
  });
  
  return {
    tokens: data?.tokens || [],
    totalTokenValue: data?.totalValue || 0,
    isLoading,
    isError,
    error
  };
} 