import { useQuery } from '@tanstack/react-query';

export interface TokenBalance {
  address: string;
  balance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  value?: number;
}

interface BalanceResponse {
  tokens: TokenBalance[];
}

/**
 * Hook to fetch token balances for a given address
 * @param address - The address to fetch balances for
 * @param chainId - The chain ID to fetch balances from (defaults to '1' for Ethereum mainnet)
 */
export function useUserBalances(address: string | undefined, chainId: string = '1') {
  return useQuery<BalanceResponse>({
    queryKey: ['userBalances', address, chainId],
    queryFn: async () => {
      const response = await fetch(`/api/balances?address=${address}&chainId=${chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
} 