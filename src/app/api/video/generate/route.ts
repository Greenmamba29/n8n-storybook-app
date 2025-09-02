import { NextRequest, NextResponse } from 'next/server'
import { VideoGenerationService } from '@/lib/video-generation'

interface VideoGenerationRequest {
  storybookId: string
  options: {
    resolution: '720p' | '1080p' | '4k'
    duration: number
    voiceNarration: boolean
    subtitles: boolean
    language: string
    style: 'modern' | 'classic' | 'minimalist'
    accessibility: {
      audioDescriptions: boolean
      closedCaptions: boolean
      highContrast: boolean
    }
  }
  runpodConfig?: {
    gpu_type: 'RTX_4090' | 'A100' | 'V100'
    timeout: number
    priority: 'low' | 'normal' | 'high'
  }
}

interface VideoGenerationResponse {
  success: boolean
  videoId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  video?: {
    id: string
    url: string
    duration: number
    resolution: string
    fileSize: number
    format: string
    accessibility: {
      subtitlesUrl?: string
      audioDescriptionUrl?: string
      transcriptUrl?: string
    }
  }
  processingTime?: number
  estimatedCompletion?: string
  runpodJobId?: string
  error?: string
}

interface VideoStatusResponse {
  success: boolean
  videoId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStage: string
  estimatedTimeRemaining?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VideoGenerationRequest = await request.json()
    const { storybookId, options, runpodConfig } = body

    // Validate request
    if (!storybookId) {
      return NextResponse.json({
        success: false,
        error: 'Storybook ID is required'
      }, { status: 400 })
    }

    const videoService = new VideoGenerationService()
    const videoId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    console.log('🎥 Starting video generation process...')

    // Step 1: Fetch storybook data
    console.log('📖 Fetching storybook data...')
    const storybook = await fetchStorybookData(storybookId)
    if (!storybook) {
      return NextResponse.json({
        success: false,
        error: 'Storybook not found'
      }, { status: 404 })
    }

    // Step 2: Generate video script
    console.log('📝 Generating video script...')
    const videoScript = await videoService.generateScript(storybook, options)
    
    // Step 3: Generate audio narration if requested
    let audioTrack = null
    if (options.voiceNarration) {
      console.log('🔊 Generating audio narration...')
      audioTrack = await videoService.synthesizeAudio(videoScript.narration, {
        language: options.language || 'en',
        voice: 'neural',
        speed: 'normal'
      })
    }

    // Step 4: Generate subtitles
    let subtitleTracks = []
    if (options.subtitles && audioTrack) {
      console.log('📝 Generating subtitles...')
      subtitleTracks = await videoService.generateSubtitles(audioTrack, {
        language: options.language || 'en',
        includeTimestamps: true,
        accessibility: options.accessibility.closedCaptions
      })
    }

    // Step 5: Set up RunPod configuration
    const runpodJobConfig = {
      gpu_type: runpodConfig?.gpu_type || 'RTX_4090',
      timeout: runpodConfig?.timeout || 300000, // 5 minutes
      priority: runpodConfig?.priority || 'normal',
      container: 'wan2.2-video-generation',
      environment: {
        RESOLUTION: options.resolution,
        STYLE: options.style,
        LANGUAGE: options.language,
        ACCESSIBILITY_MODE: options.accessibility.highContrast ? 'true' : 'false'
      }
    }

    // Step 6: Submit to RunPod for video generation
    console.log('☁️ Submitting to RunPod GPU cloud...')
    const runpodJob = await videoService.submitToRunPod({
      script: videoScript,
      audioTrack,
      subtitles: subtitleTracks,
      config: runpodJobConfig,
      videoId
    })

    if (!runpodJob.success) {
      throw new Error(`RunPod submission failed: ${runpodJob.error}`)
    }

