import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/pagination'
import { Trophy, Medal } from 'lucide-react'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    mapId?: string
    dimensionId?: string
    mode?: string
    page?: string
    limit?: string
  }>
}

export default async function AdminLeaderboardPage({ searchParams }: PageProps) {
  const { mapId, dimensionId, mode: modeParam, page: pageParam, limit: limitParam } =
    await searchParams
  const mode = (modeParam ?? 'player').toLowerCase() === 'archive' ? 'archive' : 'player'
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam ?? '20', 10) || 20))
  const skip = (page - 1) * limit
  const limitQuery = `&limit=${limit}`

  const maps = await prisma.map.findMany({
    orderBy: { name: 'asc' },
    include: {
      dimensions: true,
    },
  })

  let leaderboardData: Array<{
    rank: number
    playerName: string
    playerDbId: string
    playerId: string
    archiveName: string
    archiveId: string
    value: unknown
    updatedAt: Date
  }> | null = null
  let selectedDimension = null
  let total = 0

  if (dimensionId) {
    selectedDimension = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
      include: { map: true },
    })

    if (selectedDimension) {
      const sortOrder =
        selectedDimension.sortOrder === 'ASC'
          ? Prisma.SortOrder.asc
          : Prisma.SortOrder.desc

      if (mode === 'archive') {
        const [entries, count] = await Promise.all([
          prisma.leaderboardEntry.findMany({
            where: { dimensionId },
            orderBy: { value: sortOrder },
            skip,
            take: limit,
            include: {
              archive: {
                include: {
                  mapPlayer: {
                    include: {
                      player: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.leaderboardEntry.count({ where: { dimensionId } }),
        ])

        total = count
        leaderboardData = entries.map((entry, index) => ({
          rank: skip + index + 1,
          playerName: entry.archive.mapPlayer.player.playerName,
          playerDbId: entry.archive.mapPlayer.player.id,
          playerId: entry.archive.mapPlayer.player.playerId,
          archiveName: entry.archive.name,
          archiveId: entry.archive.id,
          value: entry.value,
          updatedAt: entry.updatedAt,
        }))
      } else {
        type PlayerBestRow = {
          playerDbId: string
          playerId: string
          playerName: string
          archiveId: string
          archiveName: string
          value: string
          updatedAt: Date
        }

        const sortDir =
          selectedDimension.sortOrder === 'ASC' ? Prisma.sql`ASC` : Prisma.sql`DESC`

        const totalRows = await prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
          SELECT COUNT(*)::int AS "total"
          FROM (
            SELECT DISTINCT p.id
            FROM "LeaderboardEntry" le
            JOIN "Archive" a ON a.id = le."archiveId"
            JOIN "MapPlayer" mp ON mp.id = a."mapPlayerId"
            JOIN "Player" p ON p.id = mp."playerId"
            WHERE le."dimensionId" = ${dimensionId}
              AND mp."mapId" = ${selectedDimension.mapId}
          ) t
        `)

        total = totalRows[0]?.total ?? 0

        const rows = await prisma.$queryRaw<PlayerBestRow[]>(Prisma.sql`
          WITH ranked AS (
            SELECT
              p.id AS "playerDbId",
              p."playerId" AS "playerId",
              p."playerName" AS "playerName",
              a.id AS "archiveId",
              a.name AS "archiveName",
              le.value AS "value",
              le."updatedAt" AS "updatedAt",
              ROW_NUMBER() OVER (
                PARTITION BY p.id
                ORDER BY le.value ${sortDir}, le."updatedAt" DESC, le.id DESC
              ) AS rn
            FROM "LeaderboardEntry" le
            JOIN "Archive" a ON a.id = le."archiveId"
            JOIN "MapPlayer" mp ON mp.id = a."mapPlayerId"
            JOIN "Player" p ON p.id = mp."playerId"
            WHERE le."dimensionId" = ${dimensionId}
              AND mp."mapId" = ${selectedDimension.mapId}
          )
          SELECT
            "playerDbId",
            "playerId",
            "playerName",
            "archiveId",
            "archiveName",
            "value",
            "updatedAt"
          FROM ranked
          WHERE rn = 1
          ORDER BY "value" ${sortDir}, "updatedAt" DESC, "playerId" ASC
          LIMIT ${limit} OFFSET ${skip}
        `)

        leaderboardData = rows.map((row, index) => ({
          rank: skip + index + 1,
          playerName: row.playerName,
          playerDbId: row.playerDbId,
          playerId: row.playerId,
          archiveName: row.archiveName,
          archiveId: row.archiveId,
          value: row.value,
          updatedAt: row.updatedAt,
        }))
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit">管理端排行榜</Badge>
        <h1 className="font-display text-3xl font-semibold">排行榜（管理端）</h1>
        <p className="text-muted-foreground">查看各地图的排行榜数据</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">选择排行榜</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {maps.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无地图</p>
            ) : (
              maps.map((map) => (
                <div key={map.id} className="space-y-2">
                  <h3 className="font-medium">{map.name}</h3>
                  {map.dimensions.length === 0 ? (
                    <p className="text-muted-foreground text-xs">暂无排行榜</p>
                  ) : (
                    <div className="space-y-2">
                      {map.dimensions.map((dim) => (
                        <Link
                          key={dim.id}
                          href={`/admin/leaderboard?mapId=${map.id}&dimensionId=${dim.id}&mode=${mode}${limitQuery}`}
                        >
                          <div
                            className={`rounded-xl border border-transparent p-3 text-sm transition ${
                              dimensionId === dim.id
                                ? 'bg-primary text-primary-foreground shadow-[0_14px_24px_-18px_rgba(0,0,0,0.4)]'
                                : 'bg-muted/40 hover:border-border/70 hover:bg-muted/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{dim.name}</span>
                              {dim.unit && (
                                <Badge variant="outline" className="text-xs">
                                  {dim.unit}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedDimension
                ? `${selectedDimension.map.name} - ${selectedDimension.name}`
                : '请选择排行榜'}
            </CardTitle>
            {selectedDimension && (
              <CardDescription>
                排序方式: {selectedDimension.sortOrder === 'DESC' ? '高分优先' : '低分优先'}
                {selectedDimension.unit && ` | 单位: ${selectedDimension.unit}`}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedDimension && (
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-sm text-muted-foreground">
                  展示方式：{mode === 'player' ? '每玩家最佳' : '每存档'}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/leaderboard?mapId=${mapId ?? selectedDimension.mapId}&dimensionId=${selectedDimension.id}&mode=player${limitQuery}`}
                  >
                    <Button variant={mode === 'player' ? 'default' : 'outline'} size="sm">
                      每玩家最佳
                    </Button>
                  </Link>
                  <Link
                    href={`/admin/leaderboard?mapId=${mapId ?? selectedDimension.mapId}&dimensionId=${selectedDimension.id}&mode=archive${limitQuery}`}
                  >
                    <Button variant={mode === 'archive' ? 'default' : 'outline'} size="sm">
                      每存档
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!leaderboardData ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mb-4 opacity-50" />
                <p>请从左侧选择一个排行榜维度</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>暂无排行榜数据</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">排名</TableHead>
                      <TableHead>玩家</TableHead>
                      <TableHead>存档</TableHead>
                      <TableHead className="text-right">成绩</TableHead>
                      <TableHead>更新时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((entry) => (
                      <TableRow key={`${entry.archiveId}:${entry.playerDbId}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.rank <= 3 ? (
                              <Medal
                                className={`h-5 w-5 ${
                                  entry.rank === 1
                                    ? 'text-yellow-500'
                                    : entry.rank === 2
                                    ? 'text-gray-400'
                                    : 'text-amber-600'
                                }`}
                              />
                            ) : (
                              <span className="text-muted-foreground">{entry.rank}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/players/${entry.playerDbId}`} className="font-medium hover:underline">
                            {entry.playerName}
                          </Link>
                          <div className="text-xs text-muted-foreground">{entry.playerId}</div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/archives/${entry.archiveId}`} className="hover:underline">
                            {entry.archiveName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {Number(entry.value).toLocaleString()}
                          {selectedDimension?.unit && (
                            <span className="text-muted-foreground ml-1">
                              {selectedDimension.unit}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(entry.updatedAt).toLocaleString('zh-CN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
