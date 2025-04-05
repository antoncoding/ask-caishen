import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// Initialize the LLM - using Opus for better reasoning capabilities
export const llm = new ChatAnthropic({
  modelName: 'claude-3-opus-20240229',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1, // Low temperature for more consistent outputs
});

// Define our output schemas using Zod
export const IntentSchema = z.object({
  intent: z.object({
    type: z.string(),
    details: z.record(z.any())
  }),
  confidence: z.number()
});

export const ActionSchema = z.object({
  action: z.object({
    type: z.string(),
    parameters: z.record(z.any())
  }),
  confidence: z.number()
});

export const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tooltip: z.string().optional()
  }))
});

// Export types based on the schemas
export type IntentAnalysis = z.infer<typeof IntentSchema>;
export type ActionProposal = z.infer<typeof ActionSchema>;
export type NextQuestion = z.infer<typeof QuestionSchema>;

// Create prompt templates with clear system instructions
export const intentAnalysisPrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are Caishen, an expert AI investment advisor analyzing user intent and portfolio context.
Your goal is to understand both their current portfolio state and future goals.

When analyzing intent:
1. First look at their current portfolio composition and identify patterns:
   - Time preferences (e.g. "I notice you have several long-term staking positions")
   - Risk patterns (e.g. "Your portfolio shows a preference for lower-risk lending products")
   - Asset preferences (e.g. "I see you're primarily invested in ETH-based yields")

2. Then frame your questions in context of their current positions:
   - "Given your current focus on staking, would you like to explore more liquid alternatives?"
   - "I notice you have some AMM LP positions. Would you be interested in other types of liquidity provision?"
   - "Your portfolio has a good mix of timeframes. Should we focus on balancing risk instead?"

Example intents with context:
- "User has mostly long-term staking, but wants to explore shorter-term high yields"
- "Portfolio is ETH-heavy, seeking diversification while maintaining similar risk profile"
- "Has stable lending positions, looking to increase yield while keeping similar time commitment"

Always reference their current portfolio state when discussing new options.`],
  ['user', '{portfolio_context}'],
  ['user', '{conversation_history}']
]);

export const actionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Based on the identified intent and current portfolio, propose contextual actions.
Your suggestions should acknowledge their existing positions and preferences.

Example actions with context:
- "Since you already have ETH staking, consider Pendle PT for similar timeframe but different risk profile"
- "To complement your stable lending positions, here's a covered call strategy with similar duration"
- "Given your preference for weekly rebalancing, this AMM LP position would fit your management style"

Frame each suggestion in relation to:
1. Their current portfolio composition
2. Their stated time preferences
3. Their risk tolerance
4. Their past investment behavior`],
  ['user', 'Intent: {intent}\nPortfolio Context: {portfolio_context}']
]);

export const nextQuestionPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Generate contextual questions that reference the user's portfolio and previous answers.
Questions should feel like a natural conversation with an expert who understands their situation.

Examples of contextual questions:
- "I see you have significant ETH staking positions. Would you prefer to:
   a) Keep focusing on long-term yield with similar products
   b) Diversify into shorter-term opportunities while maintaining some exposure"

- "Your portfolio shows a preference for weekly-managed positions. For your next investment, would you be comfortable with:
   a) Daily management for higher yields
   b) Monthly management for more passive returns"

- "Given your current stable lending positions earning 4% APY, what's your target yield for new investments:
   a) Similar range (3-5% APY) with lower risk
   b) Higher range (8-12% APY) with managed risk
   c) Significantly higher (15%+ APY) with proportionally higher risk"

Make questions:
- Reference specific details from their portfolio
- Acknowledge their previous answers
- Provide concrete numbers and comparisons
- Include clear tradeoffs in the options`],
  ['user', 'Current State: {current_state}\nPortfolio Context: {portfolio_context}']
]);

// Create output parsers using JSON format for better structure
export const intentParser = new JsonOutputParser<IntentAnalysis>();
export const actionParser = new JsonOutputParser<ActionProposal>();
export const questionParser = new JsonOutputParser<NextQuestion>();

// Export a function to get LLM instance with different settings if needed
export function getLLM(options?: { 
  model?: 'opus' | 'sonnet', 
  temperature?: number 
}) {
  return new ChatAnthropic({
    modelName: options?.model === 'sonnet' ? 'claude-3-sonnet-latest' : 'claude-3-opus-20240229',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: options?.temperature ?? 0.1,
  });
} 