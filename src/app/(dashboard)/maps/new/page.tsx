import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CreateMapForm } from '@/components/create-map-form'

export default function NewMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maps">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">创建地图</h1>
          <p className="text-muted-foreground">使用管理员权限创建新地图</p>
        </div>
      </div>

      <CreateMapForm />
    </div>
  )
}

