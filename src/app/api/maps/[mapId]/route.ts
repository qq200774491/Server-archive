import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

// GET /api/maps/:mapId - 获取地图详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: {
        dimensions: true,
        _count: {
          select: {
            mapPlayers: true,
          },
        },
      },
    })

    if (!map) {
      return notFoundResponse('地图')
    }

    return Response.json(map)
  } catch (error) {
    console.error('Error fetching map:', error)
    return errorResponse('获取地图详情失败', 500)
  }
}

// PUT /api/maps/:mapId - 更新地图
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params
    const body = await request.json()
    const { name, description, config } = body

    const map = await prisma.map.update({
      where: { id: mapId },
      data: {
        name,
        description,
        config,
      },
    })

    return Response.json(map)
  } catch (error) {
    console.error('Error updating map:', error)
    return errorResponse('更新地图失败', 500)
  }
}

// DELETE /api/maps/:mapId - 删除地图
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { mapId } = await params

    await prisma.map.delete({
      where: { id: mapId },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting map:', error)
    return errorResponse('删除地图失败', 500)
  }
}
