import { ChatAnthropic } from '@langchain/anthropic';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { 
  userProfilePrompt, 
  type UserRiskProfile, 
  type AnalysisResponse,
  type AnalysisProgress,
  RiskProfileSchema, 
  AnalysisProgressSchema,
  AnalysisResponseSchema 
} from '../prompts/user-profile-analysis';
import { z } from 'zod';

// Initialize the LLM
const llm = new ChatAnthropic({
  modelName: 'claude-3-sonnet-20240229',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1
});

// Define the input schema for the analyze profile tool
const analyzeProfileSchema = z.object({
  portfolio_context: z.string(),
  conversation_history: z.string(),
  current_question: z.string(),
  selected_option: z.string()
});

// Create the profile analyzer tool
const analyzeProfile = new DynamicStructuredTool({
  name: 'analyze_user_profile',
  description: 'Analyze user\'s DeFi profile, risk tolerance, and experience',
  schema: analyzeProfileSchema,
  func: async ({ portfolio_context, conversation_history, current_question, selected_option }) => {
    const response = await userProfilePrompt.pipe(llm).invoke({
      portfolio_context,
      conversation_history,
      current_question,
      selected_option
    });

    return response;
  }
});

// Helper function to process conversation and analyze user profile
export async function analyzeUserProfile(
  messages: Array<{ role: string; content: string }>,
  portfolioContext: string,
  currentQuestion?: string,
  selectedOption?: string
): Promise<AnalysisResponse> {
  try {
    const conversationHistory = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const result = await analyzeProfile.invoke({
      portfolio_context: portfolioContext,
      conversation_history: conversationHistory,
      current_question: currentQuestion || '',
      selected_option: selectedOption || ''
    });

    // Parse and validate the response against our schema
    const output = AnalysisResponseSchema.parse(JSON.parse(result));
    return output;
  } catch (error) {
    console.error('Error in user profile analysis:', error);
    throw error;
  }
} 