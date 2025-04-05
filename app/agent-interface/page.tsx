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
  AlertCircle, CheckCircle2,
  BrainIcon
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Initial options for starting the conversation
const INITIAL_QUESTION = {
  id: 'investment_goal',
  text: "What's your primary goal for your portfolio?",
  type: 'single_choice' as const,
  options: [
    {
      id: 'YIELD_FOCUSED',
      text: 'Increase Yield',
      description: 'Find opportunities to enhance returns while managing risk'
    },
    {
      id: 'RISK_FOCUSED',
      text: 'Reduce Risk',
      description: 'Optimize for better risk-adjusted returns and portfolio stability'
    }
  ]
};

export default function AgentInterface() {
  const router = useRouter();
  const { portfolioSummary } = useStoredPortfolioSummary()
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

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
            reasoning: "Initial portfolio loaded, let's start by understanding user's investment goals.",
            response: "Welcome! I'll help you optimize your DeFi portfolio. Let's start by understanding your investment goals.",
            context_awareness: ["new analysis session", "ready to explore"]
          },
          next_question: INITIAL_QUESTION
        }
      });
    }
  }, [portfolioSummary]);

  const handleInstrumentSelect = async (instrumentType: string) => {
    setSelectedInstrument(instrumentType);
    // Navigate to transaction composition page with the selected instrument
    router.push(`/compose-transaction?instrument=${instrumentType}`);
  };

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
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-background to-background/80 dark:from-gray-900 dark:to-gray-900/90">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-inter text-foreground dark:text-gray-100 mb-8">Talk to Vennett</h1>
        
        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 dark:bg-gray-800/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive dark:text-red-400">
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
              <Card className="border-none bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full mt-1">
                      <BrainIcon className="w-6 h-6 text-primary dark:text-primary/80" />
                    </div>
                    <div className="space-y-1 flex-grow">
                      <p className="text-sm text-foreground dark:text-gray-200 font-inter leading-relaxed">
                        {currentAnalysis.progress.conversation.reasoning}
                      </p>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {currentAnalysis.progress.conversation.context_awareness.map((context, idx) => (
                          <span key={idx} 
                                className="text-xs bg-muted/50 dark:bg-gray-700 text-muted-foreground dark:text-gray-300 px-2 py-1 rounded-full">
                            {context}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Question - Only show if no instrument is selected */}
            {!selectedInstrument && currentAnalysis.progress.next_question && (
              <Card className="border-none bg-background/50 dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-inter mb-4 text-foreground dark:text-gray-100 p-2">
                    {currentAnalysis.progress.next_question.text}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAnalysis.progress.next_question.options?.map((option) => (
                      <Button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id, option.text)}
                        className="w-full p-8 h-auto flex flex-col items-start gap-2 
                                 bg-background/50 dark:bg-gray-800/50 hover:bg-background/70 dark:hover:bg-gray-700/50
                                 backdrop-blur-sm transition-all duration-200
                                 border border-border/30 dark:border-gray-700/50"
                      >
                        <span className="text-base font-inter text-foreground dark:text-gray-200 p-4 pb-2">
                          {option.text}
                        </span>
                        {option.description && (
                          <span className="text-sm text-muted-foreground dark:text-gray-400 font-inter">
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
              <Card className="border-none bg-background/50 dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-inter mb-4 text-foreground dark:text-gray-100 flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-primary dark:text-primary/80" />
                    Suggested Instruments
                  </h2>
                  <div className="space-y-3">
                    {currentAnalysis.portfolio.opportunities.map((opportunity, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleInstrumentSelect(opportunity.instrument_type)}
                        className="w-full text-left hover:scale-[1.02] transition-transform duration-200"
                      >
                        <div className="bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 
                                    border border-border/30 dark:border-gray-700/50 shadow-sm dark:shadow-none">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/5 dark:bg-gray-700 rounded-lg">
                              {getInstrumentIcon(opportunity.instrument_type)}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-inter text-foreground dark:text-gray-200">
                                  {opportunity.instrument_type.replace(/_/g, ' ')}
                                </h3>
                                <div className="text-right">
                                  <p className="text-lg font-inter text-primary dark:text-primary/80">
                                    {opportunity.estimated_apy.toFixed(2)}% APY
                                  </p>
                                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    {opportunity.time_preference.replace(/_/g, ' ').toLowerCase()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                                {opportunity.reason}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/80 px-2 py-1 rounded-full">
                                  {opportunity.risk_level}
                                </span>
                                <span className="text-xs bg-muted/30 dark:bg-gray-700 text-muted-foreground dark:text-gray-300 px-2 py-1 rounded-full">
                                  {opportunity.time_preference}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Metrics */}
            <Card className="border-none bg-background/50 dark:bg-gray-800/50">
              <CardContent className="p-6 space-y-6">
                {/* Current Portfolio */}
                {currentAnalysis.portfolio.current_instruments.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-inter text-foreground dark:text-gray-100 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary dark:text-primary/80" />
                      Current Portfolio
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {currentAnalysis.portfolio.current_instruments.map((instrument, idx) => (
                        <div key={idx} 
                             className="bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 
                                      border border-border/30 dark:border-gray-700/50 shadow-sm dark:shadow-none">
                          <div className="flex items-center gap-2">
                            {getInstrumentIcon(instrument.type)}
                            <div>
                              <h3 className="text-sm font-inter text-foreground dark:text-gray-200">
                                {instrument.type.replace(/_/g, ' ')}
                              </h3>
                              {instrument.apy && (
                                <p className="text-xs text-muted-foreground dark:text-gray-400">
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
                  <h2 className="text-xl font-inter text-foreground dark:text-gray-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-warning dark:text-warning/80" />
                    Risk Analysis
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(currentAnalysis.portfolio.risk_metrics).map(([key, value]) => (
                      <div key={key} 
                           className="bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 
                                    border border-border/30 dark:border-gray-700/50 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-2 mb-2">
                          {getInstrumentIcon(key)}
                          <h3 className="text-sm font-inter capitalize text-muted-foreground dark:text-gray-400">
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
                          <span className="text-xs font-medium text-foreground dark:text-gray-200 w-8 text-right">
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
          <div className="fixed inset-0 bg-background/80 dark:bg-gray-900/90 backdrop-blur-sm 
                        flex items-center justify-center z-50">
            <Card className="border-none bg-background/50 dark:bg-gray-800/50">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <h3 className="text-lg font-inter text-foreground dark:text-gray-200">
                Vennett is thinking...
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