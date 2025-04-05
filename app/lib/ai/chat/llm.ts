import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// Initialize the LLM
export const llm = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-latest',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1, // Low temperature for more consistent outputs
});

// Define our output schemas using Zod
const intentSchema = z.object({
  intent: z.object({
    type: z.string(),
    details: z.record(z.any())
  }),
  confidence: z.number()
});

const actionSchema = z.object({
  action: z.object({
    type: z.string(),
    parameters: z.record(z.any())
  }),
  confidence: z.number()
});

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tooltip: z.string().optional()
  }))
});

// Export types based on the schemas
export type IntentAnalysis = z.infer<typeof intentSchema>;
export type ActionProposal = z.infer<typeof actionSchema>;
export type NextQuestion = z.infer<typeof questionSchema>;

// Create prompt templates
export const intentAnalysisPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are an AI investment advisor analyzing user intent. Given the portfolio context and conversation history, determine the user\'s investment intent.'],
  ['user', '{portfolio_context}'],
  ['user', '{conversation_history}']
]);

export const actionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'Based on the identified intent, propose a specific action with parameters.'],
  ['user', 'Intent: {intent}\nPortfolio Context: {portfolio_context}']
]);

export const nextQuestionPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'Generate the next question and options to help clarify the user\'s intent or confirm the proposed action.'],
  ['user', 'Current State: {current_state}\nPortfolio Context: {portfolio_context}']
]);

// Create output parsers
export const intentParser = new JsonOutputParser<IntentAnalysis>();
export const actionParser = new JsonOutputParser<ActionProposal>();
export const questionParser = new JsonOutputParser<NextQuestion>(); 