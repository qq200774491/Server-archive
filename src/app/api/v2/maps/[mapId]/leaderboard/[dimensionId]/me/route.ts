import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string; dimensionId: string }>
}

type MyRankRow = {
  rank: number
  playerId: string
  playerName: string
  archiveId: string
  archiveName: string
  value: string
  updatedAt: Date
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps/:mapId/leaderboard/:dimensionId/me - 我的排名（Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const player = await getPlayerFromRequestV2(request)
    const { mapId, dimensionId } = await params

    const dimension = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
    })
    if (!dimension || dimension.mapId !== mapId) {
      return v2NotFound(request, '排行榜维度')
    }

    const sortDir =
      dimension.sortOrder === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`

    const rows = await prisma.$queryRaw<MyRankRow[]>(Prisma.sql`
      WITH best AS (
        SELECT
          p.id AS "playerDbId",
          p."playerId" AS "playerId",
          p."playerName" AS "playerName",
          a.id AS "archiveId",
          a.name AS "archiveName",
          le.value AS "value",
          le."updatedAt" AS "updatedAt",
          ROW_NUMBER() OVER (
            PARTITION BY p.id
            ORDER BY le.value ${sortDir}, le."updatedAt" DESC, le.id DESC
          ) AS rn
        FROM "LeaderboardEntry" le
        JOIN "Archive" a ON a.id = le."archiveId"
        JOIN "MapPlayer" mp ON mp.id = a."mapPlayerId"
        JOIN "Player" p ON p.id = mp."playerId"
        WHERE le."dimensionId" = ${dimensionId}
          AND mp."mapId" = ${mapId}
      ),
      best_only AS (
        SELECT * FROM best WHERE rn = 1
      ),
      ranked AS (
        SELECT
          DENSE_RANK() OVER (ORDER BY "value" ${sortDir}, "updatedAt" DESC, "playerId" ASC) AS "rank",
          "playerDbId",
          "playerId",
          "playerName",
          "archiveId",
          "archiveName",
          "value",
          "updatedAt"
        FROM best_only
      )
      SELECT
        "rank",
        "playerId",
        "playerName",
        "archiveId",
        "archiveName",
        "value",
        "updatedAt"
      FROM ranked
      WHERE "playerDbId" = ${player.dbPlayer.id}
      LIMIT 1
    `)

    const row = rows[0]
    if (!row) {
      return v2Json(request, {
        rank: null,
        entry: null,
      })
    }

    return v2Json(request, {
      rank: row.rank,
      entry: {
        playerId: row.playerId,
        playerName: row.playerName,
        archiveId: row.archiveId,
        archiveName: row.archiveName,
        value: row.value,
        updatedAt: row.updatedAt,
      },
    })
  } catch (error) {
    return v2HandleError(request, error)
  }
}
