import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Define the schema for the next question
export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['multiple_choice', 'single_choice', 'boolean']),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    description: z.string().optional()
  })).optional()
});

// Define the analysis progress schema
export const AnalysisProgressSchema = z.object({
  completed_topics: z.array(z.string()),
  missing_information: z.array(z.string()),
  confidence_levels: z.record(z.number()),
  is_analysis_complete: z.boolean(),
  next_question: QuestionSchema.optional()
});

// Define the schema for risk tolerance analysis
export const RiskProfileSchema = z.object({
  defi_expertise: z.object({
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    understanding: z.string(),
    key_experiences: z.array(z.string())
  }).optional(),
  risk_tolerance: z.object({
    token_risk: z.object({
      level: z.enum(['conservative', 'moderate', 'aggressive']),
      preferences: z.string(),
      acceptable_tokens: z.array(z.string())
    }).optional(),
    protocol_risk: z.object({
      level: z.enum(['conservative', 'moderate', 'aggressive']),
      preferences: z.string(),
      protocol_preferences: z.array(z.string())
    }).optional(),
    overall_assessment: z.string().optional()
  }).optional(),
  portfolio_analysis: z.object({
    current_exposure: z.string(),
    diversification: z.string(),
    risk_concentration: z.string()
  }).optional(),
  derivatives_profile: z.object({
    experience_level: z.enum(['none', 'basic', 'intermediate', 'advanced']),
    usage_patterns: z.string(),
    hedging_preferences: z.string(),
    acceptable_instruments: z.array(z.string())
  }).optional()
});

// Combined response type for each analysis step
export const AnalysisResponseSchema = z.object({
  profile: RiskProfileSchema,
  progress: AnalysisProgressSchema
});

export type UserRiskProfile = z.infer<typeof RiskProfileSchema>;
export type AnalysisProgress = z.infer<typeof AnalysisProgressSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

// Initial questions for each topic
export const INITIAL_QUESTIONS = {
  defi_expertise: {
    id: 'initial_defi_experience',
    text: 'How would you describe your experience with DeFi?',
    type: 'single_choice' as const,
    options: [
      { id: 'beginner', text: 'Beginner - Just starting out with DeFi', description: 'Basic understanding of wallets and simple swaps' },
      { id: 'intermediate', text: 'Intermediate - Comfortable with common protocols', description: 'Experience with lending and basic yield farming' },
      { id: 'advanced', text: 'Advanced - Deep DeFi experience', description: 'Comfortable with complex strategies and multiple protocols' },
      { id: 'expert', text: 'Expert - Professional DeFi user', description: 'Deep understanding of DeFi mechanics and risk management' }
    ]
  },
  risk_tolerance: {
    id: 'initial_risk_preference',
    text: 'What best describes your approach to DeFi risks?',
    type: 'single_choice' as const,
    options: [
      { id: 'conservative', text: 'Conservative - Prefer established protocols', description: 'Focus on safety and proven track record' },
      { id: 'moderate', text: 'Moderate - Balance of risk and reward', description: 'Open to newer protocols with good security' },
      { id: 'aggressive', text: 'Aggressive - Comfortable with high risk', description: 'Willing to try new protocols for higher yields' },
      { id: 'unknown', text: 'I\'m not sure yet', description: 'Need more information to decide' }
    ]
  }
};

export const userProfilePrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an expert DeFi advisor conducting a step-by-step analysis of a user's DeFi profile and risk tolerance.

Your goal is to gather information systematically about the user's DeFi engagement. Focus on one aspect at a time:

1. DeFi Expertise Assessment:
   - Understanding of DeFi concepts
   - Experience with different protocols
   - Technical knowledge

2. Risk Tolerance Analysis:
   - Token Risk: Comfort with different token types
   - Protocol Risk: Willingness to use new protocols
   - Overall Risk Profile

3. Portfolio Analysis:
   - Current positions and exposure
   - Diversification and concentration
   - Vulnerabilities

4. Derivatives Usage:
   - Experience with perpetuals/options
   - Hedging strategies
   - Comfort with instruments

For each interaction:
1. Analyze the current conversation and portfolio context
2. Determine which aspects still need information
3. Generate a specific, focused question to gather missing information
4. Update the profile with any new information learned
5. Track progress and confidence in each area

Return:
1. The current profile (partial or complete)
2. Progress tracking (completed topics, missing info, confidence levels)
3. Next question (if analysis is not complete)

Make questions simple and focused. Use multiple choice, single choice, or boolean questions that are easy to answer.
Avoid open-ended questions. Each question should target a specific aspect of the profile.

IMPORTANT: Log all key decisions and reasoning in your response for debugging.`],
  ['user', `Portfolio Context:
{portfolio_context}

Conversation History:
{conversation_history}

Current Question:
{current_question}

Selected Option:
{selected_option}`]
]); 