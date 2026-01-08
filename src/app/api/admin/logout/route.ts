import { NextRequest } from 'next/server'
import { buildAdminSessionClearCookieHeader } from '@/lib/admin-auth'
import { corsPreflightResponse } from '@/lib/cors'
import { v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// POST /api/admin/logout - 管理员退出登录
export async function POST(request: NextRequest) {
  try {
    const response = v2Json(request, null, 204)
    response.headers.set('Set-Cookie', buildAdminSessionClearCookieHeader())
    return response
  } catch (error) {
    return v2HandleError(request, error)
  }
}
