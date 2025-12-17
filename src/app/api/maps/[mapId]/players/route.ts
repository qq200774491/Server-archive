import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPaginationParams, paginatedResponse, errorResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

// GET /api/maps/:mapId/players - 获取地图玩家列表
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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
            select: {
              archives: true,
            },
          },
        },
      }),
      prisma.mapPlayer.count({ where: { mapId } }),
    ])

    return Response.json(paginatedResponse(mapPlayers, total, page, limit))
  } catch (error) {
    console.error('Error fetching map players:', error)
    return errorResponse('获取地图玩家列表失败', 500)
  }
}
