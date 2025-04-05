import { z } from 'zod';
import { InstrumentType, RiskAppetite } from './user-profile-analysis';

// Risk Metrics
export const DeltaRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const GammaRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const VegaRisk = z.enum(['ZERO', 'POSITIVE', 'NEGATIVE']);
export const ImpermanentLossRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const LiquidityRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const SmartContractRisk = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// New time horizon type that better reflects user involvement needs
export const TimeHorizon = z.enum([
  'PASSIVE', // Set and forget, minimal management needed (e.g., staking, lending)
  'ACTIVE'   // Requires periodic management or rollovers (e.g., options, Pendle positions)
]);
export type TimeHorizon = z.infer<typeof TimeHorizon>;

// Instrument types enum
export enum InstrumentKey {
  AMM_LP = 'AMM_LP',
  STABLE_LP = 'STABLE_LP',
  STABLE_LENDING = 'STABLE_LENDING',
  LST_LENDING = 'LST_LENDING',
  BORROWING = 'BORROWING',
  ETH_STAKING = 'ETH_STAKING',
  PENDLE_PT = 'PENDLE_PT',
  PENDLE_YT = 'PENDLE_YT',
  PENDLE_LP = 'PENDLE_LP',
  LONG_CALL_OPTION = 'LONG_CALL_OPTION',
  LONG_PUT_OPTION = 'LONG_PUT_OPTION',
  COVERED_CALL = 'COVERED_CALL',
}

export const InstrumentDefinition = z.object({
  name: z.string(),
  url: z.string().optional(),
  protocol: z.string(),
  description: z.string(),
  apy: z.number().optional(),
  riskLevel: RiskAppetite,
  timeHorizon: TimeHorizon,
  pros: z.string(),
  cons: z.string(),
  riskMetrics: z.object({
    delta: DeltaRisk,
    gamma: GammaRisk,
    vega: VegaRisk,
    impermanentLoss: ImpermanentLossRisk,
    liquidity: LiquidityRisk,
    smartContract: SmartContractRisk
  })
});

export type InstrumentDefinition = z.infer<typeof InstrumentDefinition>;

