export interface Protocol {
  name: string;
  type: 'lending' | 'dex' | 'yield' | 'derivatives';
  description: string;
  uniqueValue: string;
}

export const PROTOCOLS: Record<string, Protocol> = {
  'morpho': {
    name: 'Morpho',
    type: 'lending',
    description: 'Lending primitive with isolated lending, risks were defined by risk curators',
    uniqueValue: 'Provides better rates than traditional lending by matching lenders and borrowers directly'
  },
  'euler': {
    name: 'Euler',
    type: 'lending',
    description: 'Lending protocol with advanced risk management',
    uniqueValue: 'Allows lending of any asset with risk-based limits and isolated risk pools'
  },
  'aave': {
    name: 'Aave',
    type: 'lending',
    description: 'Traditional lending protocol with proven track record',
    uniqueValue: 'Most established lending protocol with broad asset support'
  },
  'gmx': {
    name: 'GMX',
    type: 'derivatives',
    description: 'Perpetual exchange with minimal price impact',
    uniqueValue: 'Offers leverage trading with zero price impact using a multi-asset liquidity pool'
  },
  'uniswap': {
    name: 'Uniswap',
    type: 'dex',
    description: 'Automated market maker for token swaps',
    uniqueValue: 'Most liquid DEX with concentrated liquidity positions for efficient trading'
  }
};

// Helper function to get protocol description in a format suitable for AI context
export function getProtocolContext(protocolId: string): string {
  const protocol = PROTOCOLS[protocolId];
  if (!protocol) return '';

  return `
${protocol.name} (${protocol.type})
${protocol.description}
What makes it unique: ${protocol.uniqueValue}
  `.trim();
}

// Helper to get all protocols context
export function getAllProtocolsContext(): string {
  return Object.entries(PROTOCOLS)
    .map(([id, protocol]) => getProtocolContext(id))
    .join('\n\n');
} 