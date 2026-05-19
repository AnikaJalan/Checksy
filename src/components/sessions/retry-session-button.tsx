'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function RetrySessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  async function handleRetry() {
    setLoading(true)
    try {
      const res = await fetch(`/api/grade/${sessionId}/retry`, { method: 'POST' })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || 'Retry failed')
      }
      toast.success('Session retry started')
      startTransition(() => router.refresh())
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Retry failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleRetry}
      disabled={loading || isPending}
      className="h-8 w-8 text-[#6c82a9] hover:text-[#1f3766] hover:bg-[#eaf1fc] transition-colors"
      title="Retry session"
      aria-label="Retry session"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
    </Button>
  )
}
