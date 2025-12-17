import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPlayerFromRequest, unauthorizedResponse } from '@/lib/auth'
import { errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ archiveId: string }>
}

// POST /api/archives/:archiveId/scores - 提交排行榜成绩
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { archiveId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { scores } = body

    if (!scores || !Array.isArray(scores)) {
      return errorResponse('请提供 scores 数组')
    }

    // 检查存档是否存在且属于当前玩家
    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: {
        mapPlayer: {
          include: {
            map: {
              include: {
                dimensions: true,
              },
            },
          },
        },
      },
    })

    if (!archive) {
      return notFoundResponse('存档')
    }

    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return errorResponse('无权提交此存档的成绩', 403)
    }

    const mapDimensionIds = archive.mapPlayer.map.dimensions.map(d => d.id)

    // 使用事务批量更新成绩
    const results = await prisma.$transaction(
      scores.map((score: { dimensionId: string; value: number; metadata?: object }) => {
        if (!mapDimensionIds.includes(score.dimensionId)) {
          throw new Error(`维度 ${score.dimensionId} 不属于此地图`)
        }

        return prisma.leaderboardEntry.upsert({
          where: {
            dimensionId_archiveId: {
              dimensionId: score.dimensionId,
              archiveId,
            },
          },
          update: {
            value: score.value,
            metadata: score.metadata,
          },
          create: {
            dimensionId: score.dimensionId,
            archiveId,
            value: score.value,
            metadata: score.metadata,
          },
        })
      })
    )

    return Response.json({
      message: '成绩提交成功',
      updated: results.length,
      entries: results,
    })
  } catch (error) {
    console.error('Error submitting scores:', error)
    if (error instanceof Error) {
      return errorResponse(error.message, 400)
    }
    return errorResponse('提交成绩失败', 500)
  }
}
