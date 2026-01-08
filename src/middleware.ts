import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin-constants'

const PROTECTED_PREFIXES = ['/maps', '/players', '/archives', '/admin']

function isProtectedPath(pathname: string): boolean {
  if (pathname === '/admin/login') return false
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) return NextResponse.next()

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value

  const nextUrl = new URL(request.url)
  const loginUrl = new URL('/admin/login', nextUrl.origin)
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)

  if (!token) {
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/maps/:path*', '/players/:path*', '/archives/:path*', '/admin/:path*'],
}

