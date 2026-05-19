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
import { RetrySessionButton } from '@/components/sessions/retry-session-button'

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
          <span className="text-xs font-semibold text-[#6d84ac] uppercase tracking-widest">
            Sessions
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#14264d] tracking-tight">
            All Grading Sessions
          </h1>
          <p className="text-[#5c739b] text-sm">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center h-10 bg-[#111827] hover:bg-[#1d2940] text-white rounded-full px-6 text-sm font-medium shadow-md transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          New Session
        </Link>
      </div>

      {/* Sessions Table */}
      <Card className="border-[#d4dfef] bg-white/85 shadow-sm rounded-2xl overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ecf2ff] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-[#6e82a7]" />
            </div>
            <p className="text-[#5c739b] font-medium">No sessions yet</p>
            <p className="text-[#7d90b2] text-sm">Upload a ZIP of student files to create your first grading session.</p>
            <Link
              href="/upload"
              className="inline-block mt-2 text-sm font-semibold text-[#1f3766] underline underline-offset-2"
            >
              Upload now →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e3ebf6] bg-[#f4f8ff]/70">
                <th className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-[#6d84ac]">
                  Session
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-[#6d84ac]">
                  Status
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-[#6d84ac]">
                  Files
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-[#6d84ac]">
                  Avg Score
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold uppercase tracking-widest text-[#6d84ac]">
                  Created
                </th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7eef8]">
              {sessions.map((session) => {
                const resultCount = countMap.get(session.id) ?? 0
                return (
                  <tr
                    key={session.id}
                    className="group hover:bg-[#f2f6fc] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-serif font-medium text-[#162850] text-[15px]">
                          {(session as any).name || `${session.subject} Evaluation`}
                        </p>
                        <p className="text-xs text-[#7d90b2] mt-0.5 capitalize">
                          {session.subject} · {session.strictness} strictness
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[#2a3f67] font-medium text-sm">
                        {resultCount}
                        <span className="text-[#7d90b2] font-normal"> / {session.totalFiles}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-serif font-bold text-[#162850] text-sm">
                        {session.averageScore != null
                          ? `${Math.round(session.averageScore)}%`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-[#5c739b]">
                        {new Date(session.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {(session.status === 'pending' || session.status === 'failed' || session.status === 'partial') && (
                          <RetrySessionButton sessionId={session.id} />
                        )}
                        <DeleteSessionButton sessionId={session.id} />
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-[#5c739b] hover:text-[#162850] hover:bg-[#eaf1fc] rounded-lg text-xs font-medium"
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
