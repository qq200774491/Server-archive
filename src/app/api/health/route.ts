import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { corsPreflightResponse, withCors } from '@/lib/cors'

export function OPTIONS(request: NextRequest) {
  return corsPreflightResponse(request)
}

export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    return withCors(Response.json({ ok: true, db: true }), request)
  } catch {
    return withCors(Response.json({ ok: false, db: false }, { status: 503 }), request)
  }
}

