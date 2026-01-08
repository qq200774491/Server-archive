import { NextRequest, NextResponse } from 'next/server'

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

  const expected = process.env.ADMIN_TOKEN
  const token = request.cookies.get('admin_token')?.value

  const nextUrl = new URL(request.url)
  const loginUrl = new URL('/admin/login', nextUrl.origin)
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)

  if (!expected || !token) {
    return NextResponse.redirect(loginUrl)
  }

  if (token !== expected) {
    loginUrl.searchParams.set('error', 'invalid')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/maps/:path*', '/players/:path*', '/archives/:path*', '/admin/:path*'],
}

