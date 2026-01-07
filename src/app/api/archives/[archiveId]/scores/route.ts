import { NextRequest } from 'next/server'
import { v1Gone, v1Options } from '@/lib/v1-gone'

interface RouteParams {
  params: Promise<{ archiveId: string }>
}

export function OPTIONS(request: NextRequest) {
  return v1Options(request)
}

export function POST(request: NextRequest, _ctx: RouteParams) {
  return v1Gone(request)
}
