import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  getAdminFromSessionToken,
  getAdminSessionCookieName,
} from '@/lib/admin-auth'

export async function getAdminFromCookies(): Promise<null | {
  id: string
  username: string
  sessionVersion: number
}> {
  const cookieName = getAdminSessionCookieName()
  const token = cookies().get(cookieName)?.value
  if (!token) return null
  return getAdminFromSessionToken(token)
}

export async function requireAdminSession() {
  const admin = await getAdminFromCookies()
  if (!admin) redirect('/admin/login?error=invalid')
  return admin
}
