import { NextRequest, NextResponse } from 'next/server'
import { AgentOrchestrator } from '@/lib/agent-orchestrator'

interface GenerationRequest {
  workflowId: string
  options: {
    accessibilityLevel: 'AA' | 'AAA'
    targetAudience: 'beginner' | 'intermediate' | 'advanced'
    includeVideo: boolean
    includeQuizzes: boolean
    includeInteractiveElements: boolean
    customizations?: {
      theme?: 'light' | 'dark' | 'auto'
      language?: string
      voiceNarration?: boolean
    }
  }
  format: 'web' | 'pdf' | 'video' | 'all'
}

interface GenerationResponse {
  success: boolean
  storybookId: string
  storybook: {
    id: string
    title: string
    description: string
    chapters: Chapter[]
    metadata: {
      estimatedDuration: number
      difficulty: string
      learningObjectives: string[]
      prerequisites: string[]
    }
    accessibility: {
      level: string
      features: string[]
      complianceScore: number
    }
  }
  generationTime: number
  urls: {
    interactive?: string
    pdf?: string
    video?: string
  }
  error?: string
}

interface Chapter {
  id: string
  title: string
  description: string
  content: ChapterContent[]
  duration: number
  interactiveElements: InteractiveElement[]
  quiz?: Quiz
}

interface ChapterContent {
  type: 'text' | 'image' | 'code' | 'video' | 'interactive'
  content: string
  metadata: {
    altText?: string
    transcript?: string
    codeLanguage?: string
  }
}

interface InteractiveElement {
  id: string
  type: 'button' | 'input' | 'drag-drop' | 'simulation'
  config: any
  accessibility: {
    ariaLabel: string
    keyboardSupport: boolean
    screenReaderInstructions: string
  }
}

interface Quiz {
  id: string
  questions: Question[]
  passingScore: number
}

interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  accessibility: {
    screenReaderText: string
    keyboardNavigation: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json()
    const { workflowId, options, format } = body

    // Validate request
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: 'Workflow ID is required'
      }, { status: 400 })
    }

    const startTime = Date.now()
    const orchestrator = new AgentOrchestrator()
    
    // Initialize agents
    await orchestrator.initializeAgents()

    // Generate unique storybook ID
    const storybookId = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Step 1: Analyze workflow with N8N Analyzer Agent
    console.log('🔍 Analyzing workflow...')
    const workflowAnalysis = await orchestrator.routeRequest({
      type: 'workflow-analysis',
      agentType: 'n8n-analyzer',
      payload: {
        workflowId,
        options: {
          depth: 'comprehensive',
          includeComplexityAnalysis: true,
          generateLearningPath: true
        }
      }
    })

    if (!workflowAnalysis.success) {
      throw new Error(`Workflow analysis failed: ${workflowAnalysis.error}`)
    }

    // Step 2: Generate content with OpenAI Agent
    console.log('✍️ Generating educational content...')
    const contentGeneration = await orchestrator.routeRequest({
      type: 'content-generation',
      agentType: 'openai-content',
      payload: {
        workflowAnalysis: workflowAnalysis.data,
        options: {
          targetAudience: options.targetAudience,
          includeQuizzes: options.includeQuizzes,
          includeInteractiveElements: options.includeInteractiveElements,
          accessibilityLevel: options.accessibilityLevel,
          language: options.customizations?.language || 'en'
        }
      }
    })

    if (!contentGeneration.success) {
      throw new Error(`Content generation failed: ${contentGeneration.error}`)
    }

    // Step 3: Enhance accessibility with Accessibility Agent
    console.log('♿ Enhancing accessibility...')
    const accessibilityEnhancement = await orchestrator.routeRequest({
      type: 'accessibility-enhancement',
      agentType: 'accessibility',
      payload: {
        content: contentGeneration.data,
        level: options.accessibilityLevel,
        requirements: {
          screenReader: true,
          keyboardNavigation: true,
          colorContrast: true,
          textAlternatives: true
        }
      }
    })

    if (!accessibilityEnhancement.success) {
      throw new Error(`Accessibility enhancement failed: ${accessibilityEnhancement.error}`)
    }

    // Step 4: Generate video if requested
    let videoGeneration: any = null
    if (options.includeVideo) {
      console.log('🎥 Generating educational video...')
      videoGeneration = await orchestrator.routeRequest({
        type: 'video-generation',
        agentType: 'wan22-video',
        payload: {
          storybook: accessibilityEnhancement.data,
          options: {
            resolution: '1080p',
            voiceNarration: options.customizations?.voiceNarration || false,
            subtitles: true,
            chapters: true
          }
        }
      })
    }

    // Step 5: Quality assurance check
    console.log('✅ Running quality assurance...')
    const qualityCheck = await orchestrator.routeRequest({
      type: 'quality-assurance',
      agentType: 'quality',
      payload: {
        storybook: accessibilityEnhancement.data,
        video: videoGeneration?.data,
        requirements: {
          technicalAccuracy: true,
          educationalEffectiveness: true,
          accessibilityCompliance: true,
          userExperience: true
        }
      }
    })

    // Build final storybook structure
    const storybook = {
      id: storybookId,
      title: workflowAnalysis.data.workflow.name || 'Interactive N8N Workflow Tutorial',
      description: workflowAnalysis.data.summary || 'Learn this N8N workflow step by step',
      chapters: contentGeneration.data.chapters.map((chapter: any, index: number) => ({
        id: `chapter_${index + 1}`,
        title: chapter.title,
        description: chapter.description,
        content: chapter.content,
        duration: chapter.estimatedDuration || 5,
        interactiveElements: chapter.interactiveElements || [],
        quiz: chapter.quiz || null
      })),
      metadata: {
        estimatedDuration: contentGeneration.data.totalDuration || 15,
        difficulty: workflowAnalysis.data.complexity?.level || 'medium',
        learningObjectives: workflowAnalysis.data.learningObjectives || [],
        prerequisites: workflowAnalysis.data.prerequisites || []
      },
      accessibility: {
        level: options.accessibilityLevel,
        features: accessibilityEnhancement.data.features || [],
        complianceScore: accessibilityEnhancement.data.score || 95
      }
    }

    // Generate URLs for different formats
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const urls = {
      interactive: `${baseUrl}/storybook/${storybookId}`,
      ...(format === 'pdf' || format === 'all') && {
        pdf: `${baseUrl}/api/storybook/${storybookId}/export/pdf`
      },
      ...(videoGeneration?.success && (format === 'video' || format === 'all')) && {
        video: videoGeneration.data.videoUrl
      }
    }

    // Store storybook (in production, this would go to database)
    const storybookRecord = {
      id: storybookId,
      workflowId,
      storybook,
      options,
      createdAt: new Date().toISOString(),
      generationTime: Date.now() - startTime,
      status: 'completed'
    }

    // TODO: Store in database
    // await database.storybooks.create(storybookRecord)

    const generationTime = Date.now() - startTime

    const response: GenerationResponse = {
      success: true,
      storybookId,
      storybook,
      generationTime,
      urls
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Storybook generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate storybook'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const storybookId = searchParams.get('id')
  
  if (!storybookId) {
    return NextResponse.json({
      success: false,
      error: 'Storybook ID is required'
    }, { status: 400 })
  }

  try {
    // TODO: Fetch from database
    // const storybook = await database.storybooks.findById(storybookId)
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      storybook: {
        id: storybookId,
        title: 'Sample Interactive Storybook',
        status: 'completed',
        createdAt: new Date().toISOString(),
        chapters: [
          {
            id: 'chapter_1',
            title: 'Introduction to N8N Workflows',
            description: 'Learn the basics of N8N automation',
            duration: 5
          }
        ]
      }
    })
  } catch (error) {
    console.error('Get storybook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve storybook'
    }, { status: 500 })
  }
}

// Progress tracking endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { storybookId, progress, completedChapters, userAnswers } = body

    if (!storybookId) {
      return NextResponse.json({
        success: false,
        error: 'Storybook ID is required'
      }, { status: 400 })
    }

    // TODO: Update progress in database
    // await database.storybooks.updateProgress(storybookId, {
    //   progress,
    //   completedChapters,
    //   userAnswers,
    //   lastUpdated: new Date()
    // })

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully'
    })

  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update progress'
    }, { status: 500 })
  }
}
