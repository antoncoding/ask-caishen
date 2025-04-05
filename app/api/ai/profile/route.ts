import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserProfile } from '../../../lib/ai/agents/user-profile-agent';
import type { AnalysisResponse } from '../../../lib/ai/prompts/user-profile-analysis';

export async function POST(req: NextRequest) {
  try {
    console.log('\n=== Profile Analysis API Called ===');
    
    const body = await req.json();
    const { messages, portfolioContext, currentQuestion, selectedOptionId } = body;

    console.log('Request Body:', {
      messagesCount: messages?.length || 0,
      hasPortfolioContext: !!portfolioContext,
      currentQuestion,
      selectedOptionId
    });

    // Analyze user profile using our specialized agent
    const result = await analyzeUserProfile(
      messages || [],
      portfolioContext || '',
      currentQuestion,
      selectedOptionId
    );

    console.log('\n=== Profile Analysis Response ===');
    console.log('Analysis Complete:', result.progress.is_analysis_complete);
    console.log('Completed Topics:', result.progress.completed_topics);
    console.log('Next Question:', result.progress.next_question?.text);

    console.log('Response:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);

  } catch (error) {
    console.error('\n=== Error in Profile Analysis API ===');
    console.error(error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 