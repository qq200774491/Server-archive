import type { NextRequest } from 'next/server'

const DEFAULT_ALLOWED_HEADERS = [
  'Authorization',
  'Content-Type',
  'X-Admin-Token',
].join(', ')

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].join(
  ', '
)

function getAllowedOrigin(request: NextRequest): string {
  const configured = process.env.CORS_ALLOWED_ORIGINS?.trim()
  if (!configured || configured === '*') return '*'

  const origin = request.headers.get('origin')
  if (!origin) return '*'

  const allowed = configured
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return allowed.includes(origin) ? origin : 'null'
}

export function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = getAllowedOrigin(request)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
    'Access-Control-Max-Age': '86400',
  }

  if (origin !== '*') headers['Vary'] = 'Origin'

  return headers
}

export function withCors(response: Response, request: NextRequest): Response {
  const headers = new Headers(response.headers)
  const extra = corsHeaders(request)
  for (const [key, value] of Object.entries(extra)) headers.set(key, value)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function corsPreflightResponse(request: NextRequest): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}

