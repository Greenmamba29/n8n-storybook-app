import { NextRequest, NextResponse } from 'next/server'
import { AccessibilityService } from '@/lib/accessibility'

interface AccessibilityCheckRequest {
  content: string | {
    html?: string
    url?: string
    storybookId?: string
  }
  level: 'A' | 'AA' | 'AAA'
  guidelines: string[]
  options?: {
    includeRepairs: boolean
    generateReport: boolean
    checkInteractiveElements: boolean
    validateKeyboardNavigation: boolean
  }
}

interface AccessibilityCheckResponse {
  success: boolean
  checkId: string
  compliance: {
    level: string
    score: number
    passed: boolean
    summary: {
      violations: number
      warnings: number
      passes: number
      incomplete: number
    }
  }
  violations: AccessibilityViolation[]
  warnings: AccessibilityWarning[]
  suggestions: ImprovementSuggestion[]
  repairs?: AccessibilityRepair[]
  report?: {
    url: string
    downloadUrl: string
    format: 'html' | 'pdf' | 'json'
  }
  processingTime: number
  error?: string
}

interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  tags: string[]
  nodes: {
    selector: string
    html: string
    target: string[]
    failureSummary: string
  }[]
}

interface AccessibilityWarning {
  id: string
  description: string
  recommendation: string
  nodes: {
    selector: string
    html: string
  }[]
}

interface ImprovementSuggestion {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: 'structure' | 'navigation' | 'content' | 'interaction'
  description: string
  implementation: string
  codeExample?: string
  estimatedEffort: string
}

interface AccessibilityRepair {
  id: string
  type: 'automatic' | 'suggested'
  description: string
  originalCode: string
  repairedCode: string
  confidence: number
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessibilityCheckRequest = await request.json()
    const { content, level, guidelines, options } = body

    // Validate request
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for accessibility checking'
      }, { status: 400 })
    }

    const startTime = Date.now()
    const accessibilityService = new AccessibilityService()
    const checkId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log('♿ Starting accessibility compliance check...')

    // Prepare content for checking
    let contentToCheck = ''
    let checkType = 'html'

    if (typeof content === 'string') {
      contentToCheck = content
      checkType = 'html'
    } else if (content.html) {
      contentToCheck = content.html
      checkType = 'html'
    } else if (content.url) {
      contentToCheck = content.url
      checkType = 'url'
    } else if (content.storybookId) {
      // Fetch storybook content
      contentToCheck = await fetchStorybookContent(content.storybookId)
      checkType = 'storybook'
    }

    // Step 1: Run basic accessibility tests using axe-core
    console.log('🔍 Running axe-core accessibility tests...')
    const axeResults = await accessibilityService.runAxeTests(contentToCheck, {
      level,
      tags: guidelines,
      checkType
    })

    // Step 2: Additional custom accessibility checks
    console.log('🔧 Running custom accessibility checks...')
    const customChecks = await accessibilityService.runCustomChecks(contentToCheck, {
      checkInteractiveElements: options?.checkInteractiveElements ?? true,
      validateKeyboardNavigation: options?.validateKeyboardNavigation ?? true,
      checkColorContrast: true,
      validateHeadingStructure: true,
      checkFormLabels: true
    })

    // Step 3: Generate improvement suggestions
    console.log('💡 Generating improvement suggestions...')
    const suggestions = await accessibilityService.generateSuggestions(
      axeResults.violations,
      customChecks.issues,
      level
    )

    // Step 4: Generate automatic repairs if requested
    let repairs: AccessibilityRepair[] = []
    if (options?.includeRepairs) {
      console.log('🔧 Generating automatic repairs...')
      repairs = await accessibilityService.generateRepairs(
        axeResults.violations,
        contentToCheck
      )
    }

    // Step 5: Calculate compliance score
    const complianceScore = calculateComplianceScore(
      axeResults.passes.length,
      axeResults.violations.length,
      axeResults.incomplete.length
    )

    // Step 6: Generate detailed report if requested
    let report = null
    if (options?.generateReport) {
      console.log('📊 Generating accessibility report...')
      report = await accessibilityService.generateReport({
        checkId,
        results: axeResults,
        customChecks,
        suggestions,
        repairs,
        level,
        score: complianceScore
      })
    }

    // Store check results (in production, this would go to database)
    const checkRecord = {
      id: checkId,
      content: typeof content === 'string' ? content.substring(0, 1000) : content,
      level,
      results: {
        axe: axeResults,
        custom: customChecks,
        suggestions,
        repairs
      },
      score: complianceScore,
      createdAt: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }

    // TODO: Store in database
    // await database.accessibilityChecks.create(checkRecord)

    const processingTime = Date.now() - startTime

    const response: AccessibilityCheckResponse = {
      success: true,
      checkId,
      compliance: {
        level,
        score: complianceScore,
        passed: complianceScore >= getPassingScore(level),
        summary: {
          violations: axeResults.violations.length,
          warnings: customChecks.warnings.length,
          passes: axeResults.passes.length,
          incomplete: axeResults.incomplete.length
        }
      },
      violations: axeResults.violations.map(formatViolation),
      warnings: customChecks.warnings.map(formatWarning),
      suggestions,
      ...(options?.includeRepairs && { repairs }),
      ...(report && { report }),
      processingTime
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Accessibility check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform accessibility check'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const checkId = searchParams.get('id')
  
  if (!checkId) {
    return NextResponse.json({
      success: false,
      error: 'Check ID is required'
    }, { status: 400 })
  }

  try {
    // TODO: Fetch from database
    // const checkRecord = await database.accessibilityChecks.findById(checkId)
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      check: {
        id: checkId,
        status: 'completed',
        score: 92,
        level: 'AA',
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Get accessibility check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve accessibility check'
    }, { status: 500 })
  }
}

// Helper functions
async function fetchStorybookContent(storybookId: string): Promise<string> {
  try {
    // TODO: Fetch actual storybook content
    // const storybook = await database.storybooks.findById(storybookId)
    // return generateStorybookHTML(storybook)
    
    // Mock HTML content
    return `
      <html>
        <head><title>Sample Storybook</title></head>
        <body>
          <h1>Interactive N8N Workflow Tutorial</h1>
          <p>Learn automation step by step...</p>
          <button>Start Learning</button>
        </body>
      </html>
    `
  } catch (error) {
    throw new Error(`Failed to fetch storybook content: ${error}`)
  }
}

function calculateComplianceScore(passes: number, violations: number, incomplete: number): number {
  const total = passes + violations + incomplete
  if (total === 0) return 100
  
  // Weight violations more heavily
  const score = ((passes - (violations * 2)) / total) * 100
  return Math.max(0, Math.min(100, score))
}

function getPassingScore(level: string): number {
  switch (level) {
    case 'A': return 70
    case 'AA': return 85
    case 'AAA': return 95
    default: return 85
  }
}

function formatViolation(violation: any): AccessibilityViolation {
  return {
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    nodes: violation.nodes.map((node: any) => ({
      selector: node.target.join(' '),
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary
    }))
  }
}

function formatWarning(warning: any): AccessibilityWarning {
  return {
    id: warning.id,
    description: warning.description,
    recommendation: warning.recommendation,
    nodes: warning.nodes.map((node: any) => ({
      selector: node.selector,
      html: node.html
    }))
  }
}
