/**
 * Agent Orchestration System
 * Coordinates multiple AI agents for N8N Interactive Storybook creation
 * Integrates Tambo MCP routing, OpenAI, HuggingFace, and custom agents
 */

import { EventEmitter } from 'events';
import { abacusClient } from '../../services/abacusClient';
import { n8nWorkflowAnalyzer, N8NWorkflow, EducationalContent } from './n8n-workflow-analyzer';
import { videoGenerationAgent, VideoGenerationRequest, VideoAsset } from './video-generation-agent';
import { n8nIntegrationService } from '../../services/n8n-integration';

// Agent Types and Interfaces
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  priority: number;
  lastActivity: Date;
  healthScore: number;
  version: string;
}

export type AgentType = 
  | 'workflow_analyzer' 
  | 'content_generator' 
  | 'video_generator' 
  | 'accessibility_enhancer'
  | 'mcp_router'
  | 'quality_assurance'
  | 'deployment_manager';

export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';

export interface OrchestrationTask {
  id: string;
  type: TaskType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  requiredAgents: AgentType[];
  optionalAgents: AgentType[];
  status: TaskStatus;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  dependencies: string[];
  timeout: number; // milliseconds
}

export type TaskType = 
  | 'analyze_workflow'
  | 'generate_content'
  | 'create_video'
  | 'enhance_accessibility'
  | 'quality_check'
  | 'deploy_storybook';

export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface OrchestrationResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  agentResults: AgentResult[];
  executionTime: number;
  resourceUsage: ResourceUsage;
}

export interface AgentResult {
  agentId: string;
  agentType: AgentType;
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  resourceUsage: number;
}

export interface ResourceUsage {
  cpuTime: number;
  memoryPeak: number;
  networkRequests: number;
  apiCalls: number;
  cost: number;
}

export interface WorkflowToStorybookRequest {
  workflow: N8NWorkflow;
  options: {
    includeVideo: boolean;
    accessibility: boolean;
    complexity: 'auto' | 'beginner' | 'intermediate' | 'advanced';
    style: 'tutorial' | 'interactive' | 'documentation';
    language: string;
  };
  user: {
    id: string;
    preferences: UserPreferences;
  };
}

