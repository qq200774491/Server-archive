import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import { Plus, Users, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MapsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const limit = 12
  const skip = (page - 1) * limit

  const [maps, total] = await Promise.all([
    prisma.map.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            mapPlayers: true,
            dimensions: true,
          },
        },
      },
    }),
    prisma.map.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">地图管理</Badge>
          <h1 className="font-display text-3xl font-semibold">地图管理</h1>
          <p className="text-muted-foreground">管理游戏地图和排行榜维度</p>
        </div>
        <Link href="/maps/new">
          <Button className="gap-2">
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
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <Link key={map.id} href={`/maps/${map.id}`}>
                <Card className="group h-full cursor-pointer transition hover:border-primary/40 hover:shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
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

          {totalPages > 1 && (
            <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} />
          )}
        </div>
      )}
    </div>
  )
}
