import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPlayerFromRequest, unauthorizedResponse } from '@/lib/auth'
import { errorResponse } from '@/lib/api-utils'

// GET /api/players/me - 获取当前玩家信息
export async function GET(request: NextRequest) {
  try {
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    const playerWithMaps = await prisma.player.findUnique({
      where: { id: player.dbPlayer.id },
      include: {
        mapPlayers: {
          include: {
            map: true,
            _count: {
              select: {
                archives: true,
              },
            },
          },
        },
      },
    })

    return Response.json(playerWithMaps)
  } catch (error) {
    console.error('Error fetching player:', error)
    return errorResponse('获取玩家信息失败', 500)
  }
}
