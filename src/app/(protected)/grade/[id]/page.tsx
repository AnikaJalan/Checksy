import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions } from '@/lib/db/schema'
import { getResultsBySession } from '@/lib/services/student-results.service'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  ShieldAlert,
  Flag,
  ArrowLeft,
  Download,
  Trophy,
} from 'lucide-react'

function ScoreBadge({ score, max = 100 }: { score: number | null; max?: number }) {
  if (score === null) return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">—</span>
  const pct = max > 0 ? (score / max) * 100 : 0
  if (pct >= 90) return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{score}%</span>
  if (pct >= 70) return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{score}%</span>
  if (pct >= 50) return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{score}%</span>
  return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">{score}%</span>
}

function AiBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold">—</span>
  if (pct >= 70) return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">{pct}%</span>
  if (pct >= 40) return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{pct}%</span>
  return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{pct}%</span>
}

export default async function GradingResultPage({ params }: { params: { id: string } }) {
  const teacher = await getTeacher()
  if (!teacher) redirect('/')
  const { id } = await params

  const [session] = await db
    .select()
    .from(gradingSessions)
    .where(and(eq(gradingSessions.id, id), eq(gradingSessions.teacherId, teacher.id)))
    .limit(1)

  if (!session) return (
    <div className="p-12 text-center text-slate-500">
      Session not found or you don't have access.
    </div>
  )

  const results = await getResultsBySession(session.id, teacher.id)

  const gradedResults = results.filter((r) => r.score !== null)
  const avgScore = gradedResults.length > 0
    ? Math.round(gradedResults.reduce((a, c) => a + (c.score ?? 0), 0) / gradedResults.length)
    : 0
  const avgAi = results.filter(r => r.aiContentPercentage !== null).length > 0
    ? Math.round(results.filter(r => r.aiContentPercentage !== null).reduce((a, c) => a + (c.aiContentPercentage ?? 0), 0) / results.filter(r => r.aiContentPercentage !== null).length)
    : 0
  const flagCount = results.filter((r) => r.isFlagged).length
  const maxScore = session.maxScore ?? 100

  // Grade distribution
  const gradeOf = (score: number | null) => {
    if (score === null) return null
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
    if (pct >= 90) return 'A'
    if (pct >= 80) return 'B'
    if (pct >= 70) return 'C'
    if (pct >= 60) return 'D'
    return 'F'
  }

  const gradeBands = [
    { label: 'A', range: '90–100%', color: '#10b981', textColor: 'text-emerald-700' },
    { label: 'B', range: '80–89%', color: '#3b82f6', textColor: 'text-blue-700' },
    { label: 'C', range: '70–79%', color: '#f59e0b', textColor: 'text-amber-700' },
    { label: 'D', range: '60–69%', color: '#f97316', textColor: 'text-orange-700' },
    { label: 'F', range: '0–59%', color: '#f43f5e', textColor: 'text-rose-700' },
  ]

  const gradeCounts = gradeBands.reduce((acc, b) => {
    acc[b.label] = results.filter((r) => gradeOf(r.score) === b.label).length
    return acc
  }, {} as Record<string, number>)

  const topPerformers = [...gradedResults]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)

  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#94a3b8', '#94a3b8']

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sessions"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              {(session as any).name ?? 'Grading Results'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5 capitalize">
              {session.subject} · {session.strictness} strictness
            </p>
          </div>
        </div>
        <a
          href={`/api/export/csv?sessionId=${session.id}`}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Total Students',
            value: results.length,
            icon: Users,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
          },
          {
            label: 'Average Score',
            value: `${avgScore}%`,
            icon: TrendingUp,
            iconColor: 'text-emerald-500',
            iconBg: 'bg-emerald-50',
          },
          {
            label: 'Subject',
            value: session.subject.charAt(0).toUpperCase() + session.subject.slice(1),
            icon: BookOpen,
            iconColor: 'text-violet-500',
            iconBg: 'bg-violet-50',
          },
          {
            label: 'Graded On',
            value: new Date(session.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            icon: Calendar,
            iconColor: 'text-slate-500',
            iconBg: 'bg-slate-100',
          },
          {
            label: 'Avg AI Content',
            value: `${avgAi}%`,
            icon: ShieldAlert,
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-50',
          },
          {
            label: 'Flagged',
            value: flagCount,
            icon: Flag,
            iconColor: 'text-rose-500',
            iconBg: 'bg-rose-50',
          },
        ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between shadow-sm"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-xl font-serif font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Grade Distribution + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-serif font-bold text-slate-900 mb-5">Grade Distribution</h2>
          <div className="space-y-3">
            {gradeBands.map((band) => {
              const count = gradeCounts[band.label] ?? 0
              const width = results.length > 0 ? (count / results.length) * 100 : 0
              return (
                <div key={band.label} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: band.color }}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {band.label}
                    </span>
                    <span className="text-slate-400 font-normal text-xs">({band.range})</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${width}%`, backgroundColor: band.color }}
                    />
                  </div>
                  <span className="w-24 text-right text-sm font-semibold text-slate-700">
                    {count} student{count !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-serif font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top Performers
          </h2>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-slate-400">No graded results yet.</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: rankColors[i] ?? '#94a3b8' }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {r.studentName}
                  </span>
                  <ScoreBadge score={r.score} max={maxScore} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Student Grades */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-serif font-bold text-slate-900">All Student Grades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Student Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">File</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Content %</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Feedback</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No results yet. The grading job may still be running.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{r.studentName}</td>
                    <td className="px-4 py-4 text-slate-400 text-xs max-w-[140px] truncate">{r.fileName}</td>
                    <td className="px-4 py-4 text-center">
                      <ScoreBadge score={r.score !== null ? Math.round(r.score) : null} max={maxScore} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <AiBadge pct={r.aiContentPercentage !== null ? Math.round(r.aiContentPercentage ?? 0) : null} />
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-sm max-w-xs">
                      <p className="line-clamp-2">{r.feedback ?? '—'}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {r.status === 'graded' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
                          Graded
                        </span>
                      ) : r.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wide">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
