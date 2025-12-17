import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal } from 'lucide-react'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ mapId?: string; dimensionId?: string }>
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { mapId, dimensionId } = await searchParams

  // 获取所有地图和维度
  const maps = await prisma.map.findMany({
    orderBy: { name: 'asc' },
    include: {
      dimensions: true,
    },
  })

  // 如果选择了维度，获取排行榜数据
  let leaderboardData = null
  let selectedDimension = null

  if (dimensionId) {
    selectedDimension = await prisma.leaderboardDimension.findUnique({
      where: { id: dimensionId },
      include: { map: true },
    })

    if (selectedDimension) {
      const sortOrder = selectedDimension.sortOrder === 'ASC'
        ? Prisma.SortOrder.asc
        : Prisma.SortOrder.desc

      const entries = await prisma.leaderboardEntry.findMany({
        where: { dimensionId },
        orderBy: { value: sortOrder },
        take: 50,
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
      })

      leaderboardData = entries.map((entry, index) => ({
        rank: index + 1,
        playerName: entry.archive.mapPlayer.player.playerName,
        playerId: entry.archive.mapPlayer.player.id,
        archiveName: entry.archive.name,
        archiveId: entry.archive.id,
        value: entry.value,
        updatedAt: entry.updatedAt,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">排行榜</h1>
        <p className="text-muted-foreground">查看各地图的排行榜数据</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* 地图和维度选择 */}
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
                    <div className="space-y-1">
                      {map.dimensions.map((dim) => (
                        <Link
                          key={dim.id}
                          href={`/leaderboard?mapId=${map.id}&dimensionId=${dim.id}`}
                        >
                          <div
                            className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                              dimensionId === dim.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
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

        {/* 排行榜数据 */}
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
                    <TableRow key={entry.archiveId}>
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
                        <Link href={`/players/${entry.playerId}`} className="font-medium hover:underline">
                          {entry.playerName}
                        </Link>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
