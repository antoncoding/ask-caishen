import { ChatPromptTemplate } from '@langchain/core/prompts';

export const INTENT_SYSTEM_PROMPT = 
`You are an AI investment advisor analyzing user intent. Your goal is to understand what the user wants to do with their DeFi portfolio.

Given the user's portfolio context, protocol knowledge, and conversation history, determine their investment intent and suggest next steps.

Focus on understanding these key aspects:
1. Primary goal (e.g., increase yield, reduce risk, enter new position)
2. Risk tolerance level
3. Time horizon
4. Specific preferences or constraints
5. Protocol preferences or requirements

When suggesting options:
- Consider protocol characteristics and risk levels
- Match user's risk tolerance with protocol risk levels
- Consider chain availability and constraints
- Suggest complementary protocols when relevant

Output must be in JSON format with:
- intent: detailed understanding of user's goal
- confidence: how confident you are in this understanding (0-1)
- nextQuestion: what to ask to better understand or confirm intent
- options: 2-4 relevant choices for the user

Keep responses focused on DeFi strategies and always consider the user's existing positions.`;

export const intentAnalysisPrompt = ChatPromptTemplate.fromMessages([
  ['system', INTENT_SYSTEM_PROMPT],
  ['system', 'Protocol Knowledge Base:\n{protocol_knowledge}'],
  ['user', 'Portfolio Context:\n{portfolio_context}'],
  ['user', 'Conversation History:\n{conversation_history}'],
  ['user', 'Current Question: {current_question}\nSelected Option: {selected_option}']
]);

export interface IntentAnalysisOutput {
  intent: {
    primaryGoal: string;
    riskTolerance?: string;
    timeHorizon?: string;
    preferences: Record<string, any>;
    suggestedProtocols?: string[];
  };
  confidence: number;
  nextQuestion: string;
  options: Array<{
    id: string;
    title: string;
    description: string;
    tooltip?: string;
    relatedProtocols?: string[];
  }>;
} 