import { useQuery } from '@tanstack/react-query';

interface UnderlyingToken {
  chain_id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  price_to_usd: number;
  value_usd: number;
}

interface RewardToken extends UnderlyingToken {}

interface PortfolioInfo {
  profit_abs_usd?: number;
  roi?: number;
  weighted_apr?: number;
  holding_time_days: number;
  rewards_tokens?: RewardToken[];
  apr?: number;
  rewards?: number;
  gained_reward_usd?: number;
  gained_reward?: number;
  profit_abs?: number;
  apy?: number;
  steth_amount?: number;
}

interface PortfolioPosition {
  chain_id: number;
  contract_address: string;
  token_id: number;
  addresses: string[];
  protocol: string;
  name: string;
  contract_type: string;
  sub_contract_type: string;
  is_whitelisted: number;
  protocol_name: string;
  protocol_icon: string;
  status: number;
  token_address: string;
  underlying_tokens: UnderlyingToken[];
  value_usd: number;
  debt: boolean;
  rewards_tokens: RewardToken[];
  profit_abs_usd: number | null;
  roi: number | null;
  weighted_apr: number | null;
  holding_time_days: number;
  info: PortfolioInfo;
}

interface PortfolioDetailsResponse {
  result: PortfolioPosition[];
}

export interface PortfolioDetails {
  positions: PortfolioPosition[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to fetch detailed portfolio data from multiple chains
 * @param address - The address to fetch portfolio details for
 */
export function usePortfolioDetails(address: string | undefined): PortfolioDetails {
  // Fetch Mainnet details
  const mainnetQuery = useQuery<PortfolioDetailsResponse>({
    queryKey: ['portfolioDetails', address, '1'],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/details?address=${address}&chainId=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch mainnet portfolio details');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Fetch Base details
  const baseQuery = useQuery<PortfolioDetailsResponse>({
    queryKey: ['portfolioDetails', address, '8453'],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/details?address=${address}&chainId=8453`);
      if (!response.ok) {
        throw new Error('Failed to fetch base portfolio details');
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 60000,
  });

  // Combine the results
  const positions = [
    ...(mainnetQuery.data?.result || []),
    ...(baseQuery.data?.result || [])
  ];

  return {
    positions,
    isLoading: mainnetQuery.isLoading || baseQuery.isLoading,
    isError: mainnetQuery.isError || baseQuery.isError,
    error: mainnetQuery.error || baseQuery.error
  };
} 