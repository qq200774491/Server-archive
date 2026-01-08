import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPlayerFromRequestV2, requireAdminFromRequest } from '@/lib/auth-v2'
import { v2HandleError, v2Json, v2NotFound } from '@/lib/api-v2'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps/:mapId - 获取地图详情（需要 Bearer）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await getPlayerFromRequestV2(request)
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

    if (!map) return v2NotFound(request, '地图')
    return v2Json(request, map)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// PUT /api/v2/maps/:mapId - 更新地图（Admin）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminFromRequest(request)
    const { mapId } = await params

    const existing = await prisma.map.findUnique({ where: { id: mapId } })
    if (!existing) return v2NotFound(request, '地图')

    const body = await request.json()
    const name =
      body?.name === undefined || body?.name === null
        ? undefined
        : String(body.name).trim()
    const description =
      body?.description === undefined || body?.description === null
        ? undefined
        : String(body.description).trim()

    const config = body?.config

    const map = await prisma.map.update({
      where: { id: mapId },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        config: config ?? existing.config,
      },
    })

    return v2Json(request, map)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// DELETE /api/v2/maps/:mapId - 删除地图（Admin）
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminFromRequest(request)
    const { mapId } = await params

    const existing = await prisma.map.findUnique({ where: { id: mapId } })
    if (!existing) return v2NotFound(request, '地图')

    await prisma.map.delete({ where: { id: mapId } })
    return v2Json(request, null, 204)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