export const INSTRUMENT_DEFINITIONS: Record<InstrumentKey, InstrumentDefinition> = {
  [InstrumentKey.AMM_LP]: {
    name: 'Automated Market Maker LP',
    protocol: 'Uniswap',
    url: 'https://uniswap.org/',
    apy: 20,
    description: 'Provide liquidity to onchain AMMs and earn trading fees',
    riskLevel: 'MODERATE',
    timeHorizon: 'PASSIVE',
    pros: 'Earn passive income through trading fees, benefit from protocol incentives, and maintain high capital efficiency. Positions can be exited at any time.',
    cons: 'High risk of impermanent loss. Exposure to smart contract risk from the protocol. Market making may underperform in trending markets.',
    riskMetrics: {
      delta: 'NONE',
      gamma: 'LOW',
      vega: 'POSITIVE',
      impermanentLoss: 'HIGH',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.STABLE_LP]: {
    name: 'Stablecoin Liquidity Pool',
    protocol: 'Curve',
    url: 'https://curve.fi/',
    apy: 5,
    description: 'Provide liquidity between different stablecoins to earn trading fees with minimal price risk',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'PASSIVE',
    pros: 'Lower impermanent loss risk due to price stability, consistent fee generation from arbitrage trades, and high capital efficiency for stablecoin pairs.',
    cons: 'Risk of stablecoin depegging. Exposure to smart contract risk from multiple protocols (usually more than 3 stables in one pool).',
    riskMetrics: {
      delta: 'NONE',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'LOW',
      liquidity: 'LOW',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.STABLE_LENDING]: {
    name: 'Stablecoin Lending (Smokehouse)',
    protocol: 'Morpho',
    apy: 7.65,
    url: 'https://app.morpho.org/ethereum/vault/0xBEeFFF209270748ddd194831b3fa287a5386f5bC/smokehouse-usdc',
    description: 'Lend stablecoins to earn variable interest rates',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'PASSIVE',
    pros: 'Predictable yields with low risk. Protected from market movements through liquidation mechanisms.',
    cons: 'Yields fluctuate based on market demand. Risk of collateral asset depegging or protocol hacks. Liquidity risk during high borrow demand.',
    riskMetrics: {
      delta: 'NONE',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'NONE',
      liquidity: 'LOW',
      smartContract: 'LOW'
    }
  },

  [InstrumentKey.LST_LENDING]: {
    name: 'Liquid Staking Token Lending (Smokehouse)',
    protocol: 'Morpho',
    apy: 2.35,
    url: 'https://app.morpho.org/ethereum/vault/0x833AdaeF212c5cD3f78906B44bBfb18258F238F0/smokehouse-wsteth',
    description: 'Lend liquid staking tokens like stETH or rETH to earn additional yield on top of staking rewards',
    riskLevel: 'MODERATE',
    timeHorizon: 'PASSIVE',
    pros: 'Stack yields from both staking and lending. Maintain exposure to ETH price appreciation while keeping positions relatively liquid.',
    cons: 'Complex risks from LST rate changes and potential depegging. Additional oracle risk on top of LST risks.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'NONE',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.BORROWING]: {
    name: 'Borrowing Positions',
    protocol: 'Morpho',
    url: 'https://app.morpho.org/ethereum/borrow',
    description: 'Borrow assets against collateral for leverage',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ACTIVE',
    pros: 'Access to leverage for amplified returns. Create short exposure. Enable flexible yield optimization strategies.',
    cons: 'Risk of liquidation if collateral value drops. High borrowing costs during market stress. Requires complex position management.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.ETH_STAKING]: {
    name: 'ETH Staking',
    protocol: 'Lido',
    url: 'https://stake.lido.fi/',
    apy: 2.12,
    description: 'Stake ETH directly or via liquid staking tokens to earn staking rewards',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'PASSIVE',
    pros: 'Secure base yield from network participation. Full exposure to ETH appreciation. Predictable rewards with minimal management.',
    cons: 'Risk of validator slashing. Position lockup period for direct staking. LST discount risk for liquid staking options.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'NONE',
      liquidity: 'LOW',
      smartContract: 'LOW'
    }
  },

  [InstrumentKey.PENDLE_PT]: {
    name: 'Pendle Principal Token (USR)',
    apy: 12.5,
    protocol: 'Pendle',
    url: 'https://app.pendle.finance/trade/markets/0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82/swap?view=pt&chain=ethereum',
    description: 'Fixed-yield token representing the principal portion of a yield-bearing asset',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'ACTIVE',
    pros: 'Fixed-rate returns with principal protection. Clear maturity date and yield expectations. Lower volatility than full yield-bearing assets.',
    cons: 'Limited upside potential. Term commitment required. Market price fluctuates based on interest rates.',
    riskMetrics: {
      delta: 'LOW',
      gamma: 'LOW',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.PENDLE_YT]: {
    name: 'Pendle Yield Token (lvlUSD)',
    protocol: 'Pendle',
    apy: 12.25,
    url: 'https://app.pendle.finance/trade/markets/0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82/swap?view=yt&chain=ethereum',
    description: 'Token representing the yield portion of a yield-bearing asset',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ACTIVE',
    pros: 'Leveraged exposure to yield rates. High potential returns in rising rate environments. Pure yield trading without principal risk.',
    cons: 'High sensitivity to interest rate changes. Complex pricing mechanics. Requires active management.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.PENDLE_LP]: {
    name: 'Pendle Liquidity Provider (lvlUSD)',
    protocol: 'Pendle',
    url: 'https://app.pendle.finance/trade/pools/0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82/zap/in?chain=ethereum',
    apy: 9.38,
    description: 'Provide liquidity for Pendle markets and earn trading fees',
    riskLevel: 'MODERATE',
    timeHorizon: 'ACTIVE',
    pros: 'Earn fees from YT/PT trading activity. Additional rewards from market making. Balanced exposure to both yield and principal tokens.',
    cons: 'Complex impermanent loss dynamics from yield rate changes. Term-based liquidity commitment. Requires understanding of yield curves.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'HIGH',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.LONG_CALL_OPTION]: {
    name: 'Long Call Option',
    protocol: 'Derive',
    url: 'https://www.derive.xyz/',
    description: 'Buy call options for upside exposure with limited downside',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ACTIVE',
    pros: 'Limited downside risk to premium paid. Leveraged upside exposure to ETH price. Clear risk/reward parameters.',
    cons: 'Premium decay over time. High costs in volatile markets. Requires correct market direction timing.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'HIGH',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.LONG_PUT_OPTION]: {
    name: 'Long Put Option',
    protocol: 'Derive',
    url: 'https://www.derive.xyz/',
    description: 'Buy put options for downside protection or bearish exposure',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ACTIVE',
    pros: 'Portfolio protection against market downturns. Leveraged bearish exposure with defined maximum loss.',
    cons: 'Premium decay over time. Expensive protection in volatile markets. Opportunity cost in sideways markets.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'HIGH',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  [InstrumentKey.COVERED_CALL]: {
    name: 'Covered Call Writing',
    protocol: 'Derive',
    url: 'https://www.derive.xyz/',
    description: 'Write call options against held assets for premium income',
    riskLevel: 'MODERATE',
    timeHorizon: 'ACTIVE',
    pros: 'Generate regular premium income. Enhanced yield on existing holdings. Partial downside protection from premiums.',
    cons: 'Limited upside potential beyond strike price. Requires active position management. Risk of missing strong market rallies.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },
}; 