import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, User, Map, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ archiveId: string }>
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { archiveId } = await params

  const archive = await prisma.archive.findUnique({
    where: { id: archiveId },
    include: {
      mapPlayer: {
        include: {
          player: true,
          map: true,
        },
      },
      entries: {
        include: {
          dimension: true,
        },
      },
    },
  })

  if (!archive) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/archives">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{archive.name}</h1>
          <p className="text-muted-foreground">
            存档详情 - 更新于 {new Date(archive.updatedAt).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">玩家</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href={`/players/${archive.mapPlayer.player.id}`} className="text-xl font-bold hover:underline">
              {archive.mapPlayer.player.playerName}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">地图</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href={`/maps/${archive.mapPlayer.map.id}`} className="text-xl font-bold hover:underline">
              {archive.mapPlayer.map.name}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">排行榜记录</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archive.entries.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 排行榜成绩 */}
        <Card>
          <CardHeader>
            <CardTitle>排行榜成绩</CardTitle>
            <CardDescription>此存档的排行榜记录</CardDescription>
          </CardHeader>
          <CardContent>
            {archive.entries.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无排行榜记录</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>维度</TableHead>
                    <TableHead>成绩</TableHead>
                    <TableHead>更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archive.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.dimension.name}
                          {entry.dimension.unit && (
                            <Badge variant="outline">{entry.dimension.unit}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {Number(entry.value).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.updatedAt).toLocaleString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 存档数据 */}
        <Card>
          <CardHeader>
            <CardTitle>存档数据</CardTitle>
            <CardDescription>JSON 格式的存档内容</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(archive.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
