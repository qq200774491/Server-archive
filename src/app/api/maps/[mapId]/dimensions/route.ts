import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

// GET /api/maps/:mapId/dimensions - 获取地图排行榜维度
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params

    const dimensions = await prisma.leaderboardDimension.findMany({
      where: { mapId },
      orderBy: { createdAt: 'asc' },
    })

    return Response.json(dimensions)
  } catch (error) {
    console.error('Error fetching dimensions:', error)
    return errorResponse('获取排行榜维度失败', 500)
  }
}

// POST /api/maps/:mapId/dimensions - 创建排行榜维度
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const body = await request.json()
    const { name, unit, sortOrder } = body

    if (!name) {
      return errorResponse('维度名称不能为空')
    }

    // 检查地图是否存在
    const map = await prisma.map.findUnique({
      where: { id: mapId },
    })

    if (!map) {
      return notFoundResponse('地图')
    }

    const dimension = await prisma.leaderboardDimension.create({
      data: {
        mapId,
        name,
        unit,
        sortOrder: sortOrder || 'DESC',
      },
    })

    return Response.json(dimension, { status: 201 })
  } catch (error) {
    console.error('Error creating dimension:', error)
    return errorResponse('创建排行榜维度失败', 500)
  }
}
