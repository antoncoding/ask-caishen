import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// Initialize the LLM
export const llm = new ChatAnthropic({
  modelName: 'claude-3-opus-20240229',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1, // Low temperature for more consistent outputs
});

// Define our output schemas using Zod
export const IntentAnalysisSchema = z.object({
  intent: z.object({
    type: z.string(),
    details: z.record(z.any())
  }),
  confidence: z.number()
});

export const ActionProposalSchema = z.object({
  action: z.object({
    type: z.string(),
    parameters: z.record(z.any())
  }),
  confidence: z.number()
});

export const NextQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tooltip: z.string().optional()
  }))
});

export type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;
export type ActionProposal = z.infer<typeof ActionProposalSchema>;
export type NextQuestion = z.infer<typeof NextQuestionSchema>;

// Create prompt templates with format instructions for structured output
export const intentAnalysisPrompt = ChatPromptTemplate.fromMessages([
  ['system', `You are an AI investment advisor analyzing user intent. Given the portfolio context and conversation history, determine the user's investment intent.

Format instructions: {format_instructions}`],
  ['user', '{portfolio_context}'],
  ['user', '{conversation_history}']
]);

export const actionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Based on the identified intent, propose a specific action with parameters.

Format instructions: {format_instructions}`],
  ['user', 'Intent: {intent}\nPortfolio Context: {portfolio_context}']
]);

export const nextQuestionPrompt = ChatPromptTemplate.fromMessages([
  ['system', `Generate the next question and options to help clarify the user's intent or confirm the proposed action.

Format instructions: {format_instructions}`],
  ['user', 'Current State: {current_state}\nPortfolio Context: {portfolio_context}']
]);

// Create output parsers using Zod schemas
export const intentParser = StructuredOutputParser.fromZodSchema(IntentAnalysisSchema);
export const actionParser = StructuredOutputParser.fromZodSchema(ActionProposalSchema);
export const questionParser = StructuredOutputParser.fromZodSchema(NextQuestionSchema); 