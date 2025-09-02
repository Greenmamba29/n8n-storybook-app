'use client';

/**
 * Progress Tracker Component
 * Visual progress indicator and navigation for storybook steps
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Play, Clock } from 'lucide-react';
import { EducationalStep } from '../../lib/agents/n8n-workflow-analyzer';

interface ProgressTrackerProps {
  steps: EducationalStep[];
  currentStepIndex: number;
  completedSteps: Set<string>;
  onStepSelect: (stepIndex: number) => void;
  showStepTitles?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStepIndex,
  completedSteps,
  onStepSelect,
  showStepTitles = true,
  variant = 'horizontal',
}) => {
  const totalSteps = steps.length;
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
  const completedPercentage = (completedSteps.size / totalSteps) * 100;

  const getStepStatus = (stepIndex: number, stepId: string) => {
    if (completedSteps.has(stepId)) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else if (stepIndex < currentStepIndex) {
      return 'accessible'; // Can navigate back
    } else {
      return 'upcoming';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'current':
        return <Play size={16} className="text-blue-500" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const handleStepClick = (stepIndex: number, status: string) => {
    // Only allow navigation to current, completed, or accessible steps
    if (status !== 'upcoming') {
      onStepSelect(stepIndex);
    }
  };

  if (variant === 'vertical') {
    return (
      <div className="progress-tracker-vertical w-64 p-4" role="navigation" aria-label="Storybook progress">
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-2">Progress</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>{completedSteps.size} of {totalSteps} completed</span>
            <span>({Math.round(completedPercentage)}%)</span>
          </div>
        </div>

        <div className="relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
            <motion.div
              className="w-full bg-blue-500"
              initial={{ height: '0%' }}
              animate={{ height: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index, step.id);
              const isClickable = status !== 'upcoming';

              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => handleStepClick(index, status)}
                >
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 z-10 ${status === 'current' ? 'scale-125' : ''} transition-transform`}>
                    {getStepIcon(status)}
                  </div>

                  {/* Step Content */}
                  <div className={`flex-1 min-w-0 ${status === 'upcoming' ? 'opacity-50' : ''}`}>
                    <h4 className={`text-sm font-medium truncate ${
                      status === 'current' ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h4>
                    {showStepTitles && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    )}
                    {status === 'current' && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <Clock size={12} className="mr-1" />
                          Current
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className="progress-tracker-horizontal mt-4" role="navigation" aria-label="Storybook progress">
      {/* Overall Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Progress</span>
          <span className="text-gray-600">
            Step {currentStepIndex + 1} of {totalSteps} ({Math.round(progressPercentage)}%)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Completion Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>{completedSteps.size} completed</span>
          <span>{totalSteps - currentStepIndex - 1} remaining</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step Dots */}
        <div className="flex justify-between items-center relative z-10">
          {steps.map((step, index) => {
            const status = getStepStatus(index, step.id);
            const isClickable = status !== 'upcoming';

            return (
              <div
                key={step.id}
                className="flex flex-col items-center group"
              >
                {/* Step Dot */}
                <button
                  onClick={() => handleStepClick(index, status)}
                  disabled={!isClickable}
                  className={`
                    relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                    ${status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'current'
                      ? 'bg-blue-500 text-white scale-125'
                      : status === 'accessible'
                      ? 'bg-gray-300 hover:bg-gray-400 text-gray-700 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                    ${isClickable ? 'hover:scale-110' : ''}
                  `}
                  aria-label={`Step ${index + 1}: ${step.title} - ${status}`}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <CheckCircle size={16} />
                  ) : status === 'current' ? (
                    <Play size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}

                  {/* Current Step Indicator */}
                  {status === 'current' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-300"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>

                {/* Step Title (on hover/focus) */}
                {showStepTitles && (
                  <div className="absolute top-full mt-2 hidden group-hover:block group-focus-within:block z-20">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-32 truncate">
                      {step.title}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Play size={12} className="text-blue-500" />
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center space-x-1">
            <Circle size={12} className="text-gray-400" />
            <span className="text-gray-600">Upcoming</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const firstIncomplete = steps.findIndex((step, index) => 
                !completedSteps.has(step.id) && index >= currentStepIndex
              );
              if (firstIncomplete !== -1) {
                onStepSelect(firstIncomplete);
              }
            }}
            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
          >
            Next Incomplete
          </button>
          
          {completedSteps.size > 0 && (
            <button
              onClick={() => {
                const lastCompleted = steps.findLastIndex((step) => completedSteps.has(step.id));
                if (lastCompleted !== -1) {
                  onStepSelect(lastCompleted);
                }
              }}
              className="px-2 py-1 text-green-600 hover:bg-green-50 rounded text-xs"
            >
              Last Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
