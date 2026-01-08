import { requireAdminSession } from '@/lib/admin-session'
import { getAdminSummary } from '@/lib/admin-summary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Archive, Map, Trophy, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDateTime(value: Date | null): string {
  if (!value) return '暂无'
  return new Date(value).toLocaleString('zh-CN')
}

export default async function AdminOverviewPage() {
  const admin = await requireAdminSession()
  const summary = await getAdminSummary()

  const cards = [
    {
      title: '地图',
      value: summary.counts.maps,
      icon: Map,
      updatedAt: summary.latest.mapUpdatedAt,
    },
    {
      title: '玩家',
      value: summary.counts.players,
      icon: Users,
      updatedAt: summary.latest.playerUpdatedAt,
    },
    {
      title: '存档',
      value: summary.counts.archives,
      icon: Archive,
      updatedAt: summary.latest.archiveUpdatedAt,
    },
    {
      title: '榜单记录',
      value: summary.counts.entries,
      icon: Trophy,
      updatedAt: summary.latest.entryUpdatedAt,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">管理概览</h1>
          <p className="text-muted-foreground">欢迎回来，{admin.username}</p>
        </div>
        <Badge variant="outline">系统概览</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">{item.value}</div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  最近更新：{formatDateTime(item.updatedAt)}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
