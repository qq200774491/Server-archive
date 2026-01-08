'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  page: number
  totalPages: number
  paramName?: string
}

export function Pagination({ page, totalPages, paramName = 'page' }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasPrevious = page > 1
  const hasNext = page < totalPages

  function go(nextPage: number) {
    const next = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) next.delete(paramName)
    else next.set(paramName, String(nextPage))

    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => go(page - 1)}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        上一页
      </Button>

      <span className="text-sm text-muted-foreground px-4">
        第 {page} / {totalPages} 页
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => go(page + 1)}
        disabled={!hasNext}
      >
        下一页
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
