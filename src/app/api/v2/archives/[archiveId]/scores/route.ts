import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ archiveId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// POST /api/v2/archives/:archiveId/scores - 提交排行榜成绩（Bearer）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const player = await getPlayerFromRequestV2(request)
    const { archiveId } = await params

    const body = await request.json()
    const scores = body?.scores

    if (!scores || !Array.isArray(scores)) {
      return v2Error(request, '请提供 scores 数组', 400)
    }

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: {
        mapPlayer: {
          include: {
            map: { include: { dimensions: true } },
          },
        },
      },
    })

    if (!archive) return v2NotFound(request, '存档')
    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return v2Error(request, '无权提交此存档的成绩', 403)
    }

    const mapDimensionIds = new Set(archive.mapPlayer.map.dimensions.map((d) => d.id))

    const results = await prisma.$transaction(
      scores.map((score: { dimensionId: string; value: number; metadata?: object }) => {
        if (!score?.dimensionId || typeof score.dimensionId !== 'string') {
          throw new Error('dimensionId 不能为空')
        }
        if (!mapDimensionIds.has(score.dimensionId)) {
          throw new Error(`维度 ${score.dimensionId} 不属于此地图`)
        }
        if (typeof score.value !== 'number' || !Number.isFinite(score.value)) {
          throw new Error('value 必须为数字')
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

    return v2Json(request, {
      message: '成绩提交成功',
      updated: results.length,
      entries: results,
    })
  } catch (error) {
    return v2HandleError(request, error)
  }
}

