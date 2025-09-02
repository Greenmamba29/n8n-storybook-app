import { NextRequest, NextResponse } from 'next/server'

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  services: {
    [key: string]: ServiceStatus
  }
  performance: {
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: number
    responseTime: number
    requestCount: number
    errorRate: number
  }
  agents: {
    [key: string]: AgentStatus
  }
  database: DatabaseStatus
  external: {
    [key: string]: ExternalServiceStatus
  }
}

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  lastCheck: string
  error?: string
}

interface AgentStatus {
  status: 'active' | 'idle' | 'error' | 'disabled'
  responseTime: number
  successRate: number
  queueSize: number
  lastActivity: string
  error?: string
}

interface DatabaseStatus {
  status: 'connected' | 'disconnected' | 'error'
  responseTime: number
  connections: {
    active: number
    idle: number
    total: number
  }
  lastQuery: string
}

interface ExternalServiceStatus {
  status: 'available' | 'degraded' | 'unavailable'
  responseTime: number
  lastCheck: string
  endpoint: string
  error?: string
}

let requestCount = 0
let errorCount = 0
let startTime = Date.now()

export async function GET(request: NextRequest) {
  const checkStartTime = Date.now()
  requestCount++

  try {
    console.log('🏥 Running system health check...')

    // Check system performance
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    // Check core services
    const services = await checkCoreServices()
    
    // Check AI agents
    const agents = await checkAgents()
    
    // Check database connectivity
    const database = await checkDatabase()
    
    // Check external services
    const external = await checkExternalServices()
    
    // Calculate overall health status
    const overallStatus = calculateOverallStatus(services, agents, database, external)
    
    const responseTime = Date.now() - checkStartTime
    const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime,
      services,
      performance: {
        memoryUsage,
        cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
        responseTime,
        requestCount,
        errorRate
      },
      agents,
      database,
      external
    }

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 207 : 503

    return NextResponse.json(response, { status: httpStatus })

  } catch (error) {
    errorCount++
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 503 })
  }
}

