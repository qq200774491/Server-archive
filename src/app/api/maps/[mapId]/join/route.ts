import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPlayerFromRequest, unauthorizedResponse } from '@/lib/auth'
import { errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

// POST /api/maps/:mapId/join - 加入地图
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    // 检查地图是否存在
    const map = await prisma.map.findUnique({
      where: { id: mapId },
    })

    if (!map) {
      return notFoundResponse('地图')
    }

    // 查找或创建 MapPlayer
    const mapPlayer = await prisma.mapPlayer.upsert({
      where: {
        mapId_playerId: {
          mapId,
          playerId: player.dbPlayer.id,
        },
      },
      update: {},
      create: {
        mapId,
        playerId: player.dbPlayer.id,
      },
      include: {
        player: true,
        map: true,
      },
    })

    return Response.json(mapPlayer, { status: 201 })
  } catch (error) {
    console.error('Error joining map:', error)
    return errorResponse('加入地图失败', 500)
  }
}
