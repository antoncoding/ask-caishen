'use client';

import { useRouter } from 'next/navigation';
import { AIOptionInterface } from '../components/AIOptionInterface';
import { useState, useEffect } from 'react';
import { MotionWrapper } from '@/components/animations/MotionWrapper';
import { SquareLoader } from 'react-spinners';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { usePortfolio } from '../lib/hooks/usePortfolio';
import type { AnalysisResponse, QuestionSchema } from '../lib/ai/prompts/user-profile-analysis';

const initialOptions = [
    {
      id: 'risk_assessment',
      title: 'Portfolio Risk Assessment',
      description: 'Analyze current portfolio risk levels and get recommendations for optimization',
      tooltip: 'Get insights about your portfolio\'s risk exposure and diversification'
    },
    {
      id: 'yield_optimization',
      title: 'Yield Optimization',
      description: 'Find opportunities to improve your portfolio\'s yield while maintaining risk levels',
      tooltip: 'Discover strategies to enhance your portfolio\'s returns'
    },
    {
      id: 'position_management',
      title: 'Position Management',
      description: 'Get advice on managing your current positions and potential adjustments',
      tooltip: 'Recommendations for your existing DeFi positions'
    },
    {
      id: 'new_opportunities',
      title: 'New Opportunities',
      description: 'Explore new DeFi strategies based on your current portfolio',
      tooltip: 'Discover new protocols and strategies that complement your portfolio'
    }
  ];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentInterface() {
  const router = useRouter();
  const { portfolio } = usePortfolio();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);

  // Start the analysis when portfolio is loaded
  useEffect(() => {
    if (portfolio && !currentAnalysis && messages.length === 0) {
      handleStartAnalysis();
    }
  }, [portfolio]);

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          portfolioContext: JSON.stringify(portfolio),
          currentQuestion: undefined,
          selectedOptionId: undefined
        })
      });

      if (!response.ok) throw new Error('Failed to start analysis');
      
      const data: AnalysisResponse = await response.json();
      console.log('Initial Analysis:', data);
      setCurrentAnalysis(data);
    } catch (error) {
      console.error('Error starting analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string, optionText: string) => {
    if (!currentAnalysis?.progress.next_question) return;
    
    setIsLoading(true);
    try {
      // Add user's selection to messages
      const newMessage: Message = {
        role: 'user',
        content: optionText
      };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      const response = await fetch('/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          portfolioContext: JSON.stringify(portfolio),
          currentQuestion: currentAnalysis.progress.next_question.text,
          selectedOptionId: optionId
        })
      });

      if (!response.ok) throw new Error('Failed to process selection');
      
      const data: AnalysisResponse = await response.json();
      console.log('Analysis Update:', data);
      setCurrentAnalysis(data);
    } catch (error) {
      console.error('Error processing selection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MotionWrapper className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-3xl text-primary font-inter">Analyzing Your Request</h1>
        <p className="mb-6 text-xl text-secondary font-inter">
          Preparing personalized recommendations...
        </p>
        <SquareLoader 
          color="#8fa6cb"
          size={40}
        />
      </MotionWrapper>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DeFi Portfolio Analysis</h1>
      
      {/* Progress Section */}
      {currentAnalysis && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Analysis Progress</h2>
            <div className="space-y-2">
              <p>Completed Topics: {currentAnalysis.progress.completed_topics.join(', ') || 'None'}</p>
              <p>Missing Information: {currentAnalysis.progress.missing_information.join(', ')}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${(currentAnalysis.progress.completed_topics.length / 
                      (currentAnalysis.progress.completed_topics.length + 
                       currentAnalysis.progress.missing_information.length)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question Section */}
      {currentAnalysis?.progress.next_question && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">{currentAnalysis.progress.next_question.text}</h2>
            <div className="space-y-2">
              {currentAnalysis.progress.next_question.options?.map((option: { id: string; text: string; description?: string }) => (
                <Button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id, option.text)}
                  className="w-full justify-start text-left p-4 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  <div>
                    <div className="font-medium">{option.text}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500">{option.description}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Complete Section */}
      {currentAnalysis?.progress.is_analysis_complete && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Analysis Complete!</h2>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(currentAnalysis.profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            Analyzing...
          </div>
        </div>
      )}
    </div>
  );
} 