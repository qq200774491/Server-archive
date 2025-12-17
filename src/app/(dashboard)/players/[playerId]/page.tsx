import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Map, Archive } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ playerId: string }>
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { playerId } = await params

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      mapPlayers: {
        include: {
          map: true,
          _count: {
            select: { archives: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  })

  if (!player) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{player.playerName}</h1>
          <p className="text-muted-foreground">ID: {player.playerId}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与地图</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{player.mapPlayers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总存档数</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {player.mapPlayers.reduce((sum, mp) => sum + mp._count.archives, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">注册时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(player.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>参与的地图</CardTitle>
          <CardDescription>玩家加入的所有地图及存档数</CardDescription>
        </CardHeader>
        <CardContent>
          {player.mapPlayers.length === 0 ? (
            <p className="text-muted-foreground text-sm">暂未参与任何地图</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>地图名称</TableHead>
                  <TableHead>存档数</TableHead>
                  <TableHead>加入时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {player.mapPlayers.map((mp) => (
                  <TableRow key={mp.id}>
                    <TableCell>
                      <Link href={`/maps/${mp.map.id}`} className="font-medium hover:underline">
                        {mp.map.name}
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
  )
}
