import Link from 'next/link'
import prisma from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/pagination'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  const [players, total] = await Promise.all([
    prisma.player.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { mapPlayers: true },
        },
      },
    }),
    prisma.player.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">玩家列表</h1>
        <p className="text-muted-foreground">所有注册的玩家</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">暂无玩家</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>玩家名</TableHead>
                  <TableHead>玩家 ID</TableHead>
                  <TableHead>参与地图数</TableHead>
                  <TableHead>注册时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link href={`/players/${player.id}`} className="font-medium hover:underline">
                        {player.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {player.playerId}
                    </TableCell>
                    <TableCell>{player._count.mapPlayers}</TableCell>
                    <TableCell>
                      {new Date(player.createdAt).toLocaleDateString('zh-CN')}
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
