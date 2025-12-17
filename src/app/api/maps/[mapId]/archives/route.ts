import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPlayerFromRequest, unauthorizedResponse } from '@/lib/auth'
import { getPaginationParams, paginatedResponse, errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

// GET /api/maps/:mapId/archives - 获取我在该地图的存档
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    const { page, limit, skip } = getPaginationParams(request)

    // 查找玩家在该地图的记录
    const mapPlayer = await prisma.mapPlayer.findUnique({
      where: {
        mapId_playerId: {
          mapId,
          playerId: player.dbPlayer.id,
        },
      },
    })

    if (!mapPlayer) {
      return Response.json(paginatedResponse([], 0, page, limit))
    }

    const [archives, total] = await Promise.all([
      prisma.archive.findMany({
        where: { mapPlayerId: mapPlayer.id },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          entries: {
            include: {
              dimension: true,
            },
          },
        },
      }),
      prisma.archive.count({ where: { mapPlayerId: mapPlayer.id } }),
    ])

    return Response.json(paginatedResponse(archives, total, page, limit))
  } catch (error) {
    console.error('Error fetching archives:', error)
    return errorResponse('获取存档列表失败', 500)
  }
}

// POST /api/maps/:mapId/archives - 创建存档
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { name, data } = body

    if (!name) {
      return errorResponse('存档名称不能为空')
    }

    // 检查地图是否存在
    const map = await prisma.map.findUnique({
      where: { id: mapId },
    })

    if (!map) {
      return notFoundResponse('地图')
    }

    // 确保玩家已加入地图
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
        data: data || {},
      },
    })

    return Response.json(archive, { status: 201 })
  } catch (error) {
    console.error('Error creating archive:', error)
    return errorResponse('创建存档失败', 500)
  }
}
