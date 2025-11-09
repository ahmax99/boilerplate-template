import { NextResponse } from 'next/server'

import { env } from '@/config/env'
import { checkBackendHealth } from '@/utils/checkHealth'

interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
  environment: string
  services: {
    backend: {
      status: 'up' | 'down'
      url: string
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  try {
    const backendUrl = env.API_URL
    const backendStatus = await checkBackendHealth(backendUrl)

    const duration = Date.now() - startTime
    console.log(
      `[Health Check] Status: ${backendStatus === 'up' ? 'OK' : 'ERROR'} - Backend: ${backendStatus} - Duration: ${duration}ms`
    )

    const healthCheck: HealthCheckResponse = {
      status: backendStatus === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      services: {
        backend: {
          status: backendStatus,
          url: backendUrl
        }
      }
    }

    return NextResponse.json(healthCheck, {
      status: backendStatus === 'up' ? 200 : 503
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[Health Check] ERROR - Duration: ${duration}ms - ${error instanceof Error ? error.message : 'Unknown error'}`
    )

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
