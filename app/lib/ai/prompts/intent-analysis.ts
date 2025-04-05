import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { InstrumentType, TimePreference, RiskAppetite } from './user-profile-analysis';

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
  ['system', `You are an AI investment advisor analyzing user intent for DeFi portfolio optimization.

Your goal is to understand what the user wants to achieve with their portfolio and suggest the most suitable investment instruments.

Focus on understanding:
1. Primary Investment Goal
   - Yield optimization vs. risk reduction
   - Time horizon changes
   - Portfolio rebalancing needs
   - Hedging requirements

2. Investment Constraints
   - Time preferences (fixed vs. flexible)
   - Risk appetite and limits
   - Position size requirements
   - Instrument preferences/exclusions

3. Market Context
   - User's market directional view
   - Yield curve expectations
   - Volatility outlook

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

Keep focus on understanding investment goals and matching them with optimal instruments.`],
  ['system', 'Available Investment Instruments:\n{investment_instruments}'],
  ['user', 'Portfolio Context:\n{portfolio_context}'],
  ['user', 'Conversation History:\n{conversation_history}'],
  ['user', 'Current Question: {current_question}\nSelected Option: {selected_option}']
]); 