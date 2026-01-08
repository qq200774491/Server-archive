import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { CreateMapForm } from '@/components/create-map-form'

export default function NewMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/maps">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">创建地图</Badge>
          <div>
            <h1 className="font-display text-3xl font-semibold">创建地图</h1>
            <p className="text-muted-foreground">使用管理员权限创建新地图</p>
          </div>
        </div>
      </div>

      <CreateMapForm />
    </div>
  )
}

