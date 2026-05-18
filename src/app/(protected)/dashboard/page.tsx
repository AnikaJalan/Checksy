import { Suspense } from 'react'
import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions, studentResults } from '@/lib/db/schema'
import { eq, desc, count, avg, sql } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Upload, FileText, CheckCircle2, Clock, Activity, Sparkles, AlertTriangle } from 'lucide-react'

async function StatsRow({ teacherId }: { teacherId: string }) {
  const [sessionCount] = await db
    .select({ count: count() })
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacherId))

  const [resultCount] = await db
    .select({ count: count() })
    .from(studentResults)
    .innerJoin(gradingSessions, eq(studentResults.sessionId, gradingSessions.id))
    .where(eq(gradingSessions.teacherId, teacherId))

  const [avgScoreRow] = await db
    .select({ avg: avg(studentResults.score) })
    .from(studentResults)
    .innerJoin(gradingSessions, eq(studentResults.sessionId, gradingSessions.id))
    .where(eq(gradingSessions.teacherId, teacherId))

  const [flaggedCount] = await db
    .select({ count: count() })
    .from(studentResults)
    .innerJoin(gradingSessions, eq(studentResults.sessionId, gradingSessions.id))
    .where(
      sql`${gradingSessions.teacherId} = ${teacherId} AND ${studentResults.isFlagged} = true`
    )

  const totalSessions = sessionCount?.count ?? 0
  const totalSubmissions = resultCount?.count ?? 0
  const avgScore = avgScoreRow?.avg ? Math.round(Number(avgScoreRow.avg)) : 0
  const totalFlagged = flaggedCount?.count ?? 0

  const stats = [
    { title: 'TOTAL SESSIONS', value: totalSessions, icon: FileText, color: 'bg-slate-100 text-slate-600' },
    { title: 'SUBMISSIONS GRADED', value: totalSubmissions, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'AVG SCORE', value: totalSubmissions > 0 ? `${avgScore}%` : '—', icon: Activity, color: 'bg-blue-50 text-blue-600' },
    { title: 'FLAGGED', value: totalFlagged, icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{stat.title}</p>
                <h3 className="text-4xl font-serif font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function RecentActivity({ teacherId }: { teacherId: string }) {
  const sessions = await db
    .select()
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacherId))
    .orderBy(desc(gradingSessions.createdAt))
    .limit(5)

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-serif font-bold text-slate-900">Recent Sessions</CardTitle>
      </CardHeader>
      <div className="divide-y divide-slate-100">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">No grading sessions yet.</p>
            <Link
              href="/upload"
              className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
            >
              Upload your first batch →
            </Link>
          </div>
        ) : (
          sessions.map((session) => {
            const statusLabel =
              session.status === 'completed'
                ? 'Graded'
                : session.status === 'processing'
                ? 'Processing'
                : 'Pending'
            return (
              <Link
                key={session.id}
                href={`/grade/${session.id}`}
                className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      statusLabel === 'Graded'
                        ? 'bg-emerald-50 text-emerald-600'
                        : statusLabel === 'Processing'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {statusLabel === 'Graded' && <CheckCircle2 className="w-5 h-5" />}
                    {statusLabel === 'Processing' && <Clock className="w-5 h-5" />}
                    {statusLabel === 'Pending' && <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-slate-900 text-[15px] capitalize">
                      {session.subject} Evaluation
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(session.createdAt).toLocaleDateString()} · {session.totalFiles}{' '}
                      file{session.totalFiles !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      statusLabel === 'Graded'
                        ? 'bg-emerald-100/50 text-emerald-600'
                        : statusLabel === 'Processing'
                        ? 'bg-blue-100/50 text-blue-600'
                        : 'bg-amber-100/50 text-amber-600'
                    }`}
                  >
                    {statusLabel}
                  </span>
                  {session.averageScore != null && (
                    <span className="font-serif font-bold text-slate-900 text-sm">
                      {Math.round(session.averageScore)}%
                    </span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </Card>
  )
}

export default async function DashboardPage() {
  const teacher = await getTeacher()
  if (!teacher) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-3xl p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Dashboard</span>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Welcome to Checksy</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your AI-powered grading assistant. Upload student submissions and get instant, accurate grades powered by
              advanced AI.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg"
            >
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <Suspense fallback={<Skeleton className="h-32 w-full rounded-2xl" />}>
        <StatsRow teacherId={teacher.id} />
      </Suspense>

      {/* Recent Activity */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <RecentActivity teacherId={teacher.id} />
      </Suspense>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/upload" className="group">
          <Card className="border-slate-200 shadow-sm rounded-2xl hover:border-slate-300 hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">Upload Submissions</h4>
                <p className="text-sm text-slate-500">Upload ZIP files with student work</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/keys" className="group">
          <Card className="border-slate-200 shadow-sm rounded-2xl hover:border-slate-300 hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">API Keys</h4>
                <p className="text-sm text-slate-500">Configure your AI provider keys</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
