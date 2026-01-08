import { NextRequest } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth-v2'
import { getAdminSummary } from '@/lib/admin-summary'
import { corsPreflightResponse } from '@/lib/cors'
import { v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/admin/summary - 管理端汇总数据
export async function GET(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
    const summary = await getAdminSummary()
    return v2Json(request, summary)
  } catch (error) {
    return v2HandleError(request, error)
  }
}