    // Store video generation job (in production, this would go to database)
    const videoRecord = {
      id: videoId,
      storybookId,
      status: 'queued',
      runpodJobId: runpodJob.jobId,
      options,
      script: videoScript,
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + (runpodJobConfig.timeout || 300000)).toISOString()
    }

    // TODO: Store in database
    // await database.videos.create(videoRecord)

    // Return immediate response
    const response: VideoGenerationResponse = {
      success: true,
      videoId,
      status: 'queued',
      runpodJobId: runpodJob.jobId,
      estimatedCompletion: videoRecord.estimatedCompletion
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start video generation'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('id')
  
  if (!videoId) {
    return NextResponse.json({
      success: false,
      error: 'Video ID is required'
    }, { status: 400 })
  }

  try {
    const videoService = new VideoGenerationService()
    
    // TODO: Fetch from database
    // const videoRecord = await database.videos.findById(videoId)
    
    // Mock video record for now
    const videoRecord = {
      id: videoId,
      status: 'completed',
      runpodJobId: 'runpod_123',
      createdAt: new Date().toISOString()
    }

    // Check RunPod job status
    const runpodStatus = await videoService.checkRunPodStatus(videoRecord.runpodJobId)
    
    let response: VideoStatusResponse = {
      success: true,
      videoId,
      status: runpodStatus.status,
      progress: runpodStatus.progress || 0,
      currentStage: runpodStatus.currentStage || 'initializing'
    }

    // If completed, include video details
    if (runpodStatus.status === 'completed' && runpodStatus.output) {
      response = {
        ...response,
        video: {
          id: videoId,
          url: runpodStatus.output.videoUrl,
          duration: runpodStatus.output.duration,
          resolution: runpodStatus.output.resolution,
          fileSize: runpodStatus.output.fileSize,
          format: runpodStatus.output.format,
          accessibility: {
            subtitlesUrl: runpodStatus.output.subtitlesUrl,
            audioDescriptionUrl: runpodStatus.output.audioDescriptionUrl,
            transcriptUrl: runpodStatus.output.transcriptUrl
          }
        }
      }
    }

    if (runpodStatus.status === 'failed') {
      response.error = runpodStatus.error
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Video status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check video status'
    }, { status: 500 })
  }
}

// Cancel video generation
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('id')
  
  if (!videoId) {
    return NextResponse.json({
      success: false,
      error: 'Video ID is required'
    }, { status: 400 })
  }

  try {
    const videoService = new VideoGenerationService()
    
    // TODO: Fetch from database
    // const videoRecord = await database.videos.findById(videoId)
    
    // Cancel RunPod job
    const cancellationResult = await videoService.cancelRunPodJob(videoId)
    
    if (cancellationResult.success) {
      // TODO: Update database
      // await database.videos.update(videoId, { status: 'cancelled' })
      
      return NextResponse.json({
        success: true,
        message: 'Video generation cancelled successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel video generation'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Video cancellation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel video generation'
    }, { status: 500 })
  }
}

// Helper function to fetch storybook data
async function fetchStorybookData(storybookId: string) {
  try {
    // TODO: Fetch from database
    // return await database.storybooks.findById(storybookId)
    
    // Mock storybook data for now
    return {
      id: storybookId,
      title: 'Sample Interactive Storybook',
      description: 'Learn N8N workflows step by step',
      chapters: [
        {
          id: 'chapter_1',
          title: 'Introduction to N8N',
          content: [
            {
              type: 'text',
              content: 'Welcome to this N8N workflow tutorial...',
              metadata: { duration: 30 }
            },
            {
              type: 'code',
              content: '{"nodes": [{"id": "1", "type": "webhook"}]}',
              metadata: { duration: 45, codeLanguage: 'json' }
            }
          ],
          duration: 75
        }
      ],
      metadata: {
        estimatedDuration: 300,
        difficulty: 'beginner',
        learningObjectives: ['Understand N8N basics', 'Create simple workflows']
      }
    }
  } catch (error) {
    console.error('Error fetching storybook:', error)
    return null
  }
}

// Webhook endpoint for RunPod callbacks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, status, output, error } = body

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-runpod-signature')
    // if (!verifyWebhookSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // TODO: Update database with job status
    // await database.videos.updateByRunPodJobId(jobId, {
    //   status,
    //   output,
    //   error,
    //   completedAt: status === 'completed' ? new Date() : null
    // })

    console.log(`📹 Video generation ${status} for job ${jobId}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('RunPod webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook'
    }, { status: 500 })
  }
}
