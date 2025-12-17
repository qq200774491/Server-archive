import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Users, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MapsPage() {
  const maps = await prisma.map.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          mapPlayers: true,
          dimensions: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">地图管理</h1>
          <p className="text-muted-foreground">管理游戏地图和排行榜维度</p>
        </div>
        <Link href="/maps/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            创建地图
          </Button>
        </Link>
      </div>

      {maps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无地图</p>
            <Link href="/maps/new">
              <Button>创建第一个地图</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Link key={map.id} href={`/maps/${map.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {map.name}
                  </CardTitle>
                  <CardDescription>
                    {map.description || '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{map._count.mapPlayers} 玩家</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>{map._count.dimensions} 排行榜</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
