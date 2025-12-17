import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function ArchivesPage() {
  const archives = await prisma.archive.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      mapPlayer: {
        include: {
          player: true,
          map: true,
        },
      },
      _count: {
        select: { entries: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">存档列表</h1>
        <p className="text-muted-foreground">所有玩家的存档记录</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {archives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">暂无存档</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>存档名称</TableHead>
                  <TableHead>玩家</TableHead>
                  <TableHead>地图</TableHead>
                  <TableHead>排行榜记录</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archives.map((archive) => (
                  <TableRow key={archive.id}>
                    <TableCell>
                      <Link href={`/archives/${archive.id}`} className="font-medium hover:underline">
                        {archive.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/players/${archive.mapPlayer.player.id}`} className="hover:underline">
                        {archive.mapPlayer.player.playerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/maps/${archive.mapPlayer.map.id}`} className="hover:underline">
                        {archive.mapPlayer.map.name}
                      </Link>
                    </TableCell>
                    <TableCell>{archive._count.entries}</TableCell>
                    <TableCell>
                      {new Date(archive.updatedAt).toLocaleString('zh-CN')}
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
