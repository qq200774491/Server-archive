'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

function getAdminTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function CreateMapForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const token = getAdminTokenFromCookie()
    if (!token) {
      router.push('/admin/login?next=/maps/new')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/v2/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || '创建地图失败')
        return
      }

      router.push(`/maps/${data.id}`)
      router.refresh()
    } catch {
      setError('网络错误：创建地图失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建地图</CardTitle>
        <CardDescription>创建新的游戏地图与排行榜容器</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名称</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：新手村"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">描述（可选）</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：适合新手的入门关卡"
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Button
          disabled={!name.trim() || submitting}
          onClick={submit}
        >
          {submitting ? '创建中...' : '创建'}
        </Button>
      </CardContent>
    </Card>
  )
}

