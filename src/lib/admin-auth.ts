import crypto from 'crypto'
import prisma from '@/lib/db'
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin-constants'
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

type AdminSessionPayload = {
  adminId: string
  sessionVersion: number
  iat: number
  exp: number
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecodeToString(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (padded.length % 4)) % 4
  const pad = '='.repeat(padLen)
  return Buffer.from(padded + pad, 'base64').toString('utf8')
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function hashPassword(password: string, salt?: Buffer): string {
  const usedSalt = salt ?? crypto.randomBytes(16)
  const derived = crypto.scryptSync(password, usedSalt, 64)
  return `scrypt$${usedSalt.toString('hex')}$${derived.toString('hex')}`
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const salt = Buffer.from(parts[1], 'hex')
  const expected = Buffer.from(parts[2], 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length)
  return timingSafeEqualString(expected.toString('hex'), actual.toString('hex'))
}

function signAdminSession(payload: {
  adminId: string
  sessionVersion: number
  ttlSeconds?: number
}): string {
  const secret = getRequiredEnv('ADMIN_SESSION_SECRET')
  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = payload.ttlSeconds ?? ADMIN_SESSION_TTL_SECONDS
  const body: AdminSessionPayload = {
    adminId: payload.adminId,
    sessionVersion: payload.sessionVersion,
    iat: now,
    exp: now + ttlSeconds,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(body))
  const message = `${encodedHeader}.${encodedPayload}`

  const signature = crypto.createHmac('sha256', secret).update(message).digest()
  const encodedSignature = base64UrlEncode(signature)
  return `${message}.${encodedSignature}`
}

function verifyAdminSession(token: string): AdminSessionPayload | null {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [encodedHeader, encodedPayload, encodedSignature] = parts
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null

  try {
    const message = `${encodedHeader}.${encodedPayload}`
    const expectedSig = crypto.createHmac('sha256', secret).update(message).digest()
    const expectedEncoded = base64UrlEncode(expectedSig)

    if (
      expectedEncoded.length !== encodedSignature.length ||
      !timingSafeEqualString(expectedEncoded, encodedSignature)
    ) {
      return null
    }

    const payloadJson = base64UrlDecodeToString(encodedPayload)
    const payload = JSON.parse(payloadJson) as AdminSessionPayload

    if (!payload.adminId || !payload.sessionVersion || !payload.iat || !payload.exp)
      return null

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) return null

    return payload
  } catch {
    return null
  }
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE_NAME
}

export function getAdminSessionTtlSeconds(): number {
  return ADMIN_SESSION_TTL_SECONDS
}

export function createAdminSessionToken(input: {
  adminId: string
  sessionVersion: number
  ttlSeconds?: number
}): string {
  return signAdminSession(input)
}

export function getSessionPayloadFromToken(token: string): AdminSessionPayload | null {
  return verifyAdminSession(token)
}

export async function getAdminFromSessionToken(
  token: string
): Promise<null | { id: string; username: string; sessionVersion: number }> {
  const payload = verifyAdminSession(token)
  if (!payload) return null

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.adminId },
    select: {
      id: true,
      username: true,
      sessionVersion: true,
    },
  })

  if (!admin) return null
  if (admin.sessionVersion !== payload.sessionVersion) return null

  return admin
}

export async function ensureAdminBootstrap(): Promise<null | { id: string; username: string }> {
  const existing = await prisma.adminUser.findFirst({
    select: { id: true, username: true },
  })
  if (existing) return existing

  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!username || !password) return null

  const passwordHash = hashPassword(password)
  const created = await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
    },
    select: { id: true, username: true },
  })

  return created
}

export async function verifyAdminCredentials(input: {
  username: string
  password: string
}): Promise<null | { id: string; username: string; sessionVersion: number }> {
  const admin = await prisma.adminUser.findUnique({
    where: { username: input.username },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      sessionVersion: true,
    },
  })
  if (!admin) return null
  if (!verifyPassword(input.password, admin.passwordHash)) return null

  return {
    id: admin.id,
    username: admin.username,
    sessionVersion: admin.sessionVersion,
  }
}

export async function updateAdminCredentials(input: {
  adminId: string
  currentPassword: string
  newUsername?: string
  newPassword?: string
}): Promise<null | { id: string; username: string; sessionVersion: number }> {
  const admin = await prisma.adminUser.findUnique({
    where: { id: input.adminId },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      sessionVersion: true,
    },
  })
  if (!admin) return null
  if (!verifyPassword(input.currentPassword, admin.passwordHash)) return null

  const nextUsername = input.newUsername?.trim() || admin.username
  const nextPasswordHash = input.newPassword
    ? hashPassword(input.newPassword)
    : admin.passwordHash

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      username: nextUsername,
      passwordHash: nextPasswordHash,
      sessionVersion: admin.sessionVersion + 1,
    },
    select: {
      id: true,
      username: true,
      sessionVersion: true,
    },
  })

  return updated
}

export function buildAdminSessionCookie(token: string): {
  name: string
  value: string
  options: {
    httpOnly: boolean
    sameSite: 'lax'
    path: string
    maxAge: number
    secure: boolean
  }
} {
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_TTL_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    },
  }
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean
    sameSite?: 'lax'
    path?: string
    maxAge?: number
    secure?: boolean
  }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  if (options.secure) parts.push('Secure')
  return parts.join('; ')
}

export function buildAdminSessionCookieHeader(token: string): string {
  const cookie = buildAdminSessionCookie(token)
  return serializeCookie(cookie.name, cookie.value, cookie.options)
}

export function buildAdminSessionClearCookieHeader(): string {
  return serializeCookie(ADMIN_SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
