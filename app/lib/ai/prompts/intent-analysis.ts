import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { InstrumentType, TimePreference, RiskAppetite } from './user-profile-analysis';
import { INSTRUMENT_DEFINITIONS, InstrumentKey } from './instrument-definitions';

// Helper function to generate instrument summaries for the LLM
export function generateInstrumentSummaries() {
  const summaries = Object.entries(INSTRUMENT_DEFINITIONS).map(([key, instrument]) => {
    const riskMetricsSummary = Object.entries(instrument.riskMetrics)
      .filter(([_, level]) => level !== 'NONE' && level !== 'ZERO')
      .map(([metric, level]) => `${metric}: ${level}`)
      .join(', ');

    return `${key}:
  Name: ${instrument.name}
  Type: ${instrument.timeHorizon} management required
  Risk Level: ${instrument.riskLevel}
  APY Range: ${instrument.apy ? `~${instrument.apy}%` : 'Variable'}
  Key Risks: ${riskMetricsSummary}
  Pros: ${instrument.pros}
  Cons: ${instrument.cons}`;
  }).join('\n\n');

  return `Available Investment Instruments Summary:
${summaries}

Investment Categories:
1. Passive Management (Set and Forget):
   - Stablecoin Lending
   - ETH Staking
   - AMM LP
   - Stable LP
   - LST Lending

2. Active Management (Regular Attention Required):
   - Pendle Products (PT/YT/LP)
   - Options Strategies
   - Borrowing Positions

Risk Levels:
- Conservative: Established protocols, lower yields
- Moderate: Mix of established and newer protocols
- Aggressive: Newer protocols, higher yields

When suggesting instruments, consider:
1. User's time commitment (Passive vs Active)
2. Risk tolerance and experience level
3. Yield expectations vs risk appetite
4. Market directional views
5. Portfolio diversification needs`;
}

export const IntentSchema = z.object({
  primary_goal: z.enum([
    'YIELD_OPTIMIZATION',      // Improve yields while maintaining risk
    'RISK_REDUCTION',         // Reduce overall portfolio risk
  ]),
  constraints: z.object({
    time_preference: TimePreference,
    risk_appetite: RiskAppetite,
    minimum_position_size: z.number(),
    maximum_position_size: z.number().optional(),
    preferred_instruments: z.array(InstrumentType),
    excluded_instruments: z.array(InstrumentType).optional()
  }),
  context: z.object({
    market_view: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional(),
    yield_curve_view: z.enum(['STEEPENING', 'FLATTENING', 'NEUTRAL']).optional(),
    volatility_view: z.enum(['HIGH', 'LOW', 'NEUTRAL']).optional()
  })
});

export const IntentResponseSchema = z.object({
  intent: IntentSchema,
  confidence: z.number(),
  suggested_instruments: z.array(z.object({
    type: InstrumentType,
    reason: z.string(),
    fit_score: z.number(),
    time_alignment: z.number(),
    risk_alignment: z.number()
  })),
  next_question: z.object({
    text: z.string(),
    purpose: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      description: z.string().optional()
    }))
  }).optional()
});

export type Intent = z.infer<typeof IntentSchema>;
export type IntentResponse = z.infer<typeof IntentResponseSchema>;

export const intentAnalysisPrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are Caishen, an investment advisor analyzing user intent for DeFi portfolio optimization.

Your goal is to understand what the user wants to achieve with their portfolio and suggest the most suitable investment instruments. You talk a lot and spare no details.

Focus on understanding:
1. Primary Investment Goal
   - Yield optimization vs. risk reduction
   
2. Investment Constraints
   - Risk appetite and limits
   - Position size requirements
   
3. Market Context
   - User's market directional view
   - Yield curve expectations
   
When suggesting instruments:
- Match time preferences with appropriate instruments
- Consider risk appetite when suggesting strategies
- Factor in market views for optimal timing
- Suggest complementary instruments for better portfolio construction

Provide specific reasoning for each suggested instrument:
- Why it fits the user's intent
- How it aligns with time preferences
- Risk/reward alignment
- Portfolio fit and diversification benefits

Categorize instruments and try to see if user has preference about the property, NOT just ask user to choose from the list.
- e.g.: Instead of asking do you want leverage, ask are you okay with constant management to avoid liquidations.
- e.g.: Instead of asking do you want use covered call, ask if you will be okay with giving up the update for premium.
- e.g.: You must return "next question" if the analysis is not done yet, even if you already have some suggestions

Keep focus on understanding investment goals and matching them with optimal instruments.`],
  ['system', '{instrument_summaries}'],
  ['user', 'Portfolio Context:\n{portfolio_context}'],
  ['user', 'Conversation History:\n{conversation_history}'],
  ['user', 'Current Question: {current_question}\nSelected Option: {selected_option}']
]); 