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

type MapInfo = {
  id: string
  name: string
  description: string | null
}

export function MapSettingsForm({ map }: { map: MapInfo }) {
  const router = useRouter()
  const [name, setName] = useState(map.name)
  const [description, setDescription] = useState(map.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    const token = getAdminTokenFromCookie()
    if (!token) {
      router.push(`/admin/login?next=/maps/${encodeURIComponent(map.id)}`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/maps/${encodeURIComponent(map.id)}`, {
        method: 'PUT',
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
        setError(data?.error || '更新地图失败')
        return
      }

      router.refresh()
    } catch {
      setError('网络错误：更新地图失败')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm('确认删除该地图？该操作将删除相关存档和排行榜数据。')) return

    const token = getAdminTokenFromCookie()
    if (!token) {
      router.push(`/admin/login?next=/maps/${encodeURIComponent(map.id)}`)
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/maps/${encodeURIComponent(map.id)}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': token,
        },
      })

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null)
        setError(data?.error || '删除地图失败')
        return
      }

      router.push('/maps')
      router.refresh()
    } catch {
      setError('网络错误：删除地图失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>地图设置</CardTitle>
        <CardDescription>编辑地图信息或删除地图</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="map-name">名称</Label>
          <Input
            id="map-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="地图名称"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map-description">描述（可选）</Label>
          <Input
            id="map-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="地图描述"
          />
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex flex-wrap gap-2">
          <Button disabled={!name.trim() || saving} onClick={save}>
            {saving ? '保存中...' : '保存修改'}
          </Button>
          <Button variant="destructive" disabled={deleting} onClick={remove}>
            {deleting ? '删除中...' : '删除地图'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
