import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { getPlayerFromRequestV2 } from '@/lib/auth-v2'
import { v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps/:mapId/archives - 获取我在该地图的存档（Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequestV2(request)
    const { page, limit, skip } = getPaginationParams(request)

    const mapPlayer = await prisma.mapPlayer.findUnique({
      where: {
        mapId_playerId: {
          mapId,
          playerId: player.dbPlayer.id,
        },
      },
    })

    if (!mapPlayer) return v2Json(request, paginatedResponse([], 0, page, limit))

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where: { mapPlayerId: mapPlayer.id },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          entries: {
            include: { dimension: true },
          },
        },
      }),
      prisma.archive.count({ where: { mapPlayerId: mapPlayer.id } }),
    ])

    return v2Json(request, paginatedResponse(archives, total, page, limit))
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// POST /api/v2/maps/:mapId/archives - 创建存档（Bearer）
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequestV2(request)

    const body = await request.json()
    const name = String(body?.name ?? '').trim()
    const data = body?.data ?? {}

    if (!name) return v2Json(request, { error: '存档名称不能为空' }, 400)

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
    })

    const archive = await prisma.archive.create({
      data: {
        mapPlayerId: mapPlayer.id,
        name,
        data,
      },
    })

    return v2Json(request, archive, 201)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

