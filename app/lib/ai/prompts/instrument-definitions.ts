import { z } from 'zod';

export const InstrumentDefinition = z.object({
  name: z.string(),
  description: z.string(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  timeHorizon: z.enum(['SHORT', 'MEDIUM', 'LONG', 'FLEXIBLE']),
  keyBenefits: z.array(z.string()),
  keyRisks: z.array(z.string()),
  bestSuitedFor: z.array(z.string())
});

export type InstrumentDefinition = z.infer<typeof InstrumentDefinition>;

export const INSTRUMENT_DEFINITIONS: Record<string, InstrumentDefinition> = {
  'AMM_LP': {
    name: 'Automated Market Maker LP',
    description: 'Provide liquidity to decentralized exchanges and earn trading fees',
    riskLevel: 'MEDIUM',
    timeHorizon: 'FLEXIBLE',
    keyBenefits: [
      'Earn trading fees from market activity',
      'Participate in protocol incentives',
      'High capital efficiency'
    ],
    keyRisks: [
      'Impermanent loss from price divergence',
      'Smart contract risk',
      'Market risk from token exposure'
    ],
    bestSuitedFor: [
      'Investors seeking passive yield',
      'Long-term holders of token pairs',
      'Risk-tolerant liquidity providers'
    ]
  },

  'STABLE_LP': {
    name: 'Stablecoin Liquidity Pool',
    description: 'Provide liquidity between different stablecoins to earn trading fees with minimal price risk',
    riskLevel: 'LOW',
    timeHorizon: 'FLEXIBLE',
    keyBenefits: [
      'Lower impermanent loss risk',
      'Steady fee generation',
      'High capital efficiency for stables'
    ],
    keyRisks: [
      'Stablecoin depegging risk',
      'Smart contract risk',
      'Lower yields compared to volatile pairs'
    ],
    bestSuitedFor: [
      'Conservative yield seekers',
      'Stablecoin holders',
      'Low-risk liquidity providers'
    ]
  },

  'VOLATILE_LP': {
    name: 'Volatile Asset Liquidity Pool',
    description: 'Provide liquidity for volatile asset pairs to earn higher trading fees with increased risk',
    riskLevel: 'HIGH',
    timeHorizon: 'MEDIUM',
    keyBenefits: [
      'Higher potential returns',
      'Exposure to token appreciation',
      'Higher trading fee generation'
    ],
    keyRisks: [
      'Significant impermanent loss risk',
      'High market risk',
      'Token volatility exposure'
    ],
    bestSuitedFor: [
      'Risk-tolerant investors',
      'Active portfolio managers',
      'Long-term token holders'
    ]
  },

  'STABLE_LENDING': {
    name: 'Stablecoin Lending',
    description: 'Lend stablecoins to earn fixed or variable interest rates',
    riskLevel: 'LOW',
    timeHorizon: 'FLEXIBLE',
    keyBenefits: [
      'Predictable yields',
      'No impermanent loss',
      'Highly liquid positions'
    ],
    keyRisks: [
      'Smart contract risk',
      'Variable rate fluctuation',
      'Utilization-dependent yields'
    ],
    bestSuitedFor: [
      'Conservative investors',
      'Stablecoin holders',
      'Fixed-income seekers'
    ]
  },

  'LST_LENDING': {
    name: 'Liquid Staking Token Lending',
    description: 'Lend liquid staking tokens like stETH or rETH to earn additional yield on top of staking rewards',
    riskLevel: 'MEDIUM',
    timeHorizon: 'MEDIUM',
    keyBenefits: [
      'Stack yields (staking + lending)',
      'Exposure to ETH appreciation',
      'Maintain liquid positions'
    ],
    keyRisks: [
      'LST depegging risk',
      'Smart contract risk',
      'ETH price volatility'
    ],
    bestSuitedFor: [
      'ETH stakers seeking additional yield',
      'Long-term ETH holders',
      'Yield optimizers'
    ]
  },

  'ISOLATED_LENDING': {
    name: 'Isolated Lending Markets',
    description: 'Lending in isolated markets with specific risk parameters for each asset',
    riskLevel: 'MEDIUM',
    timeHorizon: 'FLEXIBLE',
    keyBenefits: [
      'Higher yields for riskier assets',
      'Isolated risk exposure',
      'Market-specific opportunities'
    ],
    keyRisks: [
      'Asset-specific risks',
      'Lower liquidity',
      'Higher smart contract risk'
    ],
    bestSuitedFor: [
      'Risk-aware lenders',
      'Asset-specific strategies',
      'Yield optimizers'
    ]
  },

  'ETH_STAKING': {
    name: 'ETH Staking',
    description: 'Stake ETH directly or via liquid staking tokens to earn staking rewards',
    riskLevel: 'LOW',
    timeHorizon: 'LONG',
    keyBenefits: [
      'Secure base yield',
      'Network security participation',
      'ETH appreciation exposure'
    ],
    keyRisks: [
      'Protocol risk',
      'ETH price volatility',
      'Validator slashing risk'
    ],
    bestSuitedFor: [
      'Long-term ETH holders',
      'Passive income seekers',
      'Network stakeholders'
    ]
  },

  'RESTAKING': {
    name: 'Restaking',
    description: 'Stake LSTs across multiple protocols to earn additional rewards',
    riskLevel: 'MEDIUM',
    timeHorizon: 'MEDIUM',
    keyBenefits: [
      'Multiple yield sources',
      'Capital efficiency',
      'Protocol incentives'
    ],
    keyRisks: [
      'Smart contract risk multiplication',
      'Complex dependencies',
      'Protocol-specific risks'
    ],
    bestSuitedFor: [
      'Advanced DeFi users',
      'Yield optimizers',
      'Risk-tolerant stakers'
    ]
  }
}; 