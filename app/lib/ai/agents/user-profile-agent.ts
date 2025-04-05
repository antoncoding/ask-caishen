import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { 
  type AnalysisResponse,
  AnalysisResponseSchema,
} from '../prompts/user-profile-analysis';
import { generateInstrumentSummaries } from '../prompts/intent-analysis';
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
    // Get instrument summaries for context
    const instrumentSummaries = generateInstrumentSummaries();
    
    // Return a detailed context string that the agent can use
    return `Investment Context:
${instrumentSummaries}

Portfolio Context:
${portfolio_context}

Conversation History:
${conversation_history}

Current Question: ${current_question}
User Selected: ${selected_option}`;
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
    
You must follow the sequence and make sure you get all the information about the following aspects:
* You must return the "next question" to ask the user, until all the information is collected
* You must return the "next question" to ask the user, until all the information is collected

1. Topic 1: Understand if they want to increase yield or reduce risk

2. Topic 2: Ask about their time preference. 
    - The purpose of this question is to understand how long the user wants to hold the instrument, also how often do they interact on chain
    - Potential options should be:
        - "Short Term (1-3 months)"
        - "Medium Term (3-12 months)"
        - "Long Term (1+ years)"

3. Question 3: Ask about risk tolerance. 
    - The purpose of this question is to understand how much smart contract risk, liquidity risk, counterparty risk the user is willing to take.
    - Example options:
        - "I'm ok with high risk, as long as the yield is high"
        - "I'm ok with moderate risk, as long as the yield is moderate"
        - "I'm want low risk instruments"
        - "I'm ok with some of my portfolio having exposure to new tokens'
        - "I'm ok with new tokens, but smart contract risk has to be minimized'

4. Question 4: Ask about target returns
    - The purpose of this question is to understand the user's yield expectations
    - Example options:
        - "3-5% (Very stable)"
        - "5-10% (Balanced)"
        - "10%+ (Growth focused)"

When suggesting instruments:
- Use the provided instrument summaries to match user preferences
- Consider both passive and active management requirements
- Match risk levels with user's risk appetite
- Consider APY ranges and user's yield expectations
- Factor in the pros and cons of each instrument
- Explain key risks and how they align with user's profile

Only after collecting ALL this information:
- Analyze their preferences
- Match with suitable instruments using the detailed summaries
- Provide detailed recommendations with clear reasoning
- Include specific risk metrics and management requirements

The response must follow the exact schema structure with all required fields.
Do not skip questions or provide final recommendations until all questions are answered.


When asking the questions, you must consider the existing portfolio context and decide the language use: for more advanced users who has lots of DeFi activities, you should use more technical terms, for beginners, you should use more simple terms.
`,
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