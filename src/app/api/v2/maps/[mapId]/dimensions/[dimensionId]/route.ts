import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { requireAdminFromRequest } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string; dimensionId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// PUT /api/v2/maps/:mapId/dimensions/:dimensionId - 更新排行榜维度（Admin）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdminFromRequest(request)
    const { mapId, dimensionId } = await params

    const existing = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
    })

    if (!existing || existing.mapId !== mapId) {
      return v2NotFound(request, '排行榜维度')
    }

    const body = await request.json()
    const name =
      body?.name === undefined || body?.name === null
        ? undefined
        : String(body.name).trim()
    const unit =
      body?.unit === undefined || body?.unit === null
        ? undefined
        : String(body.unit).trim()
    const sortOrder =
      body?.sortOrder === undefined || body?.sortOrder === null
        ? undefined
        : String(body.sortOrder).toUpperCase()

    if (name !== undefined && !name) {
      return v2Error(request, '维度名称不能为空', 400)
    }
    if (sortOrder && sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return v2Error(request, 'sortOrder 仅支持 ASC 或 DESC', 400)
    }

    const dimension = await prisma.leaderboardDimension.update({
      where: { id: dimensionId },
      data: {
        name: name ?? existing.name,
        unit: unit === undefined ? existing.unit : unit || null,
        sortOrder: (sortOrder ?? existing.sortOrder) as string,
      },
    })

    return v2Json(request, dimension)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// DELETE /api/v2/maps/:mapId/dimensions/:dimensionId - 删除排行榜维度（Admin）
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    requireAdminFromRequest(request)
    const { mapId, dimensionId } = await params

    const existing = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
    })

    if (!existing || existing.mapId !== mapId) {
      return v2NotFound(request, '排行榜维度')
    }

    await prisma.leaderboardDimension.delete({ where: { id: dimensionId } })
    return v2Json(request, null, 204)
  } catch (error) {
    return v2HandleError(request, error)
  }
}
