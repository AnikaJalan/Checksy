'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, FileText, UserRound, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

type SessionResult = {
  id: string
  name: string | null
  subject: string
  status: string
  createdAt: string
}

type StudentResult = {
  sessionId: string
  studentName: string
  sessionName: string | null
  subject: string
  createdAt: string
}

type SearchResponse = {
  sessions: SessionResult[]
  students: StudentResult[]
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse>({ sessions: [], students: [] })
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const hasResults = useMemo(
    () => results.sessions.length > 0 || results.students.length > 0,
    [results]
  )

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults({ sessions: [], students: [] })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Search failed')
        const data: SearchResponse = await res.json()
        setResults(data)
        setIsOpen(true)
      } catch {
        if (!controller.signal.aborted) {
          setResults({ sessions: [], students: [] })
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, 220)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query])

  function openSession(sessionId: string) {
    setIsOpen(false)
    setQuery('')
    router.push(`/grade/${sessionId}`)
  }

  return (
    <div ref={wrapRef} className="relative w-96">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8aa0c3]" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search sessions or students..."
        className="pl-10 pr-9 bg-white/85 border border-[#d9e3f1] shadow-none rounded-full h-10 text-sm text-[#243a63] placeholder:text-[#8ca1c4] focus-visible:ring-2 focus-visible:ring-[#bad0ec]"
      />
      {isLoading ? (
        <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8aa0c3] animate-spin" />
      ) : null}

      {isOpen && query.trim().length >= 2 ? (
        <div className="absolute top-[calc(100%+0.5rem)] w-full rounded-2xl border border-[#d5e0f1] bg-white shadow-xl p-2 z-[120]">
          {hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {results.sessions.length > 0 ? (
                <div className="mb-1">
                  <p className="px-2 py-1 text-[10px] uppercase tracking-widest font-semibold text-[#7f93b6]">Sessions</p>
                  {results.sessions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openSession(item.id)}
                      className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-[#eff5ff] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#6281b6]" />
                        <p className="text-sm font-medium text-[#1a2f59] truncate">
                          {item.name || 'Untitled Session'}
                        </p>
                      </div>
                      <p className="pl-5 text-xs text-[#7085ab] capitalize">{item.subject} · {item.status}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {results.students.length > 0 ? (
                <div>
                  <p className="px-2 py-1 text-[10px] uppercase tracking-widest font-semibold text-[#7f93b6]">Students</p>
                  {results.students.map((item, i) => (
                    <button
                      key={`${item.sessionId}-${item.studentName}-${i}`}
                      onClick={() => openSession(item.sessionId)}
                      className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-[#eff5ff] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserRound className="w-3.5 h-3.5 text-[#6281b6]" />
                        <p className="text-sm font-medium text-[#1a2f59] truncate">{item.studentName}</p>
                      </div>
                      <p className="pl-5 text-xs text-[#7085ab] truncate">
                        {(item.sessionName || 'Untitled Session')} · {item.subject}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-[#7f93b6]">No results found.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
