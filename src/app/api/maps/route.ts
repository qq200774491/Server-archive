import { NextRequest } from 'next/server'
import { v1Gone, v1Options } from '@/lib/v1-gone'

export function OPTIONS(request: NextRequest) {
  return v1Options(request)
}

export function GET(request: NextRequest) {
  return v1Gone(request)
}

export function POST(request: NextRequest) {
  return v1Gone(request)
}
