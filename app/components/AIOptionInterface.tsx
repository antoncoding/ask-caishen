import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { MotionList, MotionListItem } from '@/components/animations/MotionWrapper';

interface Option {
  id: string;
  title: string;
  description: string;
  tooltip?: string;
}

interface AIOptionInterfaceProps {
  question: string;
  options: Option[];
  onOptionSelect: (optionId: string) => void;
}

export const AIOptionInterface = ({
  question,
  options,
  onOptionSelect,
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
    <div className="w-full">
      {/* Question Section */}
      <div className="mb-6">
        <h2 className="text-xl text-primary font-inter">
          {question}
        </h2>
      </div>

      {/* Options Grid */}
      <MotionList className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="h-full rounded-lg bg-main shadow-md hover:shadow-lg
                          transition-all duration-200 cursor-pointer p-6
                          hover:bg-opacity-80"
                aria-label={`Select option: ${option.title}`}
              >
                <h3 className="text-lg font-medium text-primary font-inter mb-2">
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