import { NextRequest } from 'next/server'
import prisma from './db'

export interface PlayerAuth {
  playerId: string
  playerName: string
  dbPlayer: {
    id: string
    playerId: string
    playerName: string
  }
}

export async function getPlayerFromRequest(
  request: NextRequest
): Promise<PlayerAuth | null> {
  const playerId = request.headers.get('X-Player-ID')
  const playerName = request.headers.get('X-Player-Name')

  if (!playerId || !playerName) {
    return null
  }

  // 查找或创建玩家
  const dbPlayer = await prisma.player.upsert({
    where: { playerId },
    update: { playerName },
    create: { playerId, playerName },
  })

  return {
    playerId,
    playerName,
    dbPlayer,
  }
}

export function unauthorizedResponse() {
  return Response.json(
    { error: '未授权，请提供 X-Player-ID 和 X-Player-Name 请求头' },
    { status: 401 }
  )
}