// Detailed health check with specific service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service } = body

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service name is required'
      }, { status: 400 })
    }

    console.log(`🔍 Running detailed health check for ${service}...`)

    let result: any = {}

    switch (service) {
      case 'agents':
        result = await performDetailedAgentCheck()
        break
      case 'database':
        result = await performDetailedDatabaseCheck()
        break
      case 'external':
        result = await performDetailedExternalCheck()
        break
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown service: ${service}`
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      service,
      timestamp: new Date().toISOString(),
      details: result
    })

  } catch (error) {
    console.error('Detailed health check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Detailed health check failed'
    }, { status: 500 })
  }
}

// Helper functions
async function checkCoreServices(): Promise<{ [key: string]: ServiceStatus }> {
  const services: { [key: string]: ServiceStatus } = {}

  // Check Next.js API routes
  const apiCheckStart = Date.now()
  try {
    // Simple self-ping to test API responsiveness
    const response = await fetch('http://localhost:3000/api/health/ping', {
      method: 'GET',
      timeout: 5000
    })
    
    services.api = {
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - apiCheckStart,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    services.api = {
      status: 'unhealthy',
      responseTime: Date.now() - apiCheckStart,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'API check failed'
    }
  }

  // Check file system
  const fsCheckStart = Date.now()
  try {
    const fs = await import('fs/promises')
    await fs.access('.')
    
    services.filesystem = {
      status: 'healthy',
      responseTime: Date.now() - fsCheckStart,
      lastCheck: new Date().toISOString()
    }
  } catch (error) {
    services.filesystem = {
      status: 'unhealthy',
      responseTime: Date.now() - fsCheckStart,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Filesystem check failed'
    }
  }

  return services
}

async function checkAgents(): Promise<{ [key: string]: AgentStatus }> {
  const agents: { [key: string]: AgentStatus } = {}

  // Mock agent checks (in production, these would be real agent health checks)
  const agentTypes = [
    'tambo-mcp-router',
    'n8n-analyzer',
    'openai-content',
    'wan22-video',
    'accessibility',
    'quality-assurance'
  ]

  for (const agentType of agentTypes) {
    const checkStart = Date.now()
    
    try {
      // TODO: Replace with actual agent health check
      // const agentHealth = await AgentOrchestrator.checkAgentHealth(agentType)
      
      // Mock successful agent check
      agents[agentType] = {
        status: 'active',
        responseTime: Date.now() - checkStart,
        successRate: Math.random() * 20 + 80, // 80-100%
        queueSize: Math.floor(Math.random() * 10),
        lastActivity: new Date(Date.now() - Math.random() * 60000).toISOString()
      }
    } catch (error) {
      agents[agentType] = {
        status: 'error',
        responseTime: Date.now() - checkStart,
        successRate: 0,
        queueSize: 0,
        lastActivity: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Agent check failed'
      }
    }
  }

  return agents
}

async function checkDatabase(): Promise<DatabaseStatus> {
  const checkStart = Date.now()
  
  try {
    // TODO: Replace with actual database health check
    // const dbHealth = await database.healthCheck()
    
    // Mock successful database check
    return {
      status: 'connected',
      responseTime: Date.now() - checkStart,
      connections: {
        active: 5,
        idle: 10,
        total: 15
      },
      lastQuery: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - checkStart,
      connections: {
        active: 0,
        idle: 0,
        total: 0
      },
      lastQuery: 'never'
    }
  }
}

async function checkExternalServices(): Promise<{ [key: string]: ExternalServiceStatus }> {
  const external: { [key: string]: ExternalServiceStatus } = {}

  const services = [
    { name: 'openai', endpoint: 'https://api.openai.com/v1/models' },
    { name: 'runpod', endpoint: 'https://api.runpod.io/v2' },
    { name: 'github', endpoint: 'https://api.github.com' }
  ]

  for (const service of services) {
    const checkStart = Date.now()
    
    try {
      const response = await fetch(service.endpoint, {
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'n8n-storybook-health-check'
        }
      })

      external[service.name] = {
        status: response.ok ? 'available' : 'degraded',
        responseTime: Date.now() - checkStart,
        lastCheck: new Date().toISOString(),
        endpoint: service.endpoint
      }
    } catch (error) {
      external[service.name] = {
        status: 'unavailable',
        responseTime: Date.now() - checkStart,
        lastCheck: new Date().toISOString(),
        endpoint: service.endpoint,
        error: error instanceof Error ? error.message : 'Service check failed'
      }
    }
  }

  return external
}

function calculateOverallStatus(
  services: { [key: string]: ServiceStatus },
  agents: { [key: string]: AgentStatus },
  database: DatabaseStatus,
  external: { [key: string]: ExternalServiceStatus }
): 'healthy' | 'degraded' | 'unhealthy' {
  let healthyCount = 0
  let totalCount = 0

  // Check services
  for (const service of Object.values(services)) {
    totalCount++
    if (service.status === 'healthy') healthyCount++
  }

  // Check agents
  for (const agent of Object.values(agents)) {
    totalCount++
    if (agent.status === 'active') healthyCount++
  }

  // Check database
  totalCount++
  if (database.status === 'connected') healthyCount++

  // Check external services (less critical)
  for (const service of Object.values(external)) {
    totalCount++
    if (service.status === 'available') healthyCount += 0.5 // Weight external services less
  }

  const healthPercentage = (healthyCount / totalCount) * 100

  if (healthPercentage >= 90) return 'healthy'
  if (healthPercentage >= 70) return 'degraded'
  return 'unhealthy'
}

async function performDetailedAgentCheck() {
  // TODO: Implement detailed agent diagnostics
  return {
    message: 'Detailed agent check not yet implemented',
    timestamp: new Date().toISOString()
  }
}

async function performDetailedDatabaseCheck() {
  // TODO: Implement detailed database diagnostics
  return {
    message: 'Detailed database check not yet implemented',
    timestamp: new Date().toISOString()
  }
}

async function performDetailedExternalCheck() {
  // TODO: Implement detailed external service diagnostics
  return {
    message: 'Detailed external service check not yet implemented',
    timestamp: new Date().toISOString()
  }
}
