import React from 'react';
import { Tooltip, Progress } from '@nextui-org/react';
import { MotionList, MotionListItem } from '@/components/animations/MotionWrapper';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Option {
  id: string;
  title: string;
  description: string;
  tooltip?: string;
}

interface ProgressData {
  completed_topics: string[];
  missing_information: string[];
  confidence_levels: Record<string, number>;
  is_analysis_complete: boolean;
}

interface AIOptionInterfaceProps {
  question: string;
  options: Option[];
  onOptionSelect: (optionId: string) => void;
  progress?: ProgressData;
}

export const AIOptionInterface = ({
  question,
  options,
  onOptionSelect,
  progress,
}: AIOptionInterfaceProps) => {
  const handleOptionClick = (optionId: string) => {
    onOptionSelect(optionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOptionSelect(optionId);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Progress Section */}
      {progress && (
        <div className="bg-default-50 rounded-xl p-8 space-y-6">
          <h3 className="text-lg text-primary font-inter">Analysis Progress</h3>
          
          {/* Progress Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Topics */}
            <div className="space-y-4">
              <h4 className="text-sm text-secondary font-inter">Completed Topics</h4>
              <div className="space-y-2">
                {progress.completed_topics.map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-success">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-inter">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Information */}
            <div className="space-y-4">
              <h4 className="text-sm text-secondary font-inter">Missing Information</h4>
              <div className="space-y-2">
                {progress.missing_information.map((info) => (
                  <div key={info} className="flex items-center gap-2 text-warning">
                    <AlertCircle size={16} />
                    <span className="text-sm font-inter">{info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Levels */}
          {progress.confidence_levels && (
            <div className="space-y-4">
              <h4 className="text-sm text-secondary font-inter">Confidence Levels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(progress.confidence_levels).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-inter capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-inter">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={value * 100} 
                      color={value > 0.7 ? "success" : value > 0.4 ? "warning" : "danger"}
                      className="h-2"
                      aria-label={`${key} confidence`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Section */}
      <div className="p-8 bg-default-50 rounded-xl">
        <h2 className="text-xl text-primary font-inter">
          {question}
        </h2>
      </div>

      {/* Options Grid */}
      <MotionList className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => (
          <Tooltip
            key={option.id}
            content={option.tooltip}
            delay={0}
            closeDelay={0}
            className="w-full"
          >
            <MotionListItem>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOptionClick(option.id)}
                onKeyDown={(e) => handleKeyDown(e, option.id)}
                className="h-full rounded-xl bg-default-50 hover:bg-default-100
                          transition-all duration-200 cursor-pointer p-8
                          hover:shadow-lg"
                aria-label={`Select option: ${option.title}`}
              >
                <h3 className="text-lg text-primary font-inter mb-3">
                  {option.title}
                </h3>
                <p className="text-sm text-secondary font-inter">
                  {option.description}
                </p>
              </div>
            </MotionListItem>
          </Tooltip>
        ))}
      </MotionList>
    </div>
  );
}; 