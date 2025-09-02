// N8N Integration Service
// Handles N8N workflow processing and analysis

export interface ParsedWorkflow {
  id: string
  name: string
  nodes: any[]
  connections: any
  settings: any
  createdAt?: string
  updatedAt?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ComplexityAnalysis {
  level: 'low' | 'medium' | 'high'
  score: number
  description: string
  estimatedCompletionTime: number
  prerequisites: string[]
  factors: {
    nodeCount: number
    connectionComplexity: number
    dataTransformations: number
    conditionalLogic: number
  }
}

export interface LearningObjective {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  prerequisites: string[]
}

export interface TutorialStructure {
  id: string
  title: string
  description: string
  chapters: Chapter[]
  totalDuration: number
  difficulty: string
}

export interface Chapter {
  id: string
  title: string
  description: string
  content: any[]
  duration: number
  learningObjectives: string[]
}

export class N8NIntegrationService {
  
  async parseWorkflow(workflow: string | object): Promise<ParsedWorkflow> {
    try {
      let workflowData: any
      
      if (typeof workflow === 'string') {
        workflowData = JSON.parse(workflow)
      } else {
        workflowData = workflow
      }

      // Validate basic structure
      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('Invalid workflow: missing or invalid nodes array')
      }

      const parsed: ParsedWorkflow = {
        id: workflowData.id || `wf_${Date.now()}`,
        name: workflowData.name || 'Untitled Workflow',
        nodes: workflowData.nodes,
        connections: workflowData.connections || {},
        settings: workflowData.settings || {},
        createdAt: workflowData.createdAt || new Date().toISOString(),
        updatedAt: workflowData.updatedAt || new Date().toISOString()
      }

      return parsed
    } catch (error) {
      throw new Error(`Failed to parse workflow: ${error}`)
    }
  }

  async validateWorkflow(workflow: ParsedWorkflow): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check for required fields
      if (!workflow.name || workflow.name.trim() === '') {
        warnings.push('Workflow name is empty')
      }

      if (!workflow.nodes || workflow.nodes.length === 0) {
        errors.push('Workflow must contain at least one node')
      }

      // Validate nodes
      for (const node of workflow.nodes) {
        if (!node.id) {
          errors.push('Node missing required id field')
        }
        if (!node.type) {
          errors.push(`Node ${node.id} missing required type field`)
        }
        if (!node.name) {
          warnings.push(`Node ${node.id} missing name field`)
        }
      }

      // Check for disconnected nodes
      const connectedNodeIds = new Set<string>()
      if (workflow.connections) {
        Object.keys(workflow.connections).forEach(nodeId => {
          connectedNodeIds.add(nodeId)
          const nodeConnections = workflow.connections[nodeId]
          Object.values(nodeConnections).forEach((outputs: any) => {
            if (Array.isArray(outputs)) {
              outputs.forEach((connection: any) => {
                if (Array.isArray(connection)) {
                  connection.forEach((conn: any) => {
                    if (conn.node) {
                      connectedNodeIds.add(conn.node)
                    }
                  })
                }
              })
            }
          })
        })
      }

      const disconnectedNodes = workflow.nodes.filter(node => 
        !connectedNodeIds.has(node.id) && node.type !== 'n8n-nodes-base.start'
      )

