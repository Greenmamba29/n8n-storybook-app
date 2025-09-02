/**
 * N8N Workflow Analysis Agent
 * Advanced agent for processing N8N workflows and generating educational content
 */

// import { Workflow } from 'n8n-workflow'; // Temporarily disabled for build
import { OpenAI } from 'openai';
import { abacusClient } from '../../services/abacusClient';

export interface N8NWorkflow {
  id: string;
  name: string;
  nodes: any[];
  connections: any;
  settings: any;
  pinData?: any;
  versionId?: string;
}

export interface EducationalContent {
  title: string;
  description: string;
  learningObjectives: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  steps: EducationalStep[];
  interactiveElements: InteractiveElement[];
}

export interface EducationalStep {
  id: string;
  title: string;
  description: string;
  nodeId?: string;
  code?: string;
  explanation: string;
  visualAids: VisualAid[];
  quiz?: QuizQuestion;
}

export interface InteractiveElement {
  type: 'simulation' | 'code-playground' | 'diagram' | 'video';
  id: string;
  title: string;
  content: any;
  accessibility: AccessibilityFeatures;
}

export interface VisualAid {
  type: 'diagram' | 'flowchart' | 'screenshot' | 'animation';
  url?: string;
  altText: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AccessibilityFeatures {
  screenReaderText: string;
  keyboardNavigation: boolean;
  highContrast: boolean;
  audioDescription?: string;
}

export class N8NWorkflowAnalyzer {
  private openai: OpenAI;
  // private workflow?: Workflow; // Temporarily disabled for build

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  /**
   * Main entry point: Analyze N8N workflow and generate educational content
   */
  async analyzeWorkflow(workflowData: N8NWorkflow): Promise<EducationalContent> {
    try {
      // Initialize N8N workflow engine (temporarily disabled for build)
      // this.workflow = new Workflow({
      //   nodes: workflowData.nodes,
      //   connections: workflowData.connections,
      //   active: false,
      //   settings: workflowData.settings,
      //   id: workflowData.id,
      //   name: workflowData.name,
      // });

      // Analyze workflow structure
      const workflowAnalysis = await this.performWorkflowAnalysis(workflowData);
      
      // Generate educational content using OpenAI
      const educationalContent = await this.generateEducationalContent(workflowAnalysis);
      
      // Enhance with ABACUS intelligence
      const enhancedContent = await this.enhanceWithAbacus(educationalContent);
      
      // Add interactive elements
      const interactiveContent = await this.addInteractiveElements(enhancedContent);
      
      // Ensure accessibility compliance
      const accessibleContent = await this.ensureAccessibility(interactiveContent);
      
      return accessibleContent;
    } catch (error) {
      console.error('N8N Workflow analysis failed:', error);
      throw new Error(`Workflow Analysis Error: ${error.message}`);
    }
  }

  /**
   * Analyze workflow structure and data flow
   */
  private async performWorkflowAnalysis(workflowData: N8NWorkflow) {
    const analysis = {
      nodeCount: workflowData.nodes.length,
      nodeTypes: this.extractNodeTypes(workflowData.nodes),
      dataFlow: this.analyzeDataFlow(workflowData),
      complexity: this.assessComplexity(workflowData),
      triggers: this.identifyTriggers(workflowData.nodes),
      integrations: this.identifyIntegrations(workflowData.nodes),
      businessLogic: this.extractBusinessLogic(workflowData),
    };

    return analysis;
  }

  /**
   * Extract unique node types from workflow
   */
  private extractNodeTypes(nodes: any[]): string[] {
    return [...new Set(nodes.map(node => node.type))];
  }

  /**
   * Analyze data flow between nodes
   */
  private analyzeDataFlow(workflowData: N8NWorkflow) {
    const connections = workflowData.connections;
    const dataFlow = [];

    for (const sourceNode in connections) {
      const nodeConnections = connections[sourceNode];
      if (nodeConnections.main) {
        nodeConnections.main.forEach((connectionArray: any[], outputIndex: number) => {
          connectionArray.forEach(connection => {
            dataFlow.push({
              source: sourceNode,
              target: connection.node,
              outputIndex,
              inputIndex: connection.index,
            });
          });
        });
      }
    }

    return dataFlow;
  }

  /**
   * Assess workflow complexity based on various factors
   */
  private assessComplexity(workflowData: N8NWorkflow): 'beginner' | 'intermediate' | 'advanced' {
    const nodeCount = workflowData.nodes.length;
    const uniqueNodeTypes = this.extractNodeTypes(workflowData.nodes).length;
    const hasConditionalLogic = workflowData.nodes.some(node => 
      node.type === 'n8n-nodes-base.if' || node.type === 'n8n-nodes-base.switch'
    );
    const hasLoops = workflowData.nodes.some(node => 
      node.type === 'n8n-nodes-base.splitInBatches'
    );

    let complexityScore = 0;
    
    if (nodeCount > 10) complexityScore += 2;
    else if (nodeCount > 5) complexityScore += 1;
    
    if (uniqueNodeTypes > 5) complexityScore += 2;
    else if (uniqueNodeTypes > 3) complexityScore += 1;
    
    if (hasConditionalLogic) complexityScore += 2;
    if (hasLoops) complexityScore += 2;

    if (complexityScore >= 5) return 'advanced';
    if (complexityScore >= 2) return 'intermediate';
    return 'beginner';
  }

  /**
   * Identify trigger nodes in the workflow
   */
  private identifyTriggers(nodes: any[]): string[] {
    const triggerTypes = [
      'n8n-nodes-base.cron',
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.manualTrigger',
      'n8n-nodes-base.emailTrigger',
    ];

    return nodes
      .filter(node => triggerTypes.some(type => node.type.includes('trigger')) || 
                     triggerTypes.includes(node.type))
      .map(node => node.type);
  }

  /**
   * Identify external integrations in the workflow
   */
  private identifyIntegrations(nodes: any[]): string[] {
    const integrations = new Set<string>();

    nodes.forEach(node => {
      // Extract service names from node types
      const nodeType = node.type.replace('n8n-nodes-base.', '');
      if (nodeType !== 'if' && nodeType !== 'set' && nodeType !== 'function') {
        integrations.add(nodeType);
      }
    });

    return Array.from(integrations);
  }

  /**
   * Extract business logic and purpose from workflow
   */
  private extractBusinessLogic(workflowData: N8NWorkflow) {
    // Analyze node parameters and connections to understand business purpose
    const businessLogic = {
      purpose: workflowData.name || 'Unnamed Workflow',
      actions: [],
      dataTransformations: [],
      conditionalLogic: [],
    };

    workflowData.nodes.forEach(node => {
      if (node.type.includes('if') || node.type.includes('switch')) {
        businessLogic.conditionalLogic.push({
          nodeId: node.id,
          type: node.type,
          condition: node.parameters?.conditions || node.parameters?.rules,
        });
      }
      
      if (node.type.includes('set') || node.type.includes('function')) {
        businessLogic.dataTransformations.push({
          nodeId: node.id,
          type: node.type,
          transformation: node.parameters,
        });
      }

      businessLogic.actions.push({
        nodeId: node.id,
        type: node.type,
        name: node.name || node.type,
        parameters: Object.keys(node.parameters || {}).length,
      });
    });

    return businessLogic;
  }

  /**
   * Generate educational content using OpenAI
   */
  private async generateEducationalContent(analysis: any): Promise<EducationalContent> {
    const prompt = this.buildEducationalPrompt(analysis);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an educational content creator specializing in automation workflows. 
          Create comprehensive learning content that makes complex workflows understandable and engaging.
          Focus on accessibility, visual learning, and hands-on practice.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      functions: [
        {
          name: "create_educational_content",
          description: "Generate structured educational content for workflow learning",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              learningObjectives: { 
                type: "array",
                items: { type: "string" }
              },
              complexity: { 
                type: "string",
                enum: ["beginner", "intermediate", "advanced"]
              },
              estimatedDuration: { type: "number" },
              prerequisites: {
                type: "array",
                items: { type: "string" }
              },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    explanation: { type: "string" },
                    nodeId: { type: "string" },
                    code: { type: "string" }
                  }
                }
              }
            },
            required: ["title", "description", "learningObjectives", "complexity", "steps"]
          }
        }
      ],
      function_call: { name: "create_educational_content" }
    });

    const functionCall = completion.choices[0]?.message?.function_call;
    if (!functionCall?.arguments) {
      throw new Error('Failed to generate educational content');
    }

    const educationalContent = JSON.parse(functionCall.arguments);
    
    // Add default values and enhancements
    return {
      ...educationalContent,
      estimatedDuration: educationalContent.estimatedDuration || this.estimateDuration(analysis),
      prerequisites: educationalContent.prerequisites || this.generatePrerequisites(analysis),
      interactiveElements: [], // Will be populated later
    };
  }

  /**
   * Build educational prompt for OpenAI
   */
  private buildEducationalPrompt(analysis: any): string {
    return `
Analyze this workflow and create educational content:

Workflow Analysis:
- Node Count: ${analysis.nodeCount}
- Node Types: ${analysis.nodeTypes.join(', ')}
- Complexity: ${analysis.complexity}
- Triggers: ${analysis.triggers.join(', ')}
- Integrations: ${analysis.integrations.join(', ')}
- Business Purpose: ${analysis.businessLogic.purpose}

Create comprehensive educational content that includes:
1. Clear learning objectives
2. Step-by-step breakdown of each workflow component
3. Real-world applications and examples
4. Code explanations where applicable
5. Visual learning aids descriptions
6. Interactive elements suggestions

Focus on making this accessible to ${analysis.complexity} level learners while maintaining technical accuracy.
`;
  }

  /**
   * Enhance content with ABACUS intelligence
   */
  private async enhanceWithAbacus(content: EducationalContent): Promise<EducationalContent> {
    try {
      const enhancementRequest = `
Enhance this educational content with intelligent routing and optimization:

Title: ${content.title}
Complexity: ${content.complexity}
Steps: ${content.steps.length}

Please provide recommendations for:
1. Content optimization based on learning theory
2. Interactive element suggestions
3. Assessment opportunities
4. Accessibility improvements
      `;

      const response = await abacusClient.routeRequest('Pro', enhancementRequest, 'development');
      
      // Apply ABACUS recommendations
      return {
        ...content,
        description: content.description + `\n\n${response.notes}`,
        // Add ABACUS-suggested enhancements to metadata
      };
    } catch (error) {
      console.warn('ABACUS enhancement failed, continuing with base content:', error);
      return content;
    }
  }

  /**
   * Add interactive elements to educational content
   */
  private async addInteractiveElements(content: EducationalContent): Promise<EducationalContent> {
    const interactiveElements: InteractiveElement[] = [
      {
        type: 'simulation',
        id: `sim-${content.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Interactive ${content.title} Simulator`,
        content: {
          workflow: content.steps,
          simulationData: this.generateSimulationData(content.steps),
        },
        accessibility: {
          screenReaderText: `Interactive simulation of ${content.title} workflow`,
          keyboardNavigation: true,
          highContrast: true,
        },
      },
      {
        type: 'diagram',
        id: `diagram-${content.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${content.title} Flow Diagram`,
        content: {
          nodes: content.steps.map(step => ({ id: step.id, title: step.title })),
          edges: this.generateFlowConnections(content.steps),
        },
        accessibility: {
          screenReaderText: `Flow diagram showing ${content.steps.length} steps of ${content.title}`,
          keyboardNavigation: true,
          highContrast: true,
          audioDescription: this.generateAudioDescription(content.steps),
        },
      },
    ];

    return {
      ...content,
      interactiveElements,
    };
  }

  /**
   * Ensure content meets accessibility standards
   */
  private async ensureAccessibility(content: EducationalContent): Promise<EducationalContent> {
    // Add accessibility features to all elements
    const accessibleSteps = content.steps.map(step => ({
      ...step,
      visualAids: step.visualAids?.map(aid => ({
        ...aid,
        altText: aid.altText || this.generateAltText(aid),
        description: aid.description || this.generateDescription(aid),
      })) || [],
    }));

    const accessibleInteractiveElements = content.interactiveElements.map(element => ({
      ...element,
      accessibility: {
        ...element.accessibility,
        screenReaderText: element.accessibility.screenReaderText || 
          this.generateScreenReaderText(element),
        keyboardNavigation: true,
        highContrast: true,
        audioDescription: element.accessibility.audioDescription || 
          this.generateAudioDescription(element),
      },
    }));

    return {
      ...content,
      steps: accessibleSteps,
      interactiveElements: accessibleInteractiveElements,
    };
  }

  // Helper methods
  private estimateDuration(analysis: any): number {
    const baseTime = 10; // 10 minutes base
    const nodeTime = analysis.nodeCount * 3; // 3 minutes per node
    const complexityMultiplier = analysis.complexity === 'advanced' ? 1.5 : 
                                analysis.complexity === 'intermediate' ? 1.2 : 1.0;
    
    return Math.ceil((baseTime + nodeTime) * complexityMultiplier);
  }

  private generatePrerequisites(analysis: any): string[] {
    const prerequisites = ['Basic understanding of automation concepts'];
    
    if (analysis.integrations.includes('api')) {
      prerequisites.push('Familiarity with REST APIs');
    }
    
    if (analysis.complexity === 'advanced') {
      prerequisites.push('Experience with workflow automation tools');
    }
    
    return prerequisites;
  }

  private generateSimulationData(steps: EducationalStep[]) {
    return steps.map(step => ({
      stepId: step.id,
      sampleData: { input: 'Sample input data', output: 'Sample output data' },
      variables: {},
    }));
  }

  private generateFlowConnections(steps: EducationalStep[]) {
    return steps.slice(0, -1).map((step, index) => ({
      source: step.id,
      target: steps[index + 1].id,
      type: 'default',
    }));
  }

  private generateAltText(aid: VisualAid | InteractiveElement): string {
    if ('type' in aid && typeof aid.type === 'string') {
      return `${aid.type} showing workflow visualization`;
    }
    return 'Workflow visualization element';
  }

  private generateDescription(aid: VisualAid | InteractiveElement): string {
    if ('title' in aid) {
      return `Detailed view of ${aid.title} with interactive elements`;
    }
    return 'Interactive workflow element for educational purposes';
  }

  private generateScreenReaderText(element: InteractiveElement): string {
    return `Interactive ${element.type} element: ${element.title}. Use arrow keys to navigate.`;
  }

  private generateAudioDescription(content: any): string {
    if (Array.isArray(content)) {
      return `Audio description: This workflow contains ${content.length} steps. ` +
             content.map((step, i) => `Step ${i + 1}: ${step.title}`).join('. ');
    }
    return 'Audio description available for screen reader users';
  }
}

// Export singleton instance
export const n8nWorkflowAnalyzer = new N8NWorkflowAnalyzer();
