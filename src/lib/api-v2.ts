import type { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth-v2'
import { withCors } from '@/lib/cors'

export function v2Json(request: NextRequest, data: unknown, status = 200): Response {
  if (status === 204) return withCors(new Response(null, { status }), request)
  return withCors(Response.json(data, { status }), request)
}

export function v2Error(
  request: NextRequest,
  message: string,
  status: number = 400
): Response {
  return v2Json(request, { error: message }, status)
}

export function v2NotFound(request: NextRequest, resource: string = '资源'): Response {
  return v2Error(request, `${resource}不存在`, 404)
}

export function v2HandleError(request: NextRequest, error: unknown): Response {
  if (error instanceof AuthError) return v2Error(request, error.message, error.status)
  if (error instanceof Error) return v2Error(request, error.message, 400)
  return v2Error(request, '服务器内部错误', 500)
}
