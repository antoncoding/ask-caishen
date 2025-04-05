'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SquareLoader } from 'react-spinners';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useStoredPortfolioSummary } from '../../src/hooks/useStoredPortfolioSummary';
import type { AnalysisResponse, InstrumentType } from '../lib/ai/prompts/user-profile-analysis';
import { Progress } from '@nextui-org/react';
import { 
  TrendingUp, Shield, Wallet, LineChart, Clock, 
  BarChart3, ArrowUpRight, Lock, Unlock, Scale,
  AlertCircle, CheckCircle2
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Initial options for starting the conversation
const INITIAL_QUESTION = {
  id: 'investment_goal',
  text: "What's your primary investment goal for your DeFi portfolio?",
  type: 'single_choice' as const,
  options: [
    {
      id: 'YIELD_OPTIMIZATION',
      text: 'Optimize Yield',
      description: 'Find better yield opportunities while maintaining your risk profile'
    },
    {
      id: 'RISK_REDUCTION',
      text: 'Reduce Risk',
      description: 'Optimize portfolio for better risk-adjusted returns'
    },
  ]
};

export default function AgentInterface() {
  const router = useRouter();
  const { portfolioSummary } = useStoredPortfolioSummary()
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start with initial question when portfolio is loaded
  useEffect(() => {
    if (portfolioSummary && !currentAnalysis && messages.length === 0) {
      setCurrentAnalysis({
        preferences: {
          acceptable_instruments: [],
          time_preference: 'FLEXIBLE',
          risk_appetite: 'MODERATE',
          trusted_assets: [],
          yield_expectations: {
            minimum_acceptable: 0,
            target: 0,
            maximum_risk_adjusted: 0
          },
          trust_preferences: {
            trust_risk_curators: false,
            trusted_curators: [],
            preferred_auditors: []
          }
        },
        portfolio: {
          current_instruments: [],
          risk_metrics: {
            concentration_risk: 0,
            impermanent_loss_risk: 0,
            smart_contract_risk: 0,
            market_risk: 0
          },
          opportunities: []
        },
        progress: {
          completed_topics: [],
          missing_information: ['investment_goal'],
          confidence_levels: {
            time_preference: 0,
            risk_appetite: 0,
            yield_expectations: 0,
            trust_preferences: 0
          },
          is_analysis_complete: false,
          conversation: {
            response: "Welcome! I'll help you optimize your DeFi portfolio. Let's start by understanding your investment goals.",
            personality_traits: ["welcoming", "professional"],
            context_awareness: ["new analysis session", "ready to explore"]
          },
          next_question: INITIAL_QUESTION
        }
      });
    }
  }, [portfolioSummary]);

  const handleOptionSelect = async (optionId: string, optionText: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
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
          portfolioContext: typeof portfolioSummary === 'string' ? portfolioSummary : JSON.stringify(portfolioSummary),
          currentQuestion: currentAnalysis?.progress.next_question?.text || INITIAL_QUESTION.text,
          selectedOptionId: optionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to process selection');
      }
      
      const data: AnalysisResponse = await response.json();
      setCurrentAnalysis(data);

      if (data?.progress?.next_question?.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.progress.next_question?.text || ''
        }]);
      }
    } catch (error) {
      console.error('Error processing selection:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getInstrumentIcon = (type: string) => {
    switch (type) {
      case 'AMM_LP': return <BarChart3 className="w-5 h-5" />;
      case 'STABLE_LENDING': return <Shield className="w-5 h-5" />;
      case 'ETH_LENDING': return <Wallet className="w-5 h-5" />;
      case 'ETH_STAKING': return <Lock className="w-5 h-5" />;
      case 'PENDLE_PT': return <Clock className="w-5 h-5" />;
      case 'PENDLE_YT': return <TrendingUp className="w-5 h-5" />;
      case 'PENDLE_LP': return <BarChart3 className="w-5 h-5" />;
      case 'BORROW': return <ArrowUpRight className="w-5 h-5" />;
      case 'LONG_CALL_OPTION': return <ArrowUpRight className="w-5 h-5" />;
      case 'LONG_PUT_OPTION': return <Shield className="w-5 h-5" />;
      case 'COVERED_CALL': return <Lock className="w-5 h-5" />;
      case 'SHORT_PUT': return <Unlock className="w-5 h-5" />;
      case 'PERP_LONG': return <Scale className="w-5 h-5" />;
      // Analysis categories
      case 'time_preference': return <Clock className="w-5 h-5" />;
      case 'risk_appetite': return <Shield className="w-5 h-5" />;
      case 'yield_expectations': return <TrendingUp className="w-5 h-5" />;
      case 'trust_preferences': return <Lock className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-inter text-foreground mb-8">DeFi Portfolio Analysis</h1>
        
        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-inter">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Analysis Progress Dashboard */}
        {currentAnalysis && (
          <div className="space-y-6">
            {/* AI Response */}
            {currentAnalysis.progress.conversation && (
              <Card className="border-none bg-card/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full mt-1">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1 flex-grow">
                      <p className="text-lg text-foreground font-inter leading-relaxed">
                        {currentAnalysis.progress.conversation.response}
                      </p>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {currentAnalysis.progress.conversation.context_awareness.map((context, idx) => (
                          <span key={idx} 
                                className="text-xs bg-muted/30 text-muted-foreground px-2 py-1 rounded-full">
                            {context}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Question */}
            {currentAnalysis.progress.next_question && (
              <Card className="border-none bg-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-inter mb-4 text-foreground">
                    {currentAnalysis.progress.next_question.text}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAnalysis.progress.next_question.options?.map((option) => (
                      <Button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id, option.text)}
                        className="w-full p-6 h-auto flex flex-col items-start gap-2 
                                 bg-card/40 hover:bg-card/60
                                 backdrop-blur-sm transition-all duration-200
                                 border border-border"
                      >
                        <span className="text-lg font-inter text-foreground">
                          {option.text}
                        </span>
                        {option.description && (
                          <span className="text-sm text-muted-foreground font-inter">
                            {option.description}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Opportunities */}
            {currentAnalysis.portfolio.opportunities.length > 0 && (
              <Card className="border-none bg-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-inter mb-4 text-foreground flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                    Current Suggestions
                  </h2>
                  <div className="space-y-3">
                    {currentAnalysis.portfolio.opportunities.map((opportunity, idx) => (
                      <div key={idx} 
                           className="bg-card/40 backdrop-blur-sm rounded-xl p-4 
                                    border border-border shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/5 rounded-lg">
                            {getInstrumentIcon(opportunity.instrument_type)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-inter text-foreground">
                                {opportunity.instrument_type.replace(/_/g, ' ')}
                              </h3>
                              <div className="text-right">
                                <p className="text-lg font-inter text-primary">
                                  {opportunity.estimated_apy.toFixed(2)}% APY
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {opportunity.time_preference.replace(/_/g, ' ').toLowerCase()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {opportunity.reason}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {opportunity.risk_level}
                              </span>
                              <span className="text-xs bg-muted/30 text-muted-foreground px-2 py-1 rounded-full">
                                {opportunity.time_preference}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Metrics */}
            <Card className="border-none bg-card">
              <CardContent className="p-6 space-y-6">
                {/* Current Portfolio */}
                {currentAnalysis.portfolio.current_instruments.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-inter text-foreground flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      Current Portfolio
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {currentAnalysis.portfolio.current_instruments.map((instrument, idx) => (
                        <div key={idx} 
                             className="bg-card/40 backdrop-blur-sm rounded-lg p-3 
                                      border border-border shadow-sm">
                          <div className="flex items-center gap-2">
                            {getInstrumentIcon(instrument.type)}
                            <div>
                              <h3 className="text-sm font-inter text-foreground">
                                {instrument.type.replace(/_/g, ' ')}
                              </h3>
                              {instrument.apy && (
                                <p className="text-xs text-muted-foreground">
                                  APY: {instrument.apy.toFixed(2)}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Metrics */}
                <div className="space-y-2">
                  <h2 className="text-xl font-inter text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-warning" />
                    Risk Analysis
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(currentAnalysis.portfolio.risk_metrics).map(([key, value]) => (
                      <div key={key} 
                           className="bg-card/40 backdrop-blur-sm rounded-lg p-3 
                                    border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {getInstrumentIcon(key)}
                          <h3 className="text-sm font-inter capitalize text-muted-foreground">
                            {key.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={value * 100}
                            color={value > 0.7 ? "danger" : value > 0.4 ? "warning" : "success"}
                            className="h-1.5 flex-grow"
                            showValueLabel={false}
                          />
                          <span className="text-xs font-medium text-foreground w-8 text-right">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm 
                        flex items-center justify-center z-50">
            <Card className="border-none bg-card/40">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <h3 className="text-lg font-inter text-foreground">
                  Eve is thinking...
                </h3>
                <SquareLoader color="currentColor" size={30} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 