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

// GET /api/v2/archives/:archiveId - 获取存档详情（Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const player = await getPlayerFromRequestV2(request)
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
          include: { dimension: true },
        },
      },
    })

    if (!archive) return v2NotFound(request, '存档')
    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return v2Error(request, '无权访问此存档', 403)
    }
    return v2Json(request, archive)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// PUT /api/v2/archives/:archiveId - 更新存档（Bearer）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const player = await getPlayerFromRequestV2(request)
    const { archiveId } = await params

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: { mapPlayer: true },
    })

    if (!archive) return v2NotFound(request, '存档')
    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return v2Error(request, '无权修改此存档', 403)
    }

    const body = await request.json()
    const name =
      body?.name === undefined || body?.name === null
        ? undefined
        : String(body.name).trim()
    const data = body?.data

    const updated = await prisma.archive.update({
      where: { id: archiveId },
      data: {
        name: name ?? archive.name,
        data: data ?? archive.data,
      },
    })

    return v2Json(request, updated)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// DELETE /api/v2/archives/:archiveId - 删除存档（Bearer）
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const player = await getPlayerFromRequestV2(request)
    const { archiveId } = await params

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      include: { mapPlayer: true },
    })

    if (!archive) return v2NotFound(request, '存档')
    if (archive.mapPlayer.playerId !== player.dbPlayer.id) {
      return v2Error(request, '无权删除此存档', 403)
    }

    await prisma.archive.delete({ where: { id: archiveId } })
    return v2Json(request, null, 204)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

