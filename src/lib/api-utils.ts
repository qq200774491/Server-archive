import { NextRequest } from 'next/server'

export function getPaginationParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status })
}

export function notFoundResponse(resource: string = '资源') {
  return Response.json({ error: `${resource}不存在` }, { status: 404 })
}