export interface UserPreferences {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  accessibilityNeeds: string[];
  preferredLanguage: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, OrchestrationTask> = new Map();
  private taskQueue: OrchestrationTask[] = [];
  private isProcessing: boolean = false;
  private maxConcurrentTasks: number = 5;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeAgents();
    this.startHealthMonitoring();
  }

  /**
   * Initialize and register all available agents
   */
  private initializeAgents(): void {
    const agents: Agent[] = [
      {
        id: 'tambo-mcp-router',
        name: 'Tambo MCP Router',
        type: 'mcp_router',
        status: 'idle',
        capabilities: ['routing', 'component_management', 'api_integration'],
        priority: 10,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
      {
        id: 'n8n-workflow-analyzer',
        name: 'N8N Workflow Analyzer',
        type: 'workflow_analyzer',
        status: 'idle',
        capabilities: ['workflow_parsing', 'complexity_analysis', 'educational_mapping'],
        priority: 9,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
      {
        id: 'openai-content-generator',
        name: 'OpenAI Content Generator',
        type: 'content_generator',
        status: 'idle',
        capabilities: ['text_generation', 'educational_content', 'accessibility_text'],
        priority: 8,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
      {
        id: 'wan22-video-generator',
        name: 'Wan2.2 Video Generator',
        type: 'video_generator',
        status: 'idle',
        capabilities: ['video_generation', 'scene_creation', 'audio_synthesis'],
        priority: 7,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
      {
        id: 'accessibility-enhancer',
        name: 'Accessibility Enhancement Agent',
        type: 'accessibility_enhancer',
        status: 'idle',
        capabilities: ['wcag_compliance', 'screen_reader_optimization', 'keyboard_navigation'],
        priority: 8,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
      {
        id: 'quality-assurance',
        name: 'Quality Assurance Agent',
        type: 'quality_assurance',
        status: 'idle',
        capabilities: ['content_validation', 'accessibility_testing', 'performance_analysis'],
        priority: 6,
        lastActivity: new Date(),
        healthScore: 100,
        version: '1.0.0',
      },
    ];

    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    console.log(`Initialized ${agents.length} agents`);
  }

  /**
   * Main orchestration method: Convert N8N workflow to interactive storybook
   */
  async createInteractiveStorybook(request: WorkflowToStorybookRequest): Promise<EducationalContent> {
    const mainTaskId = `storybook-${Date.now()}`;
    
    try {
      this.emit('orchestration:started', { taskId: mainTaskId, request });
      console.log(`Starting storybook creation orchestration: ${mainTaskId}`);

      // Phase 1: Workflow Analysis (Parallel: N8N Analysis + MCP Routing)
      const analysisTasks = await this.createParallelTasks([
        {
          type: 'analyze_workflow',
          data: { workflow: request.workflow, options: request.options },
          requiredAgents: ['workflow_analyzer'],
          priority: 'high',
        },
        {
          type: 'route_request',
          data: { 
            payload: `Analyze workflow: ${request.workflow.name}`,
            tier: 'Pro',
            context: request.user.preferences 
          },
          requiredAgents: ['mcp_router'],
          priority: 'medium',
        },
      ]);

      const [workflowAnalysis, routingResult] = await this.executeTasksBatch(analysisTasks);

      // Phase 2: Content Generation (Enhanced by routing intelligence)
      const contentTask = await this.createTask({
        type: 'generate_content',
        data: {
          workflowAnalysis: workflowAnalysis.data,
          routingContext: routingResult.data,
          options: request.options,
          userPreferences: request.user.preferences,
        },
        requiredAgents: ['content_generator'],
        optionalAgents: ['accessibility_enhancer'],
        priority: 'high',
      });

      const contentResult = await this.executeTask(contentTask);
      let educationalContent: EducationalContent = contentResult.data;

      // Phase 3: Video Generation (if requested)
      if (request.options.includeVideo) {
        const videoTask = await this.createTask({
          type: 'create_video',
          data: {
            educationalContent,
            videoRequest: {
              title: educationalContent.title,
              description: educationalContent.description,
              steps: educationalContent.steps,
              style: 'tutorial',
              duration: Math.min(educationalContent.estimatedDuration * 4, 300), // Max 5 minutes
              resolution: '1080p',
              accessibility: request.options.accessibility,
            } as VideoGenerationRequest,
          },
          requiredAgents: ['video_generator'],
          priority: 'medium',
        });

        const videoResult = await this.executeTask(videoTask);
        
        // Integrate video into educational content
        educationalContent = this.integrateVideoContent(educationalContent, videoResult.data);
      }

      // Phase 4: Accessibility Enhancement
      if (request.options.accessibility) {
        const accessibilityTask = await this.createTask({
          type: 'enhance_accessibility',
          data: {
            educationalContent,
            userAccessibilityNeeds: request.user.preferences.accessibilityNeeds,
          },
          requiredAgents: ['accessibility_enhancer'],
          priority: 'high',
        });

        const accessibilityResult = await this.executeTask(accessibilityTask);
        educationalContent = accessibilityResult.data;
      }

      // Phase 5: Quality Assurance
      const qaTask = await this.createTask({
        type: 'quality_check',
        data: { educationalContent },
        requiredAgents: ['quality_assurance'],
        priority: 'medium',
      });

      const qaResult = await this.executeTask(qaTask);
      
      // Apply QA improvements
      if (qaResult.success && qaResult.data.improvements) {
        educationalContent = this.applyQAImprovements(educationalContent, qaResult.data.improvements);
      }

      this.emit('orchestration:completed', { taskId: mainTaskId, result: educationalContent });
      console.log(`Storybook creation completed: ${mainTaskId}`);

      return educationalContent;
    } catch (error) {
      this.emit('orchestration:failed', { taskId: mainTaskId, error });
      console.error(`Storybook creation failed: ${mainTaskId}`, error);
      throw error;
    }
  }

  /**
   * Create and queue a new orchestration task
   */
  async createTask(taskConfig: Partial<OrchestrationTask>): Promise<OrchestrationTask> {
    const task: OrchestrationTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: taskConfig.type!,
      priority: taskConfig.priority || 'medium',
      data: taskConfig.data || {},
      requiredAgents: taskConfig.requiredAgents || [],
      optionalAgents: taskConfig.optionalAgents || [],
      status: 'pending',
      progress: 0,
      dependencies: taskConfig.dependencies || [],
      timeout: taskConfig.timeout || 300000, // 5 minutes default
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    
    this.emit('task:created', { task });
    
    if (!this.isProcessing) {
      this.processTaskQueue();
    }

    return task;
  }

  /**
   * Create multiple parallel tasks
   */
  async createParallelTasks(taskConfigs: Partial<OrchestrationTask>[]): Promise<OrchestrationTask[]> {
    const tasks = await Promise.all(taskConfigs.map(config => this.createTask(config)));
    return tasks;
  }

  /**
   * Execute a single task
   */
  async executeTask(task: OrchestrationTask): Promise<OrchestrationResult> {
    const startTime = Date.now();
    
    try {
      // Update task status
      task.status = 'running';
      task.startTime = new Date();
      this.emit('task:started', { task });

      // Route task to appropriate agent
      const result = await this.routeTaskToAgent(task);
      
      // Update task completion
      task.status = 'completed';
      task.endTime = new Date();
      task.progress = 100;
      task.result = result;
      
      const executionTime = Date.now() - startTime;
      
      this.emit('task:completed', { task, result, executionTime });

      return {
        taskId: task.id,
        success: true,
        data: result,
        agentResults: [], // Would be populated in production
        executionTime,
        resourceUsage: {
          cpuTime: executionTime,
          memoryPeak: 0,
          networkRequests: 0,
          apiCalls: 1,
          cost: this.calculateTaskCost(task, executionTime),
        },
      };
    } catch (error) {
      task.status = 'failed';
      task.endTime = new Date();
      task.error = error.message;
      
      this.emit('task:failed', { task, error });

      return {
        taskId: task.id,
        success: false,
        error: error.message,
        agentResults: [],
        executionTime: Date.now() - startTime,
        resourceUsage: {
          cpuTime: 0,
          memoryPeak: 0,
          networkRequests: 0,
          apiCalls: 0,
          cost: 0,
        },
      };
    }
  }

  /**
   * Execute multiple tasks in batch
   */
  async executeTasksBatch(tasks: OrchestrationTask[]): Promise<OrchestrationResult[]> {
    const results = await Promise.all(tasks.map(task => this.executeTask(task)));
    return results;
  }

  /**
   * Route task to appropriate agent based on task type
   */
  private async routeTaskToAgent(task: OrchestrationTask): Promise<any> {
    switch (task.type) {
      case 'analyze_workflow':
        return await this.executeWorkflowAnalysis(task);
      
      case 'generate_content':
        return await this.executeContentGeneration(task);
      
      case 'create_video':
        return await this.executeVideoGeneration(task);
      
      case 'enhance_accessibility':
        return await this.executeAccessibilityEnhancement(task);
      
      case 'quality_check':
        return await this.executeQualityAssurance(task);
      
      case 'route_request':
        return await this.executeMCPRouting(task);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Agent execution methods
   */
  private async executeWorkflowAnalysis(task: OrchestrationTask): Promise<EducationalContent> {
    const agent = this.getAgent('n8n-workflow-analyzer');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { workflow, options } = task.data;
      const result = await n8nWorkflowAnalyzer.analyzeWorkflow(workflow);
      
      this.updateAgentStatus(agent.id, 'idle');
      return result;
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  private async executeContentGeneration(task: OrchestrationTask): Promise<EducationalContent> {
    const agent = this.getAgent('openai-content-generator');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { workflowAnalysis, routingContext, options, userPreferences } = task.data;
      
      // Use existing workflow analysis as base and enhance with routing context
      let enhancedContent = workflowAnalysis;
      
      if (routingContext) {
        // Apply routing intelligence to content organization
        enhancedContent = this.applyRoutingIntelligence(enhancedContent, routingContext);
      }

      // Apply user preferences
      if (userPreferences) {
        enhancedContent = this.personalizeContent(enhancedContent, userPreferences);
      }

      this.updateAgentStatus(agent.id, 'idle');
      return enhancedContent;
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  private async executeVideoGeneration(task: OrchestrationTask): Promise<VideoAsset> {
    const agent = this.getAgent('wan22-video-generator');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { videoRequest } = task.data;
      const result = await videoGenerationAgent.generateVideo(videoRequest);
      
      this.updateAgentStatus(agent.id, 'idle');
      return result;
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  private async executeAccessibilityEnhancement(task: OrchestrationTask): Promise<EducationalContent> {
    const agent = this.getAgent('accessibility-enhancer');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { educationalContent, userAccessibilityNeeds } = task.data;
      
      // Apply accessibility enhancements
      const enhancedContent = this.enhanceAccessibility(educationalContent, userAccessibilityNeeds);
      
      this.updateAgentStatus(agent.id, 'idle');
      return enhancedContent;
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  private async executeQualityAssurance(task: OrchestrationTask): Promise<{score: number; improvements: any[]}> {
    const agent = this.getAgent('quality-assurance');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { educationalContent } = task.data;
      
      // Perform quality checks
      const qualityScore = this.calculateQualityScore(educationalContent);
      const improvements = this.identifyImprovements(educationalContent);
      
      this.updateAgentStatus(agent.id, 'idle');
      return { score: qualityScore, improvements };
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  private async executeMCPRouting(task: OrchestrationTask): Promise<any> {
    const agent = this.getAgent('tambo-mcp-router');
    this.updateAgentStatus(agent.id, 'busy');
    
    try {
      const { payload, tier, context } = task.data;
      const result = await abacusClient.routeRequest(tier, payload, 'production');
      
      this.updateAgentStatus(agent.id, 'idle');
      return result;
    } catch (error) {
      this.updateAgentStatus(agent.id, 'error');
      throw error;
    }
  }

  /**
   * Process task queue
   */
  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!;
        
        // Check dependencies
        if (!this.areDependenciesMet(task)) {
          this.taskQueue.push(task); // Re-queue if dependencies not met
          continue;
        }

        // Execute task
        await this.executeTask(task);
      }
    } catch (error) {
      console.error('Task queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Helper methods
   */
  private getAgent(agentId: string): Agent {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return agent;
  }

  private updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      this.emit('agent:status_changed', { agentId, status });
    }
  }

  private areDependenciesMet(task: OrchestrationTask): boolean {
    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  private calculateTaskCost(task: OrchestrationTask, executionTime: number): number {
    // Simple cost calculation based on task type and execution time
    const baseCosts = {
      analyze_workflow: 0.10,
      generate_content: 0.50,
      create_video: 2.00,
      enhance_accessibility: 0.20,
      quality_check: 0.15,
      route_request: 0.05,
    };

    const baseCost = baseCosts[task.type] || 0.10;
    const timeFactor = executionTime / 60000; // Convert to minutes
    
    return baseCost * Math.max(1, timeFactor);
  }

  private calculateQualityScore(content: EducationalContent): number {
    let score = 0;
    const maxScore = 100;

    // Check content completeness
    if (content.title && content.description) score += 20;
    if (content.learningObjectives && content.learningObjectives.length > 0) score += 15;
    if (content.steps && content.steps.length > 0) score += 25;
    if (content.interactiveElements && content.interactiveElements.length > 0) score += 20;
    if (content.prerequisites && content.prerequisites.length > 0) score += 10;
    if (content.estimatedDuration > 0) score += 10;

    return Math.min(score, maxScore);
  }

  private identifyImprovements(content: EducationalContent): any[] {
    const improvements = [];

    if (!content.title || content.title.length < 5) {
      improvements.push({ type: 'title', message: 'Title should be more descriptive' });
    }

    if (!content.learningObjectives || content.learningObjectives.length < 3) {
      improvements.push({ type: 'objectives', message: 'Add more learning objectives' });
    }

    if (content.steps.length > 10) {
      improvements.push({ type: 'complexity', message: 'Consider breaking into smaller sections' });
    }

    return improvements;
  }

  private applyQAImprovements(content: EducationalContent, improvements: any[]): EducationalContent {
    // Apply automated improvements based on QA feedback
    let improvedContent = { ...content };

    improvements.forEach(improvement => {
      switch (improvement.type) {
        case 'title':
          if (improvedContent.title.length < 10) {
            improvedContent.title = `Interactive Guide: ${improvedContent.title}`;
          }
          break;
        // Add more improvement handlers
      }
    });

    return improvedContent;
  }

  private integrateVideoContent(content: EducationalContent, videoAsset: VideoAsset): EducationalContent {
    return {
      ...content,
      interactiveElements: [
        ...content.interactiveElements,
        {
          type: 'video',
          id: `video-${videoAsset.id}`,
          title: videoAsset.title,
          content: {
            url: videoAsset.url,
            thumbnailUrl: videoAsset.thumbnailUrl,
            duration: videoAsset.duration,
            subtitles: videoAsset.metadata.subtitles,
            timestamps: videoAsset.metadata.timestamps,
          },
          accessibility: videoAsset.accessibility,
        },
      ],
    };
  }

  private applyRoutingIntelligence(content: EducationalContent, routingContext: any): EducationalContent {
    // Apply insights from MCP routing to optimize content organization
    if (routingContext.agent === 'ContentRouterAgent') {
      // Optimize for content-focused approach
      return {
        ...content,
        description: `${content.description}\n\nThis tutorial focuses on practical content management applications.`,
      };
    }
    
    return content;
  }

  private personalizeContent(content: EducationalContent, preferences: UserPreferences): EducationalContent {
    let personalizedContent = { ...content };

    // Adjust complexity based on experience level
    if (preferences.experienceLevel === 'beginner' && content.complexity === 'advanced') {
      personalizedContent.complexity = 'intermediate';
      personalizedContent.description = `${content.description}\n\n*Simplified for beginners*`;
    }

    // Add learning style specific elements
    if (preferences.learningStyle === 'visual') {
      personalizedContent.steps = personalizedContent.steps.map(step => ({
        ...step,
        visualAids: step.visualAids || [
          {
            type: 'diagram',
            altText: `Visual representation of ${step.title}`,
            description: `Diagram showing the process of ${step.title}`,
          },
        ],
      }));
    }

    return personalizedContent;
  }

  private enhanceAccessibility(content: EducationalContent, accessibilityNeeds: string[]): EducationalContent {
    let enhancedContent = { ...content };

    if (accessibilityNeeds.includes('screen_reader')) {
      // Enhance for screen readers
      enhancedContent.steps = enhancedContent.steps.map(step => ({
        ...step,
        explanation: step.explanation || step.description,
        visualAids: step.visualAids?.map(aid => ({
          ...aid,
          altText: aid.altText || `Visual aid for ${step.title}`,
          description: aid.description || `Detailed description of visual element for ${step.title}`,
        })) || [],
      }));
    }

    if (accessibilityNeeds.includes('high_contrast')) {
      // Add high contrast indicators
      enhancedContent.interactiveElements = enhancedContent.interactiveElements.map(element => ({
        ...element,
        accessibility: {
          ...element.accessibility,
          highContrast: true,
        },
      }));
    }

    return enhancedContent;
  }

  /**
   * Start health monitoring for all agents
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  private performHealthCheck(): void {
    this.agents.forEach(agent => {
      // Simple health check based on last activity
      const timeSinceActivity = Date.now() - agent.lastActivity.getTime();
      const healthScore = Math.max(0, 100 - (timeSinceActivity / 60000)); // Decrease by 1 per minute
      
      agent.healthScore = healthScore;
      
      if (healthScore < 50) {
        this.emit('agent:health_warning', { agent });
      }
    });
  }

  /**
   * Get orchestrator status and metrics
   */
  getStatus() {
    const agentStatuses = Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      healthScore: agent.healthScore,
      lastActivity: agent.lastActivity,
    }));

    const taskStats = {
      total: this.tasks.size,
      pending: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
      running: Array.from(this.tasks.values()).filter(t => t.status === 'running').length,
      completed: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
      failed: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
    };

    return {
      isProcessing: this.isProcessing,
      queueLength: this.taskQueue.length,
      agents: agentStatuses,
      tasks: taskStats,
      uptime: process.uptime(),
    };
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.isProcessing = false;
    this.emit('orchestrator:shutdown');
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();
