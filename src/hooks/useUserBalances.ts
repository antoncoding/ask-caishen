import { useQuery } from '@tanstack/react-query';
import { findToken } from '@/utils/tokens';

export interface TokenBalance {
  address: string;
  balance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  value?: number;
  chainId?: string;
}

interface BalanceResponse {
  tokens: TokenBalance[];
}

/**
 * Hook to fetch token balances for a given address from both Mainnet and Base
 * @param address - The address to fetch balances for
 */
export function useUserBalances(address: string | undefined) {
  // Fetch Mainnet balances
  const mainnetQuery = useQuery<BalanceResponse>({
    queryKey: ['userBalances', address, '1'],
    queryFn: async () => {
      const response = await fetch(`/api/balances?address=${address}&chainId=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch mainnet balances');
      }
      const data = await response.json();
      return {
        tokens: data.tokens.map((token: TokenBalance) => ({
          ...token,
          chainId: '1'
        }))
      };
    },
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Fetch Base balances
  const baseQuery = useQuery<BalanceResponse>({
    queryKey: ['userBalances', address, '8453'],
    queryFn: async () => {
      const response = await fetch(`/api/balances?address=${address}&chainId=8453`);
      if (!response.ok) {
        throw new Error('Failed to fetch base balances');
      }
      const data = await response.json();
      return {
        tokens: data.tokens.map((token: TokenBalance) => ({
          ...token,
          chainId: '8453'
        }))
      };
    },
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Combine and process the results
  const combinedData: BalanceResponse = {
    tokens: [
      ...(mainnetQuery.data?.tokens || []),
      ...(baseQuery.data?.tokens || [])
    ].filter(token => {
      // Only include tokens that can be found with the correct chainId
      const tokenInfo = findToken(token.address, Number(token.chainId));
      return tokenInfo !== undefined;
    })
  };

  return {
    data: combinedData,
    isLoading: mainnetQuery.isLoading || baseQuery.isLoading,
    isError: mainnetQuery.isError || baseQuery.isError,
    error: mainnetQuery.error || baseQuery.error
  };
} 