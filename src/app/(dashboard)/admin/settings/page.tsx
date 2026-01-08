import { requireAdminSession } from '@/lib/admin-session'
import { AdminSettingsForm } from '@/components/admin-settings-form'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const admin = await requireAdminSession()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit">账号设置</Badge>
        <h1 className="font-display text-3xl font-semibold">设置</h1>
        <p className="text-muted-foreground">管理账号与安全设置</p>
      </div>

      <AdminSettingsForm username={admin.username} />
    </div>
  )
}
