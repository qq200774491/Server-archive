'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function AdminLogoutButton() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={submitting}
      onClick={async () => {
        setSubmitting(true)
        try {
          await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
        } finally {
          router.replace('/admin/login')
          router.refresh()
        }
      }}
    >
      退出登录
    </Button>
  )
}
