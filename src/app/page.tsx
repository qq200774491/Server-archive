export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Server Archive</h1>
        <p className="text-muted-foreground mb-8">
          游戏存档管理系统 - 多地图、多玩家、多维度排行榜
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/admin/login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            进入管理端
          </a>
          <a
            href="/leaderboard"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            排行榜
          </a>
        </div>
      </div>
    </main>
  )
}
