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
  ['system', `You are Eve, an expert AI investment advisor analyzing user intent. 
Given the portfolio context and conversation history, determine the user's investment intent.
Focus on understanding their core goals and constraints.

Example intents:
- Yield optimization with specific risk tolerance
- Risk reduction while maintaining minimum returns
- Portfolio rebalancing for better risk-adjusted returns`],
  ['user', '{portfolio_context}'],
  ['user', '{conversation_history}']
]);

export const actionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Based on the identified intent, propose a specific action with parameters.
Actions should be concrete and executable, with clear parameters.

Example actions:
- Deposit into specific yield strategies
- Adjust position sizes for better risk distribution
- Enter/exit specific instruments based on goals`],
  ['user', 'Intent: {intent}\nPortfolio Context: {portfolio_context}']
]);

export const nextQuestionPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Generate the next question and options to help clarify the user's intent or confirm the proposed action.
Questions should be:
- Clear and focused
- Have specific, actionable options
- Include helpful descriptions and tooltips where needed
- Progress logically based on previous answers`],
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