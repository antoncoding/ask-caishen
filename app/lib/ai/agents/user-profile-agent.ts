import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { 
  type AnalysisResponse,
  AnalysisResponseSchema,
} from '../prompts/user-profile-analysis';
import { z } from 'zod';

// Initialize the LLM
const llm = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-latest',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.1
});

// Create the analyze profile tool
const analyzeProfileTool = tool(
  async ({ portfolio_context, conversation_history, current_question, selected_option }): Promise<string> => {
    // Return a simple string that the agent can use to build its response
    return `Based on the portfolio context: ${portfolio_context}\n` +
           `And conversation history: ${conversation_history}\n` +
           `Current question was: ${current_question}\n` +
           `User selected: ${selected_option}`;
  },
  {
    name: "analyze_portfolio",
    description: "Use this to analyze the user's portfolio and conversation context",
    schema: z.object({
      portfolio_context: z.string().describe("The user's portfolio information"),
      conversation_history: z.string().describe("The conversation history"),
      current_question: z.string().describe("The current question being asked"),
      selected_option: z.string().describe("The option selected by the user")
    })
  }
);

// Create the agent with structured output
const agent = createReactAgent({
  llm,
  tools: [analyzeProfileTool],
  responseFormat: {
    prompt: `You are an expert DeFi advisor conducting a step-by-step analysis of a user's DeFi profile and risk tolerance.
    
Your goal is to gather information systematically about the user's DeFi engagement, focusing on:
1. DeFi Expertise Assessment
2. Risk Tolerance
3. Portfolio Analysis
4. Derivatives Usage

Make questions simple and focused. Use multiple choice or single choice questions that are easy to answer.
Avoid open-ended questions. Each question should target a specific aspect of the profile.

The response must follow the exact schema structure with all required fields.`,
    schema: AnalysisResponseSchema
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

    const response = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Analyze this DeFi profile:\n\nPortfolio Context: ${portfolioContext}\n\nConversation History: ${conversationHistory}\n\nCurrent Question: ${currentQuestion || ''}\n\nSelected Option: ${selectedOption || ''}`
        }
      ]
    });

    return response.structuredResponse as AnalysisResponse;
  } catch (error) {
    console.error('Error in user profile analysis:', error);
    throw error;
  }
} 