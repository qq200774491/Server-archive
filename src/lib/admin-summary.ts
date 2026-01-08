import prisma from '@/lib/db'

export async function getAdminSummary() {
  const [
    maps,
    players,
    archives,
    entries,
    latestMap,
    latestPlayer,
    latestArchive,
    latestEntry,
  ] = await Promise.all([
    prisma.map.count(),
    prisma.player.count(),
    prisma.archive.count(),
    prisma.leaderboardEntry.count(),
    prisma.map.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    prisma.player.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    prisma.archive.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    prisma.leaderboardEntry.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ])

  return {
    counts: {
      maps,
      players,
      archives,
      entries,
    },
    latest: {
      mapUpdatedAt: latestMap?.updatedAt ?? null,
      playerUpdatedAt: latestPlayer?.updatedAt ?? null,
      archiveUpdatedAt: latestArchive?.updatedAt ?? null,
      entryUpdatedAt: latestEntry?.updatedAt ?? null,
    },
  }
}
