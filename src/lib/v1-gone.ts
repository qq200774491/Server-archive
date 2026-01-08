import type { NextRequest } from 'next/server'
import { withCors, corsPreflightResponse } from '@/lib/cors'

export function v1Gone(request: NextRequest): Response {
  return withCors(
    Response.json(
      {
        error: 'API v1 已停用，请使用 /api/v2/*',
        migration: {
          auth: {
            admin: 'POST /api/admin/login (session cookie)',
            player: 'Authorization: Bearer',
          },
        },
      },
      { status: 410 }
    ),
    request
  )
}

export function v1Options(request: NextRequest): Response {
  return corsPreflightResponse(request)
}

