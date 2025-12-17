import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPaginationParams, paginatedResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ mapId: string; dimensionId: string }>
}

// GET /api/maps/:mapId/leaderboard/:dimensionId - 获取排行榜
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId, dimensionId } = await params
    const { page, limit, skip } = getPaginationParams(request)

    // 检查维度是否存在
    const dimension = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
    })

    if (!dimension || dimension.mapId !== mapId) {
      return notFoundResponse('排行榜维度')
    }

    // 获取排行榜数据
    const sortOrder = dimension.sortOrder === 'ASC' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc

    const [entries, total] = await Promise.all([
      prisma.leaderboardEntry.findMany({
        where: { dimensionId },
        skip,
        take: limit,
        orderBy: { value: sortOrder },
        include: {
          archive: {
            include: {
              mapPlayer: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      }),
      prisma.leaderboardEntry.count({ where: { dimensionId } }),
    ])

    // 计算排名
    const rankedEntries = entries.map((entry, index) => ({
      rank: skip + index + 1,
      playerName: entry.archive.mapPlayer.player.playerName,
      playerId: entry.archive.mapPlayer.player.playerId,
      archiveName: entry.archive.name,
      archiveId: entry.archiveId,
      value: entry.value,
      metadata: entry.metadata,
      updatedAt: entry.updatedAt,
    }))

    return Response.json({
      dimension: {
        id: dimension.id,
        name: dimension.name,
        unit: dimension.unit,
        sortOrder: dimension.sortOrder,
      },
      ...paginatedResponse(rankedEntries, total, page, limit),
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return errorResponse('获取排行榜失败', 500)
  }
}
