import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// POST /api/v2/maps/:mapId/join - 加入地图（Bearer）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequestV2(request)

    const map = await prisma.map.findUnique({ where: { id: mapId } })
    if (!map) return v2NotFound(request, '地图')

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

    return v2Json(request, mapPlayer, 201)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

