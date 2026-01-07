import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string; dimensionId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

type PlayerBestRow = {
  playerId: string
  playerName: string
  archiveId: string
  archiveName: string
  value: string
  updatedAt: Date
}

// GET /api/v2/maps/:mapId/leaderboard/:dimensionId - 获取排行榜（Bearer）
// query: mode=player|archive (default: player)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await getPlayerFromRequestV2(request)
    const { mapId, dimensionId } = await params
    const { page, limit, skip } = getPaginationParams(request)

    const mode = (request.nextUrl.searchParams.get('mode') ?? 'player').toLowerCase()
    if (mode !== 'player' && mode !== 'archive') {
      return v2Error(request, 'mode 仅支持 player 或 archive', 400)
    }

    const dimension = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
    })

    if (!dimension || dimension.mapId !== mapId) {
      return v2NotFound(request, '排行榜维度')
    }

    const sortDir =
      dimension.sortOrder === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`

    if (mode === 'archive') {
      const [entries, total] = await Promise.all([
        prisma.leaderboardEntry.findMany({
          where: { dimensionId },
          skip,
          take: limit,
          orderBy: { value: dimension.sortOrder === 'ASC' ? 'asc' : 'desc' },
          include: {
            archive: {
              include: {
                mapPlayer: {
                  include: { player: true },
                },
              },
            },
          },
        }),
        prisma.leaderboardEntry.count({ where: { dimensionId } }),
      ])

      const ranked = entries.map((entry, index) => ({
        rank: skip + index + 1,
        playerName: entry.archive.mapPlayer.player.playerName,
        playerId: entry.archive.mapPlayer.player.playerId,
        archiveName: entry.archive.name,
        archiveId: entry.archiveId,
        value: entry.value,
        updatedAt: entry.updatedAt,
      }))

      return v2Json(request, {
        dimension: {
          id: dimension.id,
          name: dimension.name,
          unit: dimension.unit,
          sortOrder: dimension.sortOrder,
        },
        mode,
        ...paginatedResponse(ranked, total, page, limit),
      })
    }

    const totalRows = await prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS "total"
      FROM (
        SELECT DISTINCT p.id
        FROM "LeaderboardEntry" le
        JOIN "Archive" a ON a.id = le."archiveId"
        JOIN "MapPlayer" mp ON mp.id = a."mapPlayerId"
        JOIN "Player" p ON p.id = mp."playerId"
        WHERE le."dimensionId" = ${dimensionId}
          AND mp."mapId" = ${mapId}
      ) t
    `)

    const total = totalRows[0]?.total ?? 0

    const rows = await prisma.$queryRaw<PlayerBestRow[]>(Prisma.sql`
      WITH ranked AS (
        SELECT
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
      )
      SELECT
        "playerId",
        "playerName",
        "archiveId",
        "archiveName",
        "value",
        "updatedAt"
      FROM ranked
      WHERE rn = 1
      ORDER BY "value" ${sortDir}, "updatedAt" DESC, "playerId" ASC
      LIMIT ${limit} OFFSET ${skip}
    `)

    const ranked = rows.map((row, index) => ({
      rank: skip + index + 1,
      playerName: row.playerName,
      playerId: row.playerId,
      archiveName: row.archiveName,
      archiveId: row.archiveId,
      value: row.value,
      updatedAt: row.updatedAt,
    }))

    return v2Json(request, {
      dimension: {
        id: dimension.id,
        name: dimension.name,
        unit: dimension.unit,
        sortOrder: dimension.sortOrder,
      },
      mode,
      ...paginatedResponse(ranked, total, page, limit),
    })
  } catch (error) {
    return v2HandleError(request, error)
  }
}
