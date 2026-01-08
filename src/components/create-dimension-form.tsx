'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function CreateDimensionForm({ mapId }: { mapId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/maps/${encodeURIComponent(mapId)}/dimensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          unit: unit.trim() || null,
          sortOrder,
        }),
      })

      if (response.status === 401) {
        router.push(`/admin/login?next=/maps/${encodeURIComponent(mapId)}`)
        return
      }

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || '创建排行榜维度失败')
        return
      }

      setName('')
      setUnit('')
      setSortOrder('DESC')
      router.refresh()
    } catch {
      setError('网络错误：创建排行榜维度失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建排行榜维度</CardTitle>
        <CardDescription>为该地图新增一个排行榜维度</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dimension-name">名称</Label>
          <Input
            id="dimension-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：分数 / 通关时间"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dimension-unit">单位（可选）</Label>
            <Input
              id="dimension-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="例如：分 / 秒"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimension-sort">排序</Label>
            <select
              id="dimension-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value === 'ASC' ? 'ASC' : 'DESC')}
              className="flex h-10 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm ring-offset-background backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="DESC">高分优先（DESC）</option>
              <option value="ASC">低分优先（ASC）</option>
            </select>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Button disabled={!name.trim() || submitting} onClick={submit}>
          {submitting ? '创建中...' : '创建维度'}
        </Button>
      </CardContent>
    </Card>
  )
}
