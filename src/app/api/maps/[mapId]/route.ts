import { NextRequest } from 'next/server'
import { v1Gone, v1Options } from '@/lib/v1-gone'

interface RouteParams {
  params: Promise<{ mapId: string }>
}

export function OPTIONS(request: NextRequest) {
  return v1Options(request)
}

export function GET(request: NextRequest, _ctx: RouteParams) {
  return v1Gone(request)
}

export function PUT(request: NextRequest, _ctx: RouteParams) {
  return v1Gone(request)
}

export function DELETE(request: NextRequest, _ctx: RouteParams) {
  return v1Gone(request)
}
