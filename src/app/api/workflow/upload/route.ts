import { NextRequest, NextResponse } from 'next/server'
import { N8NIntegrationService } from '@/lib/n8n-integration'

interface UploadRequest {
  file?: File
  url?: string
  githubRepo?: {
    owner: string
    repo: string
    path?: string
    branch?: string
  }
  source: 'file' | 'url' | 'github'
}

interface UploadResponse {
  success: boolean
  workflowId: string
  workflow: {
    id: string
    name: string
    nodes: any[]
    connections: any
    complexity: 'low' | 'medium' | 'high'
    estimatedTime: number
  }
  analysis: {
    nodeCount: number
    connectionCount: number
    complexity: string
    learningObjectives: string[]
    prerequisites: string[]
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const n8nService = new N8NIntegrationService()
    
    let workflowData: any = null
    let source = 'file'
    
    // Handle different input formats
    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      const url = formData.get('url') as string
      const githubData = formData.get('github') as string
      
      if (file) {
        const fileContent = await file.text()
        workflowData = JSON.parse(fileContent)
        source = 'file'
      } else if (url) {
        workflowData = await fetchWorkflowFromURL(url)
        source = 'url'
      } else if (githubData) {
        const githubRepo = JSON.parse(githubData)
        workflowData = await fetchWorkflowFromGitHub(githubRepo)
        source = 'github'
      }
    } else {
      // JSON body
      const body = await request.json()
      if (body.url) {
        workflowData = await fetchWorkflowFromURL(body.url)
        source = 'url'
      } else if (body.githubRepo) {
        workflowData = await fetchWorkflowFromGitHub(body.githubRepo)
        source = 'github'
      } else if (body.workflow) {
        workflowData = body.workflow
        source = 'file'
      }
    }

    if (!workflowData) {
      return NextResponse.json({
        success: false,
        error: 'No valid workflow data provided'
      }, { status: 400 })
    }

    // Parse and validate workflow
    const parsedWorkflow = await n8nService.parseWorkflow(workflowData)
    const validationResult = await n8nService.validateWorkflow(parsedWorkflow)
    
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: `Invalid workflow: ${validationResult.errors.join(', ')}`
      }, { status: 400 })
    }

    // Analyze workflow complexity and generate learning structure
    const complexityAnalysis = await n8nService.analyzeComplexity(parsedWorkflow)
    const learningObjectives = await n8nService.extractLearningObjectives(parsedWorkflow)
    const tutorialStructure = await n8nService.generateTutorialStructure(parsedWorkflow)

    // Generate unique workflow ID
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store workflow data (in production, this would go to database)
    const workflowRecord = {
      id: workflowId,
      name: parsedWorkflow.name || 'Untitled Workflow',
      nodes: parsedWorkflow.nodes,
      connections: parsedWorkflow.connections,
      complexity: complexityAnalysis.level,
      estimatedTime: complexityAnalysis.estimatedCompletionTime,
      source,
      createdAt: new Date().toISOString(),
      tutorialStructure,
      learningObjectives
    }

    // TODO: Store in database
    // await database.workflows.create(workflowRecord)

    const response: UploadResponse = {
      success: true,
      workflowId,
      workflow: {
        id: workflowId,
        name: workflowRecord.name,
        nodes: parsedWorkflow.nodes,
        connections: parsedWorkflow.connections,
        complexity: complexityAnalysis.level,
        estimatedTime: complexityAnalysis.estimatedCompletionTime
      },
      analysis: {
        nodeCount: parsedWorkflow.nodes.length,
        connectionCount: Object.keys(parsedWorkflow.connections).length,
        complexity: complexityAnalysis.description,
        learningObjectives: learningObjectives.map(obj => obj.title),
        prerequisites: complexityAnalysis.prerequisites
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Workflow upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process workflow upload'
    }, { status: 500 })
  }
}

// Helper function to fetch workflow from URL
async function fetchWorkflowFromURL(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    } else {
      const text = await response.text()
      return JSON.parse(text)
    }
  } catch (error) {
    throw new Error(`Failed to fetch workflow from URL: ${error}`)
  }
}

// Helper function to fetch workflow from GitHub
async function fetchWorkflowFromGitHub(githubRepo: any) {
  try {
    const { owner, repo, path = '', branch = 'main' } = githubRepo
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    
    const response = await fetch(`${apiUrl}?ref=${branch}`)
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (Array.isArray(data)) {
      // Directory - look for workflow files
      const workflowFiles = data.filter((file: any) => 
        file.name.endsWith('.json') && file.name.toLowerCase().includes('workflow')
      )
      
      if (workflowFiles.length === 0) {
        throw new Error('No workflow files found in repository')
      }
      
      // Get the first workflow file
      const fileResponse = await fetch(workflowFiles[0].download_url)
      return await fileResponse.json()
    } else {
      // Single file
      if (data.download_url) {
        const fileResponse = await fetch(data.download_url)
        return await fileResponse.json()
      } else {
        // Base64 encoded content
        const content = Buffer.from(data.content, 'base64').toString('utf-8')
        return JSON.parse(content)
      }
    }
  } catch (error) {
    throw new Error(`Failed to fetch workflow from GitHub: ${error}`)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workflowId = searchParams.get('id')
  
  if (!workflowId) {
    return NextResponse.json({
      success: false,
      error: 'Workflow ID is required'
    }, { status: 400 })
  }

  try {
    // TODO: Fetch from database
    // const workflow = await database.workflows.findById(workflowId)
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      workflow: {
        id: workflowId,
        name: 'Sample Workflow',
        status: 'uploaded',
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Get workflow error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve workflow'
    }, { status: 500 })
  }
}
