import crypto from 'crypto'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getAdminFromSessionToken, getAdminSessionCookieName } from '@/lib/admin-auth'

export class AuthError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
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

export type PlayerTokenPayload = {
  playerId: string
  playerName: string
  iat: number
  exp?: number
}

export type PlayerAuth = {
  playerId: string
  playerName: string
  dbPlayer: {
    id: string
    playerId: string
    playerName: string
  }
}

export function signPlayerToken(input: {
  playerId: string
  playerName: string
  ttlSeconds?: number
}): string {
  const secret = getRequiredEnv('PLAYER_TOKEN_SECRET')
  const now = Math.floor(Date.now() / 1000)

  const ttlSeconds = input.ttlSeconds ?? 60 * 60 * 24 * 30
  const payload: PlayerTokenPayload = {
    playerId: input.playerId,
    playerName: input.playerName,
    iat: now,
    exp: now + ttlSeconds,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const message = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest()

  const encodedSignature = base64UrlEncode(signature)
  return `${message}.${encodedSignature}`
}

export function verifyPlayerToken(token: string): PlayerTokenPayload | null {
  const secret = process.env.PLAYER_TOKEN_SECRET
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [encodedHeader, encodedPayload, encodedSignature] = parts
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null

  try {
    const message = `${encodedHeader}.${encodedPayload}`
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest()
    const expectedEncoded = base64UrlEncode(expectedSig)

    if (
      expectedEncoded.length !== encodedSignature.length ||
      !timingSafeEqualString(expectedEncoded, encodedSignature)
    ) {
      return null
    }

    const payloadJson = base64UrlDecodeToString(encodedPayload)
    const payload = JSON.parse(payloadJson) as PlayerTokenPayload

    if (!payload.playerId || !payload.playerName || !payload.iat) return null

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) return null

    return payload
  } catch {
    return null
  }
}

export async function getPlayerFromRequestV2(
  request: NextRequest
): Promise<PlayerAuth> {
  const header = request.headers.get('authorization')
  if (!header?.toLowerCase().startsWith('bearer ')) {
    throw new AuthError('未授权：请提供 Authorization: Bearer', 401)
  }

  const token = header.slice('bearer '.length).trim()
  const payload = verifyPlayerToken(token)
  if (!payload) throw new AuthError('未授权：Bearer token 无效', 401)

  const dbPlayer = await prisma.player.upsert({
    where: { playerId: payload.playerId },
    update: { playerName: payload.playerName },
    create: { playerId: payload.playerId, playerName: payload.playerName },
  })

  return {
    playerId: payload.playerId,
    playerName: payload.playerName,
    dbPlayer: {
      id: dbPlayer.id,
      playerId: dbPlayer.playerId,
      playerName: dbPlayer.playerName,
    },
  }
}

export async function requireAdminFromRequest(
  request: NextRequest
): Promise<{ id: string; username: string; sessionVersion: number }> {
  const cookieName = getAdminSessionCookieName()
  const token = request.cookies.get(cookieName)?.value
  if (!token) throw new AuthError('未授权：请先登录管理端', 401)

  const admin = await getAdminFromSessionToken(token)
  if (!admin) throw new AuthError('未授权：登录状态已失效', 401)

  return admin
}

