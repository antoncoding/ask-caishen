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
    prompt: `You are an expert DeFi advisor helping users find the optimal investment instruments for their goals.
    
You must follow this exact conversation sequence:
1. First Question (Already Asked): Understand if they want to increase yield or reduce risk
2. Second Question: Ask about their time preference
   - For yield-focused: "How long can you commit your capital?"
   - For risk-focused: "What's your preferred investment duration?"
   Options should be:
   - "Short Term (1-3 months)"
   - "Medium Term (3-12 months)"
   - "Long Term (1+ years)"

3. Third Question: Ask about risk tolerance
   - For yield-focused: "What's your acceptable risk level for higher yields?"
   - For risk-focused: "How conservative should we be with your portfolio?"
   Options should be:
   - "Conservative (Established protocols, lower yields)"
   - "Moderate (Mix of established and newer protocols)"
   - "Aggressive (Newer protocols, higher yields)"

4. Final Question: Ask about target returns
   - For yield-focused: "What's your target annual yield?"
   - For risk-focused: "What's your minimum acceptable yield?"
   Options should be:
   - "3-5% (Very stable)"
   - "5-10% (Balanced)"
   - "10%+ (Growth focused)"

Only after collecting ALL this information:
- Analyze their preferences
- Match with suitable instruments
- Provide detailed recommendations
- Include specific risk metrics

The response must follow the exact schema structure with all required fields.
Do not skip questions or provide final recommendations until all questions are answered.`,
    schema: AnalysisResponseSchema
  }
});

// Helper function to process conversation and analyze user profile
export async function analyzeUserProfile(
  messages: Array<{ role: string; content: string }>,
  portfolioContext: string,
  currentQuestion?: string,
  selectedOption?: string,
  customInput?: string
): Promise<AnalysisResponse> {
  try {
    const conversationHistory = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Track conversation progress
    const questionSequence = ['investment_goal', 'time_preference', 'risk_tolerance', 'target_returns'];
    const currentProgress = messages.length / 2; // Each Q&A is 2 messages

    const response = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Analyze this DeFi profile:
Portfolio Context: ${portfolioContext}

Conversation History: ${conversationHistory}

Current Question: ${currentQuestion || ''}
Selected Option: ${selectedOption || ''} ${customInput ? `Custom Input: ${customInput}` : ''}

Current Progress: ${currentProgress} out of 4 questions
Questions Remaining: ${Math.max(0, 4 - currentProgress)}
Next Topic: ${questionSequence[currentProgress] || 'final_recommendations'}

Note: The user's response ${selectedOption?.startsWith('In response to') ? 'was a custom detailed input' : 'was a predefined option'}. Please analyze accordingly.`
        }
      ]
    });

    // Ensure we don't complete analysis too early
    const analysisResponse = response.structuredResponse as AnalysisResponse;
    if (currentProgress < 4) {
      analysisResponse.progress.is_analysis_complete = false;
    }

    return analysisResponse;
  } catch (error) {
    console.error('Error in user profile analysis:', error);
    throw error;
  }
} 