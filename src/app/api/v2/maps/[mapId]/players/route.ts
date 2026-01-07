import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2HandleError, v2Json } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps/:mapId/players - 获取地图玩家列表（Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await getPlayerFromRequestV2(request)
    const { mapId } = await params
    const { page, limit, skip } = getPaginationParams(request)

    const [mapPlayers, total] = await Promise.all([
      prisma.mapPlayer.findMany({
        where: { mapId },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: {
          player: true,
          _count: {
            select: { archives: true },
          },
        },
      }),
      prisma.mapPlayer.count({ where: { mapId } }),
    ])

    return v2Json(request, paginatedResponse(mapPlayers, total, page, limit))
  } catch (error) {
    return v2HandleError(request, error)
  }
}

