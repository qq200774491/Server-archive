import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAdminFromRequest } from '@/lib/auth-v2'
import {
  buildAdminSessionCookieHeader,
  createAdminSessionToken,
  updateAdminCredentials,
} from '@/lib/admin-auth'
import { corsPreflightResponse } from '@/lib/cors'
import { v2Error, v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// PUT /api/admin/credentials - 更新管理员账号密码
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminFromRequest(request)
    const body = await request.json()
    const currentPassword = String(body?.currentPassword ?? '').trim()
    const nextUsernameRaw =
      body?.username === undefined || body?.username === null
        ? undefined
        : String(body.username).trim()
    const nextPasswordRaw =
      body?.password === undefined || body?.password === null
        ? undefined
        : String(body.password).trim()

    const nextUsername = nextUsernameRaw || undefined
    const nextPassword = nextPasswordRaw || undefined

    if (!currentPassword) return v2Error(request, '请输入当前密码', 400)
    if (!nextUsername && !nextPassword) {
      return v2Error(request, '请至少修改账号或密码', 400)
    }
    if (nextPassword && nextPassword.length < 8) {
      return v2Error(request, '新密码至少 8 位', 400)
    }

    if (nextUsername && nextUsername !== admin.username) {
      const existing = await prisma.adminUser.findUnique({
        where: { username: nextUsername },
        select: { id: true },
      })
      if (existing) return v2Error(request, '该账号已存在', 400)
    }

    const updated = await updateAdminCredentials({
      adminId: admin.id,
      currentPassword,
      newUsername: nextUsername,
      newPassword: nextPassword,
    })

    if (!updated) return v2Error(request, '当前密码错误', 401)

    const token = createAdminSessionToken({
      adminId: updated.id,
      sessionVersion: updated.sessionVersion,
    })

    const response = v2Json(request, {
      admin: { id: updated.id, username: updated.username },
    })
    response.headers.set('Set-Cookie', buildAdminSessionCookieHeader(token))
    return response
  } catch (error) {
    return v2HandleError(request, error)
  }
}
