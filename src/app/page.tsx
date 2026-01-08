import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowUpRight, Archive, Map, Trophy, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="container flex items-center justify-between py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary font-semibold">
            SA
          </span>
          <div>
            <div className="font-display text-xl font-semibold">Server Archive</div>
            <div className="text-xs text-muted-foreground">Game Save Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">
            公开排行榜
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container pb-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 page-fade">
            <Badge variant="outline" className="w-fit">
              多地图 · 多玩家 · 多维度
            </Badge>
            <h1 className="font-display text-4xl leading-tight md:text-5xl">
              为你的游戏提供
              <span className="text-primary">云端存档</span>
              与排行榜中枢
            </h1>
            <p className="text-lg text-muted-foreground">
              Server Archive 为游戏团队提供统一的存档、排行榜与玩家数据管理后台，
              简化接入，支持多地图与多维度榜单。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/login">
                <Button className="gap-2">
                  进入管理端
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline">查看排行榜</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                地图管理更清晰
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                玩家维度可追踪
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                排行榜多口径展示
              </div>
            </div>
          </div>

          <div className="space-y-4 stagger-1">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex items-center gap-3">
                <Archive className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">存档与排行榜</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                统一存储 JSON 存档数据，自动同步排行榜成绩，支持多维度排序规则。
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">公开榜单展示</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                面向玩家的公开排行榜支持分页与维度切换，让成绩更具可见性。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
