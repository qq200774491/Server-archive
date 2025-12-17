import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getPlayerFromRequest, unauthorizedResponse } from '@/lib/auth'
import { errorResponse, notFoundResponse } from '@/lib/api-utils'

interface RouteParams {
  params: Promise<{ archiveId: string }>
}

// GET /api/archives/:archiveId - 获取存档详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { archiveId } = await params

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: {
        mapPlayer: {
          include: {
            player: true,
            map: true,
          },
        },
        entries: {
          include: {
            dimension: true,
          },
        },
      },
    })

    if (!archive) {
      return notFoundResponse('存档')
    }

    return Response.json(archive)
  } catch (error) {
    console.error('Error fetching archive:', error)
    return errorResponse('获取存档详情失败', 500)
  }
}

// PUT /api/archives/:archiveId - 更新存档
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { archiveId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { name, data } = body

    // 检查存档是否属于当前玩家
    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: {
        mapPlayer: true,
      },
    })

    if (!archive) {
      return notFoundResponse('存档')
    }

    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return errorResponse('无权修改此存档', 403)
    }

    const updatedArchive = await prisma.archive.update({
      where: { id: archiveId },
      data: {
        name: name ?? archive.name,
        data: data ?? archive.data,
      },
    })

    return Response.json(updatedArchive)
  } catch (error) {
    console.error('Error updating archive:', error)
    return errorResponse('更新存档失败', 500)
  }
}

// DELETE /api/archives/:archiveId - 删除存档
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { archiveId } = await params
    const player = await getPlayerFromRequest(request)

    if (!player) {
      return unauthorizedResponse()
    }

    // 检查存档是否属于当前玩家
    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: {
        mapPlayer: true,
      },
    })

    if (!archive) {
      return notFoundResponse('存档')
    }

    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return errorResponse('无权删除此存档', 403)
    }

    await prisma.archive.delete({
      where: { id: archiveId },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting archive:', error)
    return errorResponse('删除存档失败', 500)
  }
}
