'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Video, Accessibility, Sparkles, ChevronRight, Github, Globe, Download } from 'lucide-react';
import { InteractivePlayer } from '../components/storybook/InteractivePlayer';
import { n8nIntegrationService } from '../services/n8n-integration';
import { agentOrchestrator, WorkflowToStorybookRequest } from '../lib/agents/agent-orchestrator';
import { EducationalContent, N8NWorkflow } from '../lib/agents/n8n-workflow-analyzer';

export default function HomePage() {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowSource, setWorkflowSource] = useState<'file' | 'url' | 'github'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [generatedStorybook, setGeneratedStorybook] = useState<EducationalContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation options
  const [includeVideo, setIncludeVideo] = useState(true);
  const [accessibility, setAccessibility] = useState(true);
  const [complexity, setComplexity] = useState<'auto' | 'beginner' | 'intermediate' | 'advanced'>('auto');
  const [style, setStyle] = useState<'tutorial' | 'interactive' | 'documentation'>('interactive');

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid N8N workflow JSON file');
    }
  }, []);

  /**
   * Handle drag and drop
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please drop a valid N8N workflow JSON file');
    }
  }, []);

  /**
   * Generate interactive storybook
   */
  const generateStorybook = async () => {
    if (!selectedFile && !urlInput) {
      setError('Please select a file or enter a URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessStep('Initializing...');

    try {
      let workflow: N8NWorkflow;

      // Load workflow based on source
      if (selectedFile) {
        setProcessStep('Processing uploaded file...');
        const fileContent = await selectedFile.text();
        workflow = await n8nIntegrationService.processWorkflowFile(fileContent);
      } else if (urlInput) {
        setProcessStep('Importing from URL...');
        workflow = await n8nIntegrationService.importWorkflow(
          workflowSource === 'github' ? 'github' : 'url',
          urlInput
        );
      } else {
        throw new Error('No workflow source provided');
      }

      // Create storybook request
      const request: WorkflowToStorybookRequest = {
        workflow,
        options: {
          includeVideo,
          accessibility,
          complexity,
          style,
          language: 'en',
        },
        user: {
          id: 'demo-user',
          preferences: {
            learningStyle: 'mixed',
            accessibilityNeeds: accessibility ? ['screen_reader', 'keyboard_navigation'] : [],
            preferredLanguage: 'en',
            experienceLevel: complexity === 'auto' ? 'intermediate' : complexity,
          },
        },
      };

      // Set up orchestrator event listeners
      const orchestrator = agentOrchestrator;
      
      orchestrator.on('orchestration:started', ({ taskId }) => {
        setProcessStep(`Starting orchestration (${taskId})...`);
      });

      orchestrator.on('task:started', ({ task }) => {
        const stepNames = {
          analyze_workflow: 'Analyzing workflow structure...',
          generate_content: 'Generating educational content...',
          create_video: 'Creating instructional video...',
          enhance_accessibility: 'Adding accessibility features...',
          quality_check: 'Performing quality assurance...',
          route_request: 'Optimizing content routing...',
        };
        setProcessStep(stepNames[task.type] || `Processing ${task.type}...`);
      });

      orchestrator.on('orchestration:completed', ({ result }) => {
        setGeneratedStorybook(result);
        setProcessStep('Storybook generation completed!');
      });

      // Generate the interactive storybook
      const storybook = await orchestrator.createInteractiveStorybook(request);
      
      // Clean up event listeners
      orchestrator.removeAllListeners();

    } catch (err) {
      console.error('Storybook generation failed:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setSelectedFile(null);
    setUrlInput('');
    setGeneratedStorybook(null);
    setError(null);
    setIsProcessing(false);
    setProcessStep('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            N8N Interactive <span className="text-blue-600">Storybook</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your N8N automation workflows into engaging, accessible, interactive educational experiences. 
            Perfect for visual learners, deaf students, and anyone who learns better with hands-on content.
          </p>
        </motion.div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {!generatedStorybook ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Upload Section */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Upload className="mr-3 text-blue-600" size={28} />
                  Import N8N Workflow
                </h2>

                {/* Source Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Source
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setWorkflowSource('file')}
                      className={`px-4 py-2 rounded-md border ${
                        workflowSource === 'file'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="inline mr-2" size={16} />
                      Upload File
                    </button>
                    <button
                      onClick={() => setWorkflowSource('url')}
                      className={`px-4 py-2 rounded-md border ${
                        workflowSource === 'url'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Globe className="inline mr-2" size={16} />
                      From URL
                    </button>
                    <button
                      onClick={() => setWorkflowSource('github')}
                      className={`px-4 py-2 rounded-md border ${
                        workflowSource === 'github'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Github className="inline mr-2" size={16} />
                      From GitHub
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                {workflowSource === 'file' && (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your N8N workflow JSON file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                    {selectedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-800 font-medium">{selectedFile.name}</p>
                      </div>
                    )}
                    <input
                      id="file-input"
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* URL Input */}
                {(workflowSource === 'url' || workflowSource === 'github') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {workflowSource === 'github' ? 'GitHub URL' : 'Workflow URL'}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={
                        workflowSource === 'github'
                          ? 'https://github.com/user/repo/blob/main/workflow.json'
                          : 'https://example.com/workflow.json'
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Options Section */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Sparkles className="mr-3 text-purple-600" size={28} />
                  Generation Options
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Video Generation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Video className="mr-2 text-purple-600" size={16} />
                          Include Video Tutorial
                        </label>
                        <button
                          onClick={() => setIncludeVideo(!includeVideo)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            includeVideo ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                              includeVideo ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Generate AI-powered video explanations using Wan2.2 models
                      </p>
                    </div>

                    {/* Accessibility */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Accessibility className="mr-2 text-green-600" size={16} />
                          Enhanced Accessibility
                        </label>
                        <button
                          onClick={() => setAccessibility(!accessibility)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            accessibility ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                              accessibility ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Add screen reader support, keyboard navigation, and WCAG 2.1 compliance
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Complexity Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Complexity
                      </label>
                      <select
                        value={complexity}
                        onChange={(e) => setComplexity(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Style
                      </label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="interactive">Interactive Tutorial</option>
                        <option value="tutorial">Step-by-Step Guide</option>
                        <option value="documentation">Reference Documentation</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
                >
                  <p className="text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Generate Button */}
              <div className="text-center">
                <motion.button
                  onClick={generateStorybook}
                  disabled={isProcessing || (!selectedFile && !urlInput)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {processStep || 'Generating...'}
                    </>
                  ) : (
                    <>
                      Generate Interactive Storybook
                      <ChevronRight className="ml-2" size={20} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="storybook"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Storybook Player */}
              <div className="mb-8">
                <InteractivePlayer
                  storybook={generatedStorybook}
                  onProgress={(stepId, progress) => {
                    console.log(`Step ${stepId}: ${progress}% complete`);
                  }}
                  onComplete={() => {
                    console.log('Storybook completed!');
                  }}
                  autoPlay={false}
                  accessibilityMode={accessibility}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    // Download as JSON
                    const dataStr = JSON.stringify(generatedStorybook, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${generatedStorybook.title.replace(/\s+/g, '-')}-storybook.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Download className="mr-2" size={16} />
                  Download Storybook
                </button>
                
                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Create Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
  );
}
