import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse } from '@/lib/cors'
import { getPaginationParams, paginatedResponse } from '@/lib/api-utils'
import { getPlayerFromRequestV2, requireAdminFromRequest } from '@/lib/auth-v2'
import { v2Error, v2HandleError, v2Json } from '@/lib/api-v2'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

// GET /api/v2/maps - 获取所有地图（需要 Bearer）
export async function GET(request: NextRequest) {
  try {
    await getPlayerFromRequestV2(request)
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

    return v2Json(request, paginatedResponse(maps, total, page, limit))
  } catch (error) {
    return v2HandleError(request, error)
  }
}

// POST /api/v2/maps - 创建地图（Admin）
export async function POST(request: NextRequest) {
  try {
    await requireAdminFromRequest(request)
    const body = await request.json()
    const name = String(body?.name ?? '').trim()
    const description =
      body?.description === undefined || body?.description === null
        ? undefined
        : String(body.description).trim()

    const config = body?.config

    if (!name) return v2Error(request, '地图名称不能为空', 400)

    const map = await prisma.map.create({
      data: {
        name,
        description: description || null,
        config,
      },
    })

    return v2Json(request, map, 201)
  } catch (error) {
    return v2HandleError(request, error)
  }
}

