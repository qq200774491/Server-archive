import { NextRequest } from 'next/server'
import {
  buildAdminSessionCookieHeader,
  createAdminSessionToken,
  ensureAdminBootstrap,
  verifyAdminCredentials,
} from '@/lib/admin-auth'
import { corsPreflightResponse } from '@/lib/cors'
import { v2Error, v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// POST /api/admin/login - 管理员登录（用户名 + 密码）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = String(body?.username ?? '').trim()
    const password = String(body?.password ?? '').trim()

    if (!username || !password) {
      return v2Error(request, '请输入账号与密码', 400)
    }

    const bootstrap = await ensureAdminBootstrap()
    if (!bootstrap) {
      return v2Error(request, '管理员账户未初始化，请配置环境变量', 500)
    }

    const admin = await verifyAdminCredentials({ username, password })
    if (!admin) return v2Error(request, '账号或密码错误', 401)

    const token = createAdminSessionToken({
      adminId: admin.id,
      sessionVersion: admin.sessionVersion,
    })

    const response = v2Json(request, {
      admin: { id: admin.id, username: admin.username },
    })

    response.headers.set('Set-Cookie', buildAdminSessionCookieHeader(token))
    return response
  } catch (error) {
    return v2HandleError(request, error)
  }
}
