import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Define instrument types
export const InstrumentType = z.enum([
  // Liquidity Provision
  'AMM_LP',           // Automated Market Maker Liquidity Provision
  'STABLE_LP',        // Stablecoin LP (e.g. Curve)
  'VOLATILE_LP',      // Volatile Asset LP
  
  // Lending & Borrowing
  'STABLE_LENDING',   // Stablecoin Lending
  'LST_LENDING',      // Liquid Staking Token Lending
  'ISOLATED_LENDING', // Isolated Lending Markets
  'BORROWING',        // Borrowing Positions
  
  // Staking & Yield
  'ETH_STAKING',      // ETH Staking and Liquid Staking
  'RESTACKING',      // Liquid Staking Token Staking
  
  // Fixed Rate & Time Products
  'PENDLE_PT',        // Pendle Principal Token
  'PENDLE_YT',        // Pendle Yield Token
  'PENDLE_LP',        // Pendle LP
  
  // Options & Structured Products
  'LONG_CALL_OPTION', // Long Call Options
  'LONG_PUT_OPTION',  // Long Put Options
  'COVERED_CALL',     // Covered Call Writing
  'SHORT_PUT',        // Cash Secured Put
]);

// Define time preference types
export const TimePreference = z.enum([
  'FIXED_TERM',      // Fixed duration investments (e.g., Pendle PT/YT)
  'FLEXIBLE',        // No time lock (e.g., AMM LP)
  'ROLLING_SHORT',   // Short-term rolling positions (e.g., options)
  'ROLLING_LONG'     // Long-term rolling positions (e.g., staking)
]);

// Define risk appetite for different aspects
export const RiskAppetite = z.enum([
  'CONSERVATIVE',    // Established, audited protocols, lower yields
  'MODERATE',        // Mix of established and newer protocols
  'AGGRESSIVE'       // New protocols, higher yields, higher risk
]);

// Define the schema for investment preferences
export const InvestmentPreferencesSchema = z.object({
  acceptable_instruments: z.array(InstrumentType),
  time_preference: TimePreference,
  risk_appetite: RiskAppetite,
  trusted_assets: z.array(z.string()),
  yield_expectations: z.object({
    minimum_acceptable: z.number(),
    target: z.number(),
    maximum_risk_adjusted: z.number()
  }),
  trust_preferences: z.object({
    trust_risk_curators: z.boolean(),
    trusted_curators: z.array(z.string()).optional(),
    preferred_auditors: z.array(z.string()).optional()
  })
});

// Define the analysis progress schema
export const AnalysisProgressSchema = z.object({
  completed_topics: z.array(z.string()),
  missing_information: z.array(z.string()),
  confidence_levels: z.record(z.number()),
  is_analysis_complete: z.boolean(),
  conversation: z.object({
    response: z.string(),  // The AI's response to the user's last input
    personality_traits: z.array(z.string()), // e.g. ["encouraging", "analytical"]
    context_awareness: z.array(z.string()), // e.g. ["noticed risk aversion", "spotted yield opportunity"]
  }),
  next_question: z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['single_choice', 'multiple_choice']),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      description: z.string().optional()
    }))
  }).optional()
});

// Define the portfolio analysis schema
export const PortfolioAnalysisSchema = z.object({
  current_instruments: z.array(z.object({
    type: InstrumentType,
    amount: z.number(),
    apy: z.number().optional(),
    time_horizon: TimePreference.optional()
  })),
  risk_metrics: z.object({
    concentration_risk: z.number(),
    impermanent_loss_risk: z.number().optional(),
    smart_contract_risk: z.number(),
    market_risk: z.number()
  }),
  opportunities: z.array(z.object({
    instrument_type: InstrumentType,
    estimated_apy: z.number(),
    risk_level: RiskAppetite,
    time_preference: TimePreference,
    reason: z.string()
  }))
});

// Combined response type for each analysis step
export const AnalysisResponseSchema = z.object({
  preferences: InvestmentPreferencesSchema,
  portfolio: PortfolioAnalysisSchema,
  progress: AnalysisProgressSchema
});

export type InvestmentPreferences = z.infer<typeof InvestmentPreferencesSchema>;
export type PortfolioAnalysis = z.infer<typeof PortfolioAnalysisSchema>;
export type AnalysisProgress = z.infer<typeof AnalysisProgressSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

export const userProfilePrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an expert DeFi investment advisor analyzing user portfolios and suggesting optimal investment strategies.
You have a friendly and engaging personality, and you provide personalized insights in a conversational manner.

Your responses should be:
- Personal and engaging
- Contextually aware of previous choices
- Encouraging and supportive
- Focused on education and guidance
- Clear about reasoning and suggestions

Example responses:
- "I see you're interested in ETH staking - that's a great foundation! Based on your risk comfort level, we could explore some interesting ways to boost those yields while keeping things secure..."
- "Ah, looking for higher yields? I like your ambition! Let's look at some proven strategies that can help you reach that goal while staying within your risk comfort zone..."
- "Smart choice focusing on stablecoin strategies. I notice you're comfortable with moderate risk - have you considered combining this with some LST lending? It could significantly boost your yields..."

When making suggestions:
- Always explain the reasoning
- Connect it to user's previous choices
- Highlight both benefits and risks
- Show enthusiasm for good fits
- Be honest about trade-offs

Keep the conversation flowing naturally while gathering the necessary information to make informed suggestions.`],
  ['user', `Portfolio Context:
{portfolio_context}

Conversation History:
{conversation_history}

Current Question:
{current_question}

Selected Option:
{selected_option}`]
]); 