'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function getAdminTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

type DimensionInfo = {
  id: string
  name: string
  unit: string | null
  sortOrder: string
}

export function DimensionItem({
  mapId,
  dimension,
}: {
  mapId: string
  dimension: DimensionInfo
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dimension.name)
  const [unit, setUnit] = useState(dimension.unit ?? '')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    dimension.sortOrder === 'ASC' ? 'ASC' : 'DESC'
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    const token = getAdminTokenFromCookie()
    if (!token) {
      router.push(`/admin/login?next=/maps/${encodeURIComponent(mapId)}`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v2/maps/${encodeURIComponent(mapId)}/dimensions/${encodeURIComponent(dimension.id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token,
          },
          body: JSON.stringify({
            name: name.trim(),
            unit: unit.trim() || null,
            sortOrder,
          }),
        }
      )

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || '更新维度失败')
        return
      }

      setEditing(false)
      router.refresh()
    } catch {
      setError('网络错误：更新维度失败')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm(`确认删除维度「${dimension.name}」？`)) return

    const token = getAdminTokenFromCookie()
    if (!token) {
      router.push(`/admin/login?next=/maps/${encodeURIComponent(mapId)}`)
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v2/maps/${encodeURIComponent(mapId)}/dimensions/${encodeURIComponent(dimension.id)}`,
        {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': token,
          },
        }
      )

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null)
        setError(data?.error || '删除维度失败')
        return
      }

      router.refresh()
    } catch {
      setError('网络错误：删除维度失败')
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded border p-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`dimension-name-${dimension.id}`}>名称</Label>
            <Input
              id={`dimension-name-${dimension.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`dimension-unit-${dimension.id}`}>单位</Label>
            <Input
              id={`dimension-unit-${dimension.id}`}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="可选"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`dimension-sort-${dimension.id}`}>排序</Label>
          <select
            id={`dimension-sort-${dimension.id}`}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value === 'ASC' ? 'ASC' : 'DESC')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="DESC">高分优先（DESC）</option>
            <option value="ASC">低分优先（ASC）</option>
          </select>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex flex-wrap gap-2">
          <Button disabled={!name.trim() || saving} onClick={save}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button
            variant="outline"
            disabled={saving || deleting}
            onClick={() => {
              setEditing(false)
              setName(dimension.name)
              setUnit(dimension.unit ?? '')
              setSortOrder(dimension.sortOrder === 'ASC' ? 'ASC' : 'DESC')
            }}
          >
            取消
          </Button>
          <Button variant="destructive" disabled={deleting} onClick={remove}>
            {deleting ? '删除中...' : '删除'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{dimension.name}</span>
          {dimension.unit && (
            <span className="text-muted-foreground text-sm">({dimension.unit})</span>
          )}
        </div>
        <Badge
          variant={dimension.sortOrder === 'DESC' ? 'default' : 'secondary'}
          className="mt-2"
        >
          {dimension.sortOrder === 'DESC' ? '高分优先' : '低分优先'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          编辑
        </Button>
        <Button variant="destructive" size="sm" disabled={deleting} onClick={remove}>
          {deleting ? '删除中...' : '删除'}
        </Button>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  )
}
