import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/pagination'
import { Badge } from '@/components/ui/badge'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    map?: string
    player?: string
    archive?: string
    from?: string
    to?: string
  }>
}

export default async function ArchivesPage({ searchParams }: PageProps) {
  const { page: pageParam, limit: limitParam, map, player, archive, from, to } =
    await searchParams
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam ?? '20', 10) || 20))
  const skip = (page - 1) * limit
  const mapFilter = map?.trim()
  const playerFilter = player?.trim()
  const archiveFilter = archive?.trim()

  const filters: Prisma.ArchiveWhereInput[] = []

  if (mapFilter) {
    filters.push({
      OR: [
        { mapPlayer: { map: { name: { contains: mapFilter, mode: 'insensitive' } } } },
        { mapPlayer: { map: { id: { contains: mapFilter } } } },
      ],
    })
  }

  if (playerFilter) {
    filters.push({
      OR: [
        { mapPlayer: { player: { playerName: { contains: playerFilter, mode: 'insensitive' } } } },
        { mapPlayer: { player: { playerId: { contains: playerFilter } } } },
      ],
    })
  }

  if (archiveFilter) {
    filters.push({ name: { contains: archiveFilter, mode: 'insensitive' } })
  }

  const updatedAtFilter: Prisma.DateTimeFilter = {}
  if (from) {
    const start = new Date(`${from}T00:00:00`)
    if (!Number.isNaN(start.getTime())) {
      updatedAtFilter.gte = start
    }
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999`)
    if (!Number.isNaN(end.getTime())) {
      updatedAtFilter.lte = end
    }
  }
  if (Object.keys(updatedAtFilter).length > 0) {
    filters.push({ updatedAt: updatedAtFilter })
  }

  const where = filters.length > 0 ? { AND: filters } : undefined

  const [archives, total] = await Promise.all([
    prisma.archive.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
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
    }),
    prisma.archive.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit">存档列表</Badge>
        <h1 className="font-display text-3xl font-semibold">存档列表</h1>
        <p className="text-muted-foreground">所有玩家的存档记录</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <form className="grid gap-4 md:grid-cols-6" method="get">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="map">地图（名称或 ID）</Label>
              <Input id="map" name="map" defaultValue={map ?? ''} placeholder="地图名称/ID" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="player">玩家（名称或 ID）</Label>
              <Input id="player" name="player" defaultValue={player ?? ''} placeholder="玩家名称/ID" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="archive">存档名</Label>
              <Input id="archive" name="archive" defaultValue={archive ?? ''} placeholder="存档名称" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="from">开始日期</Label>
              <Input id="from" name="from" type="date" defaultValue={from ?? ''} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="to">结束日期</Label>
              <Input id="to" name="to" type="date" defaultValue={to ?? ''} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="limit">每页条数</Label>
              <select
                id="limit"
                name="limit"
                defaultValue={String(limit)}
                className="flex h-10 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm ring-offset-background backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-6">
              <Button type="submit">筛选</Button>
              <Link href="/archives">
                <Button type="button" variant="outline">
                  重置
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {totalPages > 1 && (
        <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} />
      )}
    </div>
  )
}
