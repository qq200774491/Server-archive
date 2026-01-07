import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/players/me - 获取当前玩家信息（Bearer）
export async function GET(request: NextRequest) {
  try {
    const player = await getPlayerFromRequestV2(request)

    const playerWithMaps = await prisma.player.findUnique({
      where: { id: player.dbPlayer.id },
      include: {
        mapPlayers: {
          include: {
            map: true,
            _count: {
              select: { archives: true },
            },
          },
        },
      },
    })

    return v2Json(request, playerWithMaps)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

