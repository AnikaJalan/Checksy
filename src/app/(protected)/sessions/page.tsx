import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions, studentResults } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, FileText, AlertTriangle, ArrowRight, Upload } from 'lucide-react'
import { DeleteSessionButton } from '@/components/sessions/delete-session-button'

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100/60 text-emerald-700">
        <CheckCircle2 className="w-3 h-3" /> Graded
      </span>
    )
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-100/60 text-blue-700">
        <Clock className="w-3 h-3" /> Processing
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-100/60 text-rose-700">
        <AlertTriangle className="w-3 h-3" /> Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-100/60 text-amber-700">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
}

export default async function SessionsPage() {
  const teacher = await getTeacher()
  if (!teacher) redirect('/')

  const sessions = await db
    .select()
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacher.id))
    .orderBy(desc(gradingSessions.createdAt))

  // Get result counts per session in one query
  const resultCounts = await db
    .select({
      sessionId: studentResults.sessionId,
      count: count(),
    })
    .from(studentResults)
    .groupBy(studentResults.sessionId)

  const countMap = new Map(resultCounts.map((r) => [r.sessionId, r.count]))

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Sessions
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            All Grading Sessions
          </h1>
          <p className="text-slate-500 text-sm">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          asChild
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6 shadow-md"
        >
          <Link href="/upload">
            <Upload className="w-4 h-4 mr-2" />
            New Session
          </Link>
        </Button>
      </div>

      {/* Sessions Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No sessions yet</p>
            <p className="text-slate-400 text-sm">Upload a ZIP of student files to create your first grading session.</p>
            <Link
              href="/upload"
              className="inline-block mt-2 text-sm font-semibold text-zinc-900 underline underline-offset-2"
            >
              Upload now →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Session
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Files
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Avg Score
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Created
                </th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => {
                const resultCount = countMap.get(session.id) ?? 0
                return (
                  <tr
                    key={session.id}
                    className="group hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-serif font-medium text-slate-900 text-[15px]">
                          {(session as any).name || `${session.subject} Evaluation`}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                          {session.subject} · {session.strictness} strictness
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-700 font-medium text-sm">
                        {resultCount}
                        <span className="text-slate-400 font-normal"> / {session.totalFiles}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-serif font-bold text-slate-900 text-sm">
                        {session.averageScore != null
                          ? `${Math.round(session.averageScore)}%`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-500">
                        {new Date(session.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <DeleteSessionButton sessionId={session.id} />
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium"
                        >
                          <Link href={`/grade/${session.id}`}>
                            View <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
