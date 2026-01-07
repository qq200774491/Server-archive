import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { signPlayerToken } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// POST /api/v2/auth/player - 签发玩家 Bearer token（并 upsert 玩家）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const playerId = String(body?.playerId ?? '').trim()
    const playerName = String(body?.playerName ?? '').trim()

    if (!playerId) return v2Error(request, 'playerId 不能为空', 400)
    if (!playerName) return v2Error(request, 'playerName 不能为空', 400)

    const dbPlayer = await prisma.player.upsert({
      where: { playerId },
      update: { playerName },
      create: { playerId, playerName },
    })

    const token = signPlayerToken({ playerId, playerName })

    return v2Json(request, {
      token,
      player: {
        id: dbPlayer.id,
        playerId: dbPlayer.playerId,
        playerName: dbPlayer.playerName,
      },
    })
  } catch (error) {
    return v2HandleError(request, error)
  }
}