      if (disconnectedNodes.length > 0) {
        warnings.push(`${disconnectedNodes.length} disconnected nodes found`)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings
      }
    }
  }

  async analyzeComplexity(workflow: ParsedWorkflow): Promise<ComplexityAnalysis> {
    try {
      const factors = {
        nodeCount: workflow.nodes.length,
        connectionComplexity: this.calculateConnectionComplexity(workflow),
        dataTransformations: this.countDataTransformations(workflow),
        conditionalLogic: this.countConditionalLogic(workflow)
      }

      // Calculate complexity score (0-100)
      let score = 0
      
      // Node count factor (0-25 points)
      score += Math.min(factors.nodeCount * 2, 25)
      
      // Connection complexity (0-25 points)  
      score += Math.min(factors.connectionComplexity * 5, 25)
      
      // Data transformations (0-25 points)
      score += Math.min(factors.dataTransformations * 3, 25)
      
      // Conditional logic (0-25 points)
      score += Math.min(factors.conditionalLogic * 5, 25)

      // Determine level and description
      let level: 'low' | 'medium' | 'high'
      let description: string
      let estimatedTime: number
      let prerequisites: string[]

      if (score <= 30) {
        level = 'low'
        description = 'Simple workflow with basic nodes and straightforward logic'
        estimatedTime = 15
        prerequisites = ['Basic N8N knowledge']
      } else if (score <= 70) {
        level = 'medium'
        description = 'Intermediate workflow with some complexity and data transformations'
        estimatedTime = 30
        prerequisites = ['Intermediate N8N knowledge', 'Understanding of data flow']
      } else {
        level = 'high'
        description = 'Complex workflow with advanced logic and multiple integrations'
        estimatedTime = 60
        prerequisites = ['Advanced N8N knowledge', 'API integrations', 'Data transformation']
      }

      return {
        level,
        score,
        description,
        estimatedCompletionTime: estimatedTime,
        prerequisites,
        factors
      }
    } catch (error) {
      // Return default complexity if analysis fails
      return {
        level: 'medium',
        score: 50,
        description: 'Unable to analyze workflow complexity',
        estimatedCompletionTime: 30,
        prerequisites: ['Basic N8N knowledge'],
        factors: {
          nodeCount: workflow.nodes.length,
          connectionComplexity: 0,
          dataTransformations: 0,
          conditionalLogic: 0
        }
      }
    }
  }

  async extractLearningObjectives(workflow: ParsedWorkflow): Promise<LearningObjective[]> {
    const objectives: LearningObjective[] = []

    try {
      // Analyze workflow to extract learning objectives
      const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))]
      
      // Basic workflow structure objective
      objectives.push({
        id: 'workflow-structure',
        title: 'Understand Workflow Structure',
        description: 'Learn how nodes are connected and data flows through the workflow',
        difficulty: 'beginner',
        estimatedTime: 5,
        prerequisites: []
      })

      // Node-specific objectives
      nodeTypes.forEach((nodeType, index) => {
        const nodeTypeName = nodeType.split('.').pop() || nodeType
        objectives.push({
          id: `node-${nodeTypeName}`,
          title: `Master ${nodeTypeName} Node`,
          description: `Learn how to configure and use the ${nodeTypeName} node effectively`,
          difficulty: this.getNodeDifficulty(nodeType),
          estimatedTime: 10,
          prerequisites: index === 0 ? ['workflow-structure'] : [`node-${nodeTypes[index - 1].split('.').pop()}`]
        })
      })

      // Data transformation objective if applicable
      if (this.hasDataTransformations(workflow)) {
        objectives.push({
          id: 'data-transformation',
          title: 'Data Transformation Techniques',
          description: 'Learn how to transform and manipulate data between nodes',
          difficulty: 'intermediate',
          estimatedTime: 15,
          prerequisites: ['workflow-structure']
        })
      }

      return objectives
    } catch (error) {
      // Return default objectives if extraction fails
      return [{
        id: 'basic-workflow',
        title: 'Basic Workflow Understanding',
        description: 'Learn the fundamentals of this N8N workflow',
        difficulty: 'beginner',
        estimatedTime: 20,
        prerequisites: ['Basic N8N knowledge']
      }]
    }
  }

  async generateTutorialStructure(workflow: ParsedWorkflow): Promise<TutorialStructure> {
    try {
      const complexity = await this.analyzeComplexity(workflow)
      const objectives = await this.extractLearningObjectives(workflow)
      
      const chapters: Chapter[] = []
      
      // Introduction chapter
      chapters.push({
        id: 'introduction',
        title: 'Introduction',
        description: `Welcome to this ${complexity.level}-complexity N8N workflow tutorial`,
        content: [
          {
            type: 'text',
            content: `This tutorial will guide you through understanding and building the "${workflow.name}" workflow. You'll learn step-by-step how each component works together to create a powerful automation.`
          }
        ],
        duration: 5,
        learningObjectives: ['workflow-structure']
      })

      // Node-by-node chapters
      const groupedNodes = this.groupNodesByFunction(workflow)
      Object.entries(groupedNodes).forEach(([groupName, nodes]) => {
        chapters.push({
          id: `chapter-${groupName.toLowerCase().replace(/\s+/g, '-')}`,
          title: groupName,
          description: `Learn about ${groupName.toLowerCase()} in this workflow`,
          content: nodes.map(node => ({
            type: 'node-explanation',
            content: {
              node,
              explanation: this.generateNodeExplanation(node),
              configuration: node.parameters || {}
            }
          })),
          duration: Math.max(nodes.length * 5, 10),
          learningObjectives: objectives.filter(obj => 
            obj.id.includes('node') && 
            nodes.some(node => obj.id.includes(node.type.split('.').pop() || ''))
          ).map(obj => obj.id)
        })
      })

      // Summary chapter
      chapters.push({
        id: 'summary',
        title: 'Summary & Next Steps',
        description: 'Review what you\'ve learned and explore next steps',
        content: [
          {
            type: 'text',
            content: 'Congratulations! You\'ve successfully learned how to build and understand this N8N workflow. Here\'s a summary of key concepts and suggestions for next steps.'
          }
        ],
        duration: 5,
        learningObjectives: []
      })

      return {
        id: `tutorial-${workflow.id}`,
        title: `Learn: ${workflow.name}`,
        description: `Interactive tutorial for understanding the "${workflow.name}" N8N workflow`,
        chapters,
        totalDuration: chapters.reduce((total, chapter) => total + chapter.duration, 0),
        difficulty: complexity.level
      }
    } catch (error) {
      // Return basic structure if generation fails
      return {
        id: `tutorial-${workflow.id}`,
        title: `Learn: ${workflow.name}`,
        description: 'Interactive N8N workflow tutorial',
        chapters: [{
          id: 'basic',
          title: 'Workflow Overview',
          description: 'Basic overview of the workflow',
          content: [{ type: 'text', content: 'Learn about this N8N workflow' }],
          duration: 15,
          learningObjectives: []
        }],
        totalDuration: 15,
        difficulty: 'medium'
      }
    }
  }

  // Private helper methods
  private calculateConnectionComplexity(workflow: ParsedWorkflow): number {
    if (!workflow.connections) return 0
    
    let complexity = 0
    Object.values(workflow.connections).forEach((nodeConnections: any) => {
      Object.values(nodeConnections).forEach((outputs: any) => {
        if (Array.isArray(outputs)) {
          outputs.forEach((connection: any) => {
            if (Array.isArray(connection)) {
              complexity += connection.length
            }
          })
        }
      })
    })
    return complexity
  }

  private countDataTransformations(workflow: ParsedWorkflow): number {
    return workflow.nodes.filter(node => 
      node.type.includes('set') || 
      node.type.includes('function') ||
      node.type.includes('code') ||
      (node.parameters && Object.keys(node.parameters).some(key => 
        key.includes('expression') || key.includes('transform')
      ))
    ).length
  }

  private countConditionalLogic(workflow: ParsedWorkflow): number {
    return workflow.nodes.filter(node =>
      node.type.includes('if') ||
      node.type.includes('switch') ||
      node.type.includes('router') ||
      (node.parameters && Object.keys(node.parameters).some(key =>
        key.includes('condition') || key.includes('rule')
      ))
    ).length
  }

  private getNodeDifficulty(nodeType: string): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerNodes = ['webhook', 'http-request', 'set', 'start', 'schedule-trigger']
    const advancedNodes = ['function', 'code', 'if', 'switch', 'merge']
    
    const typeName = nodeType.split('.').pop()?.toLowerCase() || ''
    
    if (beginnerNodes.some(node => typeName.includes(node))) {
      return 'beginner'
    } else if (advancedNodes.some(node => typeName.includes(node))) {
      return 'advanced'
    }
    return 'intermediate'
  }

  private hasDataTransformations(workflow: ParsedWorkflow): boolean {
    return this.countDataTransformations(workflow) > 0
  }

  private groupNodesByFunction(workflow: ParsedWorkflow): Record<string, any[]> {
    const groups: Record<string, any[]> = {
      'Triggers': [],
      'Actions': [],
      'Logic': [],
      'Transformations': []
    }

    workflow.nodes.forEach(node => {
      const nodeType = node.type.toLowerCase()
      
      if (nodeType.includes('trigger') || nodeType.includes('webhook') || nodeType.includes('schedule')) {
        groups['Triggers'].push(node)
      } else if (nodeType.includes('if') || nodeType.includes('switch') || nodeType.includes('router')) {
        groups['Logic'].push(node)
      } else if (nodeType.includes('set') || nodeType.includes('function') || nodeType.includes('code')) {
        groups['Transformations'].push(node)
      } else {
        groups['Actions'].push(node)
      }
    })

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key]
      }
    })

    return groups
  }

  private generateNodeExplanation(node: any): string {
    const nodeType = node.type.split('.').pop() || node.type
    const nodeName = node.name || nodeType
    
    return `The ${nodeName} node (${nodeType}) is ${this.getNodeDescription(node.type)}. This node is configured with specific parameters to handle data processing in the workflow.`
  }

  private getNodeDescription(nodeType: string): string {
    const descriptions: Record<string, string> = {
      'webhook': 'used to receive HTTP requests and trigger the workflow',
      'http-request': 'used to make HTTP requests to external APIs',
      'set': 'used to set or modify data values',
      'if': 'used for conditional logic and branching',
      'function': 'used to execute custom JavaScript code',
      'schedule-trigger': 'used to trigger the workflow on a schedule',
      'start': 'the entry point that starts the workflow execution'
    }

    const typeName = nodeType.split('.').pop()?.toLowerCase() || ''
    return descriptions[typeName] || 'used to process data in the workflow'
  }
}
