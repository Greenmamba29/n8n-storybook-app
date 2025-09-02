'use client';

/**
 * Accessibility Controls Component
 * Provides comprehensive accessibility options following WCAG 2.1 AA guidelines
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Volume2, VolumeX, Eye, Type, Gauge } from 'lucide-react';

interface AccessibilityControlsProps {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (enabled: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  fontSize?: 'small' | 'medium' | 'large';
  setFontSize?: (size: 'small' | 'medium' | 'large') => void;
  reduceMotion?: boolean;
  setReduceMotion?: (enabled: boolean) => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  highContrast,
  setHighContrast,
  screenReaderMode,
  setScreenReaderMode,
  playbackSpeed,
  setPlaybackSpeed,
  fontSize = 'medium',
  setFontSize,
  reduceMotion = false,
  setReduceMotion,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`accessibility-controls p-4 border-b ${
        highContrast ? 'border-white bg-gray-900' : 'border-gray-200 bg-gray-50'
      }`}
      role="toolbar"
      aria-label="Accessibility controls"
    >
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Eye className="mr-2" size={20} />
          Accessibility Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Visual Accessibility */}
          <div className="accessibility-section">
            <h4 className="font-medium mb-3 flex items-center">
              <Palette className="mr-2" size={16} />
              Visual
            </h4>
            
            <div className="space-y-3">
              {/* High Contrast Toggle */}
              <div className="control-group flex items-center justify-between">
                <label htmlFor="high-contrast" className="text-sm font-medium">
                  High Contrast Mode
                </label>
                <button
                  id="high-contrast"
                  role="switch"
                  aria-checked={highContrast}
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    highContrast ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size Control */}
              {setFontSize && (
                <div className="control-group">
                  <label htmlFor="font-size" className="text-sm font-medium block mb-2">
                    Text Size
                  </label>
                  <select
                    id="font-size"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      highContrast ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    aria-describedby="font-size-help"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <p id="font-size-help" className="text-xs text-gray-500 mt-1">
                    Adjust text size for better readability
                  </p>
                </div>
              )}

              {/* Reduce Motion */}
              {setReduceMotion && (
                <div className="control-group flex items-center justify-between">
                  <label htmlFor="reduce-motion" className="text-sm font-medium">
                    Reduce Motion
                  </label>
                  <button
                    id="reduce-motion"
                    role="switch"
                    aria-checked={reduceMotion}
                    onClick={() => setReduceMotion(!reduceMotion)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      reduceMotion ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        reduceMotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audio Accessibility */}
          <div className="accessibility-section">
            <h4 className="font-medium mb-3 flex items-center">
              <Volume2 className="mr-2" size={16} />
              Audio
            </h4>
            
            <div className="space-y-3">
              {/* Screen Reader Mode */}
              <div className="control-group flex items-center justify-between">
                <label htmlFor="screen-reader" className="text-sm font-medium">
                  Screen Reader Audio
                </label>
                <button
                  id="screen-reader"
                  role="switch"
                  aria-checked={screenReaderMode}
                  onClick={() => setScreenReaderMode(!screenReaderMode)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    screenReaderMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      screenReaderMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Audio Speed Control */}
              <div className="control-group">
                <label htmlFor="audio-speed" className="text-sm font-medium block mb-2">
                  Audio Speed
                </label>
                <div className="flex items-center space-x-2">
                  <Gauge size={16} />
                  <input
                    id="audio-speed"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-describedby="speed-value"
                  />
                  <span id="speed-value" className="text-sm font-mono w-8">
                    {playbackSpeed}x
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Adjust playback and narration speed
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Accessibility */}
          <div className="accessibility-section">
            <h4 className="font-medium mb-3 flex items-center">
              <Type className="mr-2" size={16} />
              Navigation
            </h4>
            
            <div className="space-y-3">
              {/* Keyboard Shortcuts Info */}
              <div className="keyboard-shortcuts">
                <h5 className="text-sm font-medium mb-2">Keyboard Shortcuts</h5>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Play/Pause:</span>
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">Space</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Step:</span>
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Step:</span>
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Stop:</span>
                    <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Focus Management */}
              <div className="focus-management">
                <h5 className="text-sm font-medium mb-2">Focus Options</h5>
                <button
                  onClick={() => {
                    const player = document.querySelector('[role="application"]') as HTMLElement;
                    player?.focus();
                  }}
                  className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Focus Player
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Accessibility Features */}
        <div className="additional-features mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-3">Additional Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skip Navigation */}
            <div className="feature-group">
              <h5 className="text-sm font-medium mb-2">Skip Navigation</h5>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const content = document.querySelector('.step-content');
                    content?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Skip to Main Content
                </button>
                <button
                  onClick={() => {
                    const controls = document.querySelector('.player-controls');
                    controls?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Skip to Player Controls
                </button>
              </div>
            </div>

            {/* ARIA Live Regions */}
            <div className="feature-group">
              <h5 className="text-sm font-medium mb-2">Screen Reader Updates</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Step changes are announced automatically</p>
                <p>• Progress updates are announced</p>
                <p>• Interactive elements have proper labels</p>
                <p>• All content has alternative text</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Statement */}
        <div className="accessibility-statement mt-6 pt-4 border-t border-gray-200">
          <details className="text-sm">
            <summary className="font-medium cursor-pointer hover:text-blue-600">
              Accessibility Statement
            </summary>
            <div className="mt-3 text-xs text-gray-600 space-y-2">
              <p>
                This interactive storybook player is designed to meet WCAG 2.1 AA accessibility standards.
                It includes support for:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Screen readers and assistive technologies</li>
                <li>Keyboard-only navigation</li>
                <li>High contrast and low vision support</li>
                <li>Customizable text sizes and playback speeds</li>
                <li>Reduced motion preferences</li>
                <li>Alternative text for all visual content</li>
              </ul>
              <p>
                If you encounter any accessibility barriers, please contact our support team.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* ARIA Live Region for Announcements */}
      <div
        id="accessibility-announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {/* Dynamic announcements will be inserted here */}
      </div>
    </motion.div>
  );
};
