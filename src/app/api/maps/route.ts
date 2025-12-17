import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPaginationParams, paginatedResponse, errorResponse } from '@/lib/api-utils'

// GET /api/maps - 获取所有地图
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = getPaginationParams(request)

    const [maps, total] = await Promise.all([
      prisma.map.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              mapPlayers: true,
              dimensions: true,
            },
          },
        },
      }),
      prisma.map.count(),
    ])

    return Response.json(paginatedResponse(maps, total, page, limit))
  } catch (error) {
    console.error('Error fetching maps:', error)
    return errorResponse('获取地图列表失败', 500)
  }
}

// POST /api/maps - 创建地图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, config } = body

    if (!name) {
      return errorResponse('地图名称不能为空')
    }

    const map = await prisma.map.create({
      data: {
        name,
        description,
        config,
      },
    })

    return Response.json(map, { status: 201 })
  } catch (error) {
    console.error('Error creating map:', error)
    return errorResponse('创建地图失败', 500)
  }
}
