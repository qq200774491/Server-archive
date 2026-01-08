import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2, requireAdminFromRequest } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps/:mapId/dimensions - 获取地图排行榜维度（Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await getPlayerFromRequestV2(request)
    const { mapId } = await params

    const dimensions = await prisma.leaderboardDimension.findMany({
      where: { mapId },
      orderBy: { createdAt: 'asc' },
    })

    return v2Json(request, dimensions)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// POST /api/v2/maps/:mapId/dimensions - 创建排行榜维度（Admin）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminFromRequest(request)
    const { mapId } = await params

    const body = await request.json()
    const name = String(body?.name ?? '').trim()
    const unit =
      body?.unit === undefined || body?.unit === null
        ? undefined
        : String(body.unit).trim()
    const sortOrder = String(body?.sortOrder ?? 'DESC').toUpperCase()

    if (!name) return v2Error(request, '维度名称不能为空', 400)
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return v2Error(request, 'sortOrder 仅支持 ASC 或 DESC', 400)
    }

    const map = await prisma.map.findUnique({ where: { id: mapId } })
    if (!map) return v2NotFound(request, '地图')

    const dimension = await prisma.leaderboardDimension.create({
      data: {
        mapId,
        name,
        unit: unit || null,
        sortOrder,
      },
    })

    return v2Json(request, dimension, 201)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

