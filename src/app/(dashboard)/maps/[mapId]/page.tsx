import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Users, Trophy, Archive } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ mapId: string }>
}

export default async function MapDetailPage({ params }: PageProps) {
  const { mapId } = await params

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    include: {
      dimensions: true,
      mapPlayers: {
        include: {
          player: true,
          _count: {
            select: { archives: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { mapPlayers: true },
      },
    },
  })

  if (!map) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maps">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{map.name}</h1>
          <p className="text-muted-foreground">{map.description || '暂无描述'}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">玩家数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{map._count.mapPlayers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">排行榜维度</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{map.dimensions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(map.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 排行榜维度 */}
        <Card>
          <CardHeader>
            <CardTitle>排行榜维度</CardTitle>
            <CardDescription>此地图的排行榜类型</CardDescription>
          </CardHeader>
          <CardContent>
            {map.dimensions.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无排行榜维度</p>
            ) : (
              <div className="space-y-2">
                {map.dimensions.map((dim) => (
                  <div key={dim.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{dim.name}</span>
                      {dim.unit && (
                        <span className="text-muted-foreground text-sm ml-2">({dim.unit})</span>
                      )}
                    </div>
                    <Badge variant={dim.sortOrder === 'DESC' ? 'default' : 'secondary'}>
                      {dim.sortOrder === 'DESC' ? '高分优先' : '低分优先'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近玩家 */}
        <Card>
          <CardHeader>
            <CardTitle>最近玩家</CardTitle>
            <CardDescription>最近加入此地图的玩家</CardDescription>
          </CardHeader>
          <CardContent>
            {map.mapPlayers.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无玩家</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>玩家名</TableHead>
                    <TableHead>存档数</TableHead>
                    <TableHead>加入时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {map.mapPlayers.map((mp) => (
                    <TableRow key={mp.id}>
                      <TableCell>
                        <Link href={`/players/${mp.player.id}`} className="hover:underline">
                          {mp.player.playerName}
                        </Link>
                      </TableCell>
                      <TableCell>{mp._count.archives}</TableCell>
                      <TableCell>
                        {new Date(mp.joinedAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
