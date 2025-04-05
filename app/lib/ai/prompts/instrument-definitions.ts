import { z } from 'zod';
import { InstrumentType, TimePreference, RiskAppetite } from './user-profile-analysis';

// Risk Metrics
export const DeltaRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const GammaRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const VegaRisk = z.enum(['ZERO', 'POSITIVE', 'NEGATIVE']);
export const ImpermanentLossRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const LiquidityRisk = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);
export const SmartContractRisk = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const InstrumentDefinition = z.object({
  name: z.string(),
  description: z.string(),
  riskLevel: RiskAppetite,
  timeHorizon: TimePreference,
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

export const INSTRUMENT_DEFINITIONS: Record<string, InstrumentDefinition> = {
  'AMM_LP': {
    name: 'Automated Market Maker LP',
    description: 'Provide liquidity to decentralized exchanges and earn trading fees',
    riskLevel: 'MODERATE',
    timeHorizon: 'FLEXIBLE',
    pros: 'Earn passive income through trading fees, benefit from protocol incentives, and maintain high capital efficiency. Position can be exited at any time.',
    cons: 'High risk of impermanent loss during market volatility. Smart contract risk from protocol exposure. Market making may underperform in trending markets.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'LOW',
      vega: 'POSITIVE',
      impermanentLoss: 'HIGH',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'STABLE_LP': {
    name: 'Stablecoin Liquidity Pool',
    description: 'Provide liquidity between different stablecoins to earn trading fees with minimal price risk',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'FLEXIBLE',
    pros: 'Lower impermanent loss risk due to price stability, consistent fee generation from arbitrage trades, and high capital efficiency for stablecoin pairs.',
    cons: 'Lower yields compared to volatile pairs. Risk of stablecoin depegging events. Smart contract risk from protocol exposure.',
    riskMetrics: {
      delta: 'LOW',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'LOW',
      liquidity: 'LOW',
      smartContract: 'MEDIUM'
    }
  },

  'STABLE_LENDING': {
    name: 'Stablecoin Lending',
    description: 'Lend stablecoins to earn fixed or variable interest rates',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'FLEXIBLE',
    pros: 'Predictable yields without impermanent loss risk. Highly liquid positions that can be exited quickly. No exposure to underlying asset volatility.',
    cons: 'Yields fluctuate based on market demand. Risk of borrower default. Smart contract risk from lending protocol.',
    riskMetrics: {
      delta: 'NONE',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'NONE',
      liquidity: 'LOW',
      smartContract: 'MEDIUM'
    }
  },

  'LST_LENDING': {
    name: 'Liquid Staking Token Lending',
    description: 'Lend liquid staking tokens like stETH or rETH to earn additional yield on top of staking rewards',
    riskLevel: 'MODERATE',
    timeHorizon: 'ROLLING_LONG',
    pros: 'Stack yields from both staking and lending. Maintain exposure to ETH price appreciation. Positions remain relatively liquid.',
    cons: 'Complex risk from LST rate changes and potential depegging. Higher smart contract risk from multiple protocols. ETH price volatility exposure.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'LOW',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'BORROWING': {
    name: 'Borrowing Positions',
    description: 'Borrow assets against collateral for leverage.',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'FLEXIBLE',
    pros: 'Access to leverage for amplified returns. Ability to create short exposure. Flexible yield optimization strategies.',
    cons: 'Risk of liquidation if collateral value drops. High borrowing costs during market stress. Complex position management required.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'HIGH'
    }
  },

  'ETH_STAKING': {
    name: 'ETH Staking',
    description: 'Stake ETH directly or via liquid staking tokens to earn staking rewards',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'ROLLING_LONG',
    pros: 'Secure base yield from network participation. Full exposure to ETH appreciation. Predictable rewards with minimal management.',
    cons: 'Validator slashing risk. Position lockup period for direct staking. LST discount risk for liquid staking.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'NONE',
      vega: 'ZERO',
      impermanentLoss: 'NONE',
      liquidity: 'LOW',
      smartContract: 'LOW'
    }
  },

  'RESTACKING': {
    name: 'Restaking',
    description: 'Stake LSTs across multiple protocols to earn additional rewards',
    riskLevel: 'MODERATE',
    timeHorizon: 'ROLLING_LONG',
    pros: 'Multiple yield sources from different protocols. Improved capital efficiency through restaking. Additional protocol incentives.',
    cons: 'Increased smart contract risk from multiple protocols. Complex dependencies and interactions. Higher gas costs for management.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'LOW',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'HIGH'
    }
  },

  'PENDLE_PT': {
    name: 'Pendle Principal Token',
    description: 'Fixed-yield token representing the principal portion of a yield-bearing asset',
    riskLevel: 'CONSERVATIVE',
    timeHorizon: 'FIXED_TERM',
    pros: 'Fixed-rate returns with principal protection. Clear maturity date and yield expectations. Lower volatility than full yield-bearing asset.',
    cons: 'Limited upside potential. Term commitment required. Market price can fluctuate based on interest rates.',
    riskMetrics: {
      delta: 'LOW',
      gamma: 'LOW',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'PENDLE_YT': {
    name: 'Pendle Yield Token',
    description: 'Token representing the yield portion of a yield-bearing asset',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'FIXED_TERM',
    pros: 'Leveraged exposure to yield rates. Potential for high returns in rising rate environment. Pure yield trading without principal risk.',
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

  'PENDLE_LP': {
    name: 'Pendle Liquidity Provider',
    description: 'Provide liquidity for Pendle markets and earn trading fees',
    riskLevel: 'MODERATE',
    timeHorizon: 'FIXED_TERM',
    pros: 'Earn fees from YT/PT trading activity. Additional rewards from market making. Exposure to both yield and principal tokens.',
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

  'LONG_CALL_OPTION': {
    name: 'Long Call Option',
    description: 'Buy call options for upside exposure with limited downside',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ROLLING_SHORT',
    pros: 'Limited downside risk to premium paid. Leveraged upside exposure to ETH price. Clear risk/reward parameters.',
    cons: 'Premium decay over time. High cost in volatile markets. Requires timing market direction correctly.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'HIGH',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'LONG_PUT_OPTION': {
    name: 'Long Put Option',
    description: 'Buy put options for downside protection or bearish exposure',
    riskLevel: 'AGGRESSIVE',
    timeHorizon: 'ROLLING_SHORT',
    pros: 'Portfolio protection against market downturns. Leveraged bearish exposure. Defined maximum loss.',
    cons: 'Premium decay over time. Expensive insurance in volatile markets. Opportunity cost in sideways markets.',
    riskMetrics: {
      delta: 'HIGH',
      gamma: 'HIGH',
      vega: 'NEGATIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'COVERED_CALL': {
    name: 'Covered Call Writing',
    description: 'Write call options against held assets for premium income',
    riskLevel: 'MODERATE',
    timeHorizon: 'ROLLING_SHORT',
    pros: 'Generate regular premium income. Enhanced yield on existing holdings. Some downside protection from premiums.',
    cons: 'Limited upside potential beyond strike price. Requires active position management. Risk of missing strong rallies.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  },

  'SHORT_PUT': {
    name: 'Cash Secured Put',
    description: 'Write put options with cash collateral for premium income',
    riskLevel: 'MODERATE',
    timeHorizon: 'ROLLING_SHORT',
    pros: 'Generate regular premium income. Potential to acquire assets at lower prices. Cash utilization while waiting for entry.',
    cons: 'Full exposure to downside below strike. Requires significant capital allocation. May underperform in strong rallies.',
    riskMetrics: {
      delta: 'MEDIUM',
      gamma: 'MEDIUM',
      vega: 'POSITIVE',
      impermanentLoss: 'NONE',
      liquidity: 'MEDIUM',
      smartContract: 'MEDIUM'
    }
  }
}; 