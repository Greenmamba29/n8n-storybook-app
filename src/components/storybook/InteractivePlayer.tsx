'use client';

/**
 * Interactive Storybook Player
 * Main component for displaying and interacting with educational storybooks
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, Eye, EyeOff } from 'lucide-react';
import { EducationalContent, EducationalStep, InteractiveElement } from '../../lib/agents/n8n-workflow-analyzer';
import { AccessibilityControls } from './AccessibilityControls';
import { ProgressTracker } from './ProgressTracker';

interface InteractivePlayerProps {
  storybook: EducationalContent;
  onProgress?: (stepId: string, progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  accessibilityMode?: boolean;
}

export const InteractivePlayer: React.FC<InteractivePlayerProps> = ({
  storybook,
  onProgress,
  onComplete,
  autoPlay = false,
  accessibilityMode = false,
}) => {
  // State management
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAccessibilityControls, setShowAccessibilityControls] = useState(accessibilityMode);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Refs
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Current step data
  const currentStep = storybook.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === storybook.steps.length - 1;

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isLastStep) {
      const timer = setTimeout(() => {
        handleNextStep();
      }, 5000 / playbackSpeed); // 5 seconds per step, adjusted by speed

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStepIndex, playbackSpeed, isLastStep]);

  // Speech synthesis for accessibility
  useEffect(() => {
    if (screenReaderMode && currentStep) {
      speakText(currentStep.explanation || currentStep.description);
    }

    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep, screenReaderMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextStep();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousStep();
          break;
        case 'Escape':
          setIsPlaying(false);
          break;
      }
    };

    if (playerRef.current) {
      playerRef.current.addEventListener('keydown', handleKeyPress);
      return () => {
        playerRef.current?.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [isPlaying, currentStepIndex]);

  // Step navigation functions
  const handleNextStep = () => {
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      markStepComplete(currentStep.id);
      onProgress?.(storybook.steps[nextIndex].id, (nextIndex + 1) / storybook.steps.length * 100);
    } else {
      markStepComplete(currentStep.id);
      setIsPlaying(false);
      onComplete?.();
    }
  };

  const handlePreviousStep = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onProgress?.(storybook.steps[prevIndex].id, (prevIndex + 1) / storybook.steps.length * 100);
    }
  };

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    onProgress?.(storybook.steps[stepIndex].id, (stepIndex + 1) / storybook.steps.length * 100);
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  // Speech synthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : 1;
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Render interactive elements
  const renderInteractiveElement = (element: InteractiveElement) => {
    switch (element.type) {
      case 'simulation':
        return (
          <div 
            className={`simulation-container p-4 border rounded-lg ${highContrast ? 'border-white bg-black text-white' : 'border-gray-200 bg-gray-50'}`}
            role="application"
            aria-label={element.accessibility.screenReaderText}
          >
            <h3 className="text-lg font-semibold mb-2">{element.title}</h3>
            <div className="interactive-simulation">
              {/* Simulation content would be rendered here */}
              <div className="p-4 bg-blue-100 rounded text-center">
                <p>🔄 Interactive Simulation: {element.title}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => console.log('Run simulation')}
                >
                  Run Simulation
                </button>
              </div>
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div 
            className={`diagram-container p-4 border rounded-lg ${highContrast ? 'border-white bg-black' : 'border-gray-200 bg-white'}`}
            role="img"
            aria-label={element.accessibility.screenReaderText}
          >
            <h3 className="text-lg font-semibold mb-2">{element.title}</h3>
            <div className="flow-diagram">
              {/* Flow diagram would be rendered here using a library like ReactFlow */}
              <div className="p-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded text-center">
                <p>📊 Interactive Diagram: {element.title}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {element.accessibility.audioDescription}
                </p>
              </div>
            </div>
          </div>
        );

      case 'code-playground':
        return (
          <div 
            className={`code-playground p-4 border rounded-lg ${highContrast ? 'border-white bg-black' : 'border-gray-200 bg-gray-900'}`}
            role="application"
            aria-label="Code playground"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">{element.title}</h3>
            <div className="code-editor">
              <pre className="text-green-400 text-sm p-4 bg-gray-800 rounded overflow-auto">
                <code>{currentStep.code || '// Code example will appear here'}</code>
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={playerRef}
      className={`interactive-player w-full max-w-4xl mx-auto ${
        highContrast ? 'bg-black text-white' : 'bg-white text-gray-900'
      } rounded-lg shadow-lg overflow-hidden`}
      tabIndex={0}
      role="application"
      aria-label="Interactive Storybook Player"
    >
      {/* Player Header */}
      <div className={`player-header p-4 border-b ${highContrast ? 'border-white' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="storybook-info">
            <h1 className="text-2xl font-bold">{storybook.title}</h1>
            <p className="text-sm opacity-75">
              {storybook.complexity} • {storybook.estimatedDuration} min • Step {currentStepIndex + 1} of {storybook.steps.length}
            </p>
          </div>
          
          <div className="player-controls flex items-center space-x-2">
            <button
              onClick={() => setShowAccessibilityControls(!showAccessibilityControls)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle accessibility controls"
            >
              {showAccessibilityControls ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            <button
              onClick={() => setScreenReaderMode(!screenReaderMode)}
              className={`p-2 rounded-full ${screenReaderMode ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              aria-label="Toggle screen reader mode"
            >
              <Volume2 size={20} />
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          steps={storybook.steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          onStepSelect={handleStepSelect}
        />
      </div>

      {/* Accessibility Controls */}
      <AnimatePresence>
        {showAccessibilityControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="accessibility-controls"
          >
            <AccessibilityControls
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              screenReaderMode={screenReaderMode}
              setScreenReaderMode={setScreenReaderMode}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="player-content p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="step-content"
          >
            {/* Step Header */}
            <div className="step-header mb-6">
              <h2 className="text-3xl font-bold mb-2">{currentStep.title}</h2>
              <p className="text-lg opacity-80 mb-4">{currentStep.description}</p>
              {currentStep.explanation && (
                <div className={`explanation p-4 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-blue-50'} mb-4`}>
                  <p>{currentStep.explanation}</p>
                </div>
              )}
            </div>

            {/* Interactive Elements */}
            <div className="interactive-elements space-y-6">
              {storybook.interactiveElements
                .filter(element => element.id.includes(currentStep.id))
                .map(element => (
                  <div key={element.id}>
                    {renderInteractiveElement(element)}
                  </div>
                ))}
            </div>

            {/* Code Examples */}
            {currentStep.code && (
              <div className="code-example mt-6">
                <h3 className="text-xl font-semibold mb-3">Code Example</h3>
                <div className={`code-container rounded-lg overflow-hidden ${highContrast ? 'bg-gray-900' : 'bg-gray-800'}`}>
                  <pre className="text-green-400 text-sm p-4 overflow-auto">
                    <code>{currentStep.code}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Visual Aids */}
            {currentStep.visualAids && currentStep.visualAids.length > 0 && (
              <div className="visual-aids mt-6">
                <h3 className="text-xl font-semibold mb-3">Visual Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStep.visualAids.map((aid, index) => (
                    <div
                      key={index}
                      className={`visual-aid p-4 rounded-lg border ${highContrast ? 'border-white' : 'border-gray-200'}`}
                      role="img"
                      aria-label={aid.altText}
                    >
                      <div className="bg-gray-100 h-32 rounded mb-2 flex items-center justify-center">
                        <span className="text-gray-500">📊 {aid.type}</span>
                      </div>
                      <p className="text-sm font-medium">{aid.altText}</p>
                      <p className="text-xs opacity-75 mt-1">{aid.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Question */}
            {currentStep.quiz && (
              <div className="quiz-section mt-6">
                <h3 className="text-xl font-semibold mb-3">Quick Check</h3>
                <div className={`quiz-container p-4 rounded-lg border ${highContrast ? 'border-white' : 'border-gray-200'}`}>
                  <p className="mb-4">{currentStep.quiz.question}</p>
                  <div className="options space-y-2">
                    {currentStep.quiz.options.map((option, index) => (
                      <button
                        key={index}
                        className={`option w-full text-left p-3 rounded border hover:bg-gray-50 ${
                          highContrast ? 'border-white hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => console.log('Answer selected:', index)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Player Controls */}
      <div className={`player-controls p-4 border-t ${highContrast ? 'border-white' : 'border-gray-200'} bg-gray-50 dark:bg-gray-800`}>
        <div className="flex items-center justify-between">
          <div className="navigation-controls flex items-center space-x-2">
            <button
              onClick={handlePreviousStep}
              disabled={isFirstStep}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous step"
            >
              <SkipBack size={24} />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={isLastStep}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next step"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="utility-controls flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-3 py-1 rounded border text-sm"
              aria-label="Playback speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            
            <button
              onClick={() => console.log('Settings')}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden audio element for sound effects */}
      <audio ref={audioRef} />
    </div>
  );
};
