'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SquareLoader } from 'react-spinners';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStoredPortfolioSummary } from '../../src/hooks/useStoredPortfolioSummary';
import type { AnalysisResponse } from '../lib/ai/prompts/user-profile-analysis';
import { INSTRUMENT_DEFINITIONS, InstrumentKey } from '../lib/ai/prompts/instrument-definitions';
import { Progress } from '@nextui-org/react';
import Image from 'next/image';
import { 
  TrendingUp, Shield, Wallet, LineChart, Clock, 
  BarChart3, ArrowUpRight, Lock, Unlock, Scale,
  AlertCircle, CheckCircle2, BrainIcon,
  SendHorizontal, X, ExternalLink
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
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomInputMode, setIsCustomInputMode] = useState(false);

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

  const handleInstrumentSelect = async (instrumentType: InstrumentKey) => {
    const instrument = INSTRUMENT_DEFINITIONS[instrumentType];
    if (instrument?.url) {
      window.open(instrument.url, '_blank');
    }
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
          selectedOptionId: optionId,
          customInput: optionId === 'CUSTOM_INPUT' ? optionText : undefined
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

  const handleCustomSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;
    
    const currentQuestion = currentAnalysis?.progress.next_question?.text || '';
    const formattedResponse = `In response to "${currentQuestion}": ${customInput}`;
    
    await handleOptionSelect('CUSTOM_INPUT', formattedResponse);
    setCustomInput('');
    setIsCustomInputMode(false);
  };

  const getInstrumentIcon = (type: string) => {
    switch (type) {
      case 'AMM_LP': return <BarChart3 className="w-5 h-5" />;
      case 'STABLE_LP': return <Shield className="w-5 h-5" />;
      case 'STABLE_LENDING': return <Wallet className="w-5 h-5" />;
      case 'LST_LENDING': return <Lock className="w-5 h-5" />;
      case 'ETH_STAKING': return <Lock className="w-5 h-5" />;
      case 'PENDLE_PT': return <Clock className="w-5 h-5" />;
      case 'PENDLE_YT': return <TrendingUp className="w-5 h-5" />;
      case 'PENDLE_LP': return <BarChart3 className="w-5 h-5" />;
      case 'BORROWING': return <ArrowUpRight className="w-5 h-5" />;
      case 'LONG_CALL_OPTION': return <ArrowUpRight className="w-5 h-5" />;
      case 'LONG_PUT_OPTION': return <Shield className="w-5 h-5" />;
      case 'COVERED_CALL': return <Lock className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getHighRiskMetrics = (riskMetrics: any) => {
    return Object.entries(riskMetrics)
      .filter(([_, level]) => level === 'HIGH')
      .map(([metric]) => metric);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-background to-background/80 dark:from-gray-900 dark:to-gray-900/90">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-8">
         
          <h1 className="text-3xl font-inter text-foreground dark:text-gray-100">Ask Caishen</h1>
        </div>
        
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
                    <div className="relative w-10 h-10">
                      <Image
                        src="/images/logo.png"
                        alt="Caishen"
                        fill
                        className="object-contain"
                      />
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
                <CardContent className="p-2">
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
                        <span className="text-base font-inter text-foreground dark:text-gray-200 py-2">
                          {option.text}
                        </span>
                        {option.description && (
                          <span className="text-sm text-muted-foreground text-gray-500 dark:text-gray-400 font-inter">
                            {option.description}
                          </span>
                        )}
                      </Button>
                    ))}
                    
                    {/* Custom Input Option - Only show after initial question */}
                    {currentAnalysis.progress.completed_topics.length > 0 && (
                      <>
                        {isCustomInputMode ? (
                          <div className="w-full p-4 bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm 
                                        border border-border/30 dark:border-gray-700/50 rounded-lg">
                            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={customInput}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                                  placeholder="Type your custom response..."
                                  className="flex-1"
                                />
                                <Button 
                                  type="submit"
                                  size="icon"
                                  disabled={!customInput.trim()}
                                  className="shrink-0"
                                >
                                  <SendHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Send message</span>
                                </Button>
                                <Button 
                                  onClick={() => {
                                    setIsCustomInputMode(false);
                                    setCustomInput('');
                                  }}
                                  size="icon"
                                  type="button"
                                  className="shrink-0"
                                  variant="ghost"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Cancel</span>
                                </Button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setIsCustomInputMode(true)}
                            className="w-full p-8 h-auto flex flex-col items-start gap-2 
                                     bg-background/50 dark:bg-gray-800/50 hover:bg-background/70 dark:hover:bg-gray-700/50
                                     backdrop-blur-sm transition-all duration-200
                                     border border-border/30 dark:border-gray-700/50"
                            variant="ghost"
                          >
                            <span className="text-base font-inter text-foreground dark:text-gray-200 p-4 pb-2">
                              Custom Response
                            </span>
                            <span className="text-sm text-muted-foreground text-gray-500 dark:text-gray-400 font-inter">
                              Type your own detailed response
                            </span>
                          </Button>
                        )}
                      </>
                    )}
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
                    {currentAnalysis.portfolio.opportunities.map((opportunity, idx) => {
                      const instrumentDef = INSTRUMENT_DEFINITIONS[opportunity.instrument_type as InstrumentKey];
                      if (!instrumentDef) return null;

                      const faviconUrl = instrumentDef.url ? getFaviconUrl(instrumentDef.url) : null;
                      const highRisks = getHighRiskMetrics(instrumentDef.riskMetrics);

                      return (
                        <button
                          key={idx}
                          onClick={() => handleInstrumentSelect(opportunity.instrument_type as InstrumentKey)}
                          className="w-full text-left hover:scale-[1.02] transition-transform duration-200"
                        >
                          <div className="bg-background/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 
                                        border border-border/30 dark:border-gray-700/50 shadow-sm dark:shadow-none">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-primary/5 dark:bg-gray-700 rounded-lg shrink-0">
                                {getInstrumentIcon(opportunity.instrument_type)}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <h3 className="text-base font-inter text-foreground dark:text-gray-200 truncate">
                                      {instrumentDef.name}
                                    </h3>
                                    {faviconUrl && (
                                      <div className="relative w-4 h-4 shrink-0">
                                        <Image
                                          src={faviconUrl}
                                          alt={`${instrumentDef.protocol} favicon`}
                                          width={16}
                                          height={16}
                                          className="rounded-sm"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-base font-inter text-primary dark:text-primary/80">
                                      {instrumentDef.apy ? `${instrumentDef.apy}% APY` : `${opportunity.estimated_apy.toFixed(2)}% APY`}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mb-2">
                                  {instrumentDef.description}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      instrumentDef.riskLevel === 'AGGRESSIVE' 
                                        ? 'bg-destructive/10 text-destructive dark:bg-destructive/20' 
                                        : instrumentDef.riskLevel === 'MODERATE'
                                        ? 'bg-warning/10 text-warning dark:bg-warning/20'
                                        : 'bg-success/10 text-success dark:bg-success/20'
                                    }`}>
                                      {instrumentDef.riskLevel}
                                    </span>
                                    <span className="text-xs bg-muted/30 dark:bg-gray-700 text-muted-foreground dark:text-gray-300 px-2 py-0.5 rounded-full">
                                      {instrumentDef.timeHorizon}
                                    </span>
                                    {highRisks.map((risk) => (
                                      <span key={risk} className="text-xs bg-destructive/10 text-destructive dark:bg-destructive/20 px-2 py-0.5 rounded-full">
                                        {risk.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                    ))}
                                  </div>
                                  {instrumentDef.url && (
                                    <div className="shrink-0">
                                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Hover content */}
                                <div className="hidden group-hover:block absolute left-0 right-0 bottom-full p-4 bg-popover border rounded-lg shadow-lg z-10">
                                  <div className="space-y-2">
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">Pros</h4>
                                      <p className="text-sm text-muted-foreground">{instrumentDef.pros}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">Cons</h4>
                                      <p className="text-sm text-muted-foreground">{instrumentDef.cons}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm mb-1">Risk Metrics</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(instrumentDef.riskMetrics).map(([key, value]) => (
                                          value !== 'NONE' && value !== 'ZERO' && (
                                            <div key={key} className="flex items-center justify-between">
                                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                              <span className={`text-xs px-1.5 rounded ${
                                                value === 'HIGH' 
                                                  ? 'bg-destructive/10 text-destructive' 
                                                  : value === 'MEDIUM'
                                                  ? 'bg-warning/10 text-warning'
                                                  : 'bg-muted/30 text-muted-foreground'
                                              }`}>
                                                {value}
                                              </span>
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Metrics - Only show after initial question */}
            {currentAnalysis.progress.completed_topics.length > 0 && (
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 dark:bg-gray-900/90 backdrop-blur-sm 
                        flex items-center justify-center z-50">
            <Card className="border-none bg-background/50 dark:bg-gray-800/50">
              <CardContent className="p-8 flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32">
                  <Image
                    src="/images/thinking.png"
                    alt="Caishen is thinking"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h3 className="text-lg font-inter text-foreground dark:text-gray-200">
                  Caishen is thinking...
                </h3>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 