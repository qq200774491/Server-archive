'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function clearAdminTokenCookie() {
  document.cookie = 'admin_token=; Path=/; Max-Age=0; SameSite=Lax'
}

export function AdminLogoutButton() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={submitting}
      onClick={() => {
        setSubmitting(true)
        clearAdminTokenCookie()
        router.replace('/admin/login')
        router.refresh()
      }}
    >
      退出登录
    </Button>
  )
}
