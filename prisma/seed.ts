import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 创建示例玩家
  const player1 = await prisma.player.upsert({
    where: { playerId: 'player-001' },
    update: {},
    create: {
      playerId: 'player-001',
      playerName: '测试玩家1',
    },
  })

  const player2 = await prisma.player.upsert({
    where: { playerId: 'player-002' },
    update: {},
    create: {
      playerId: 'player-002',
      playerName: '测试玩家2',
    },
  })

  console.log('Created players:', player1.playerName, player2.playerName)

  // 创建示例地图
  const map1 = await prisma.map.upsert({
    where: { id: 'map-001' },
    update: {},
    create: {
      id: 'map-001',
      name: '新手村',
      description: '适合新手的入门关卡',
      config: { difficulty: 'easy', maxPlayers: 100 },
    },
  })

  const map2 = await prisma.map.upsert({
    where: { id: 'map-002' },
    update: {},
    create: {
      id: 'map-002',
      name: '地狱熔岩',
      description: '高难度挑战关卡',
      config: { difficulty: 'hard', maxPlayers: 50 },
    },
  })

  console.log('Created maps:', map1.name, map2.name)

  // 创建排行榜维度
  const scoreDimension = await prisma.leaderboardDimension.upsert({
    where: { mapId_name: { mapId: map1.id, name: '分数' } },
    update: {},
    create: {
      mapId: map1.id,
      name: '分数',
      unit: '分',
      sortOrder: 'DESC',
    },
  })

  const timeDimension = await prisma.leaderboardDimension.upsert({
    where: { mapId_name: { mapId: map1.id, name: '通关时间' } },
    update: {},
    create: {
      mapId: map1.id,
      name: '通关时间',
      unit: '秒',
      sortOrder: 'ASC',
    },
  })

  console.log('Created dimensions:', scoreDimension.name, timeDimension.name)

  // 玩家加入地图
  const mapPlayer1 = await prisma.mapPlayer.upsert({
    where: { mapId_playerId: { mapId: map1.id, playerId: player1.id } },
    update: {},
    create: {
      mapId: map1.id,
      playerId: player1.id,
    },
  })

  const mapPlayer2 = await prisma.mapPlayer.upsert({
    where: { mapId_playerId: { mapId: map1.id, playerId: player2.id } },
    update: {},
    create: {
      mapId: map1.id,
      playerId: player2.id,
    },
  })

  // 创建存档
  const archive1 = await prisma.archive.create({
    data: {
      mapPlayerId: mapPlayer1.id,
      name: '存档1',
      data: { level: 5, coins: 1000, items: ['sword', 'shield'] },
    },
  })

  const archive2 = await prisma.archive.create({
    data: {
      mapPlayerId: mapPlayer2.id,
      name: '存档1',
      data: { level: 10, coins: 5000, items: ['sword', 'bow', 'armor'] },
    },
  })

  console.log('Created archives')

  // 创建排行榜记录
  await prisma.leaderboardEntry.createMany({
    data: [
      {
        dimensionId: scoreDimension.id,
        archiveId: archive1.id,
        value: 1500,
      },
      {
        dimensionId: scoreDimension.id,
        archiveId: archive2.id,
        value: 3200,
      },
      {
        dimensionId: timeDimension.id,
        archiveId: archive1.id,
        value: 180,
      },
      {
        dimensionId: timeDimension.id,
        archiveId: archive2.id,
        value: 120,
      },
    ],
  })

  console.log('Created leaderboard entries')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
