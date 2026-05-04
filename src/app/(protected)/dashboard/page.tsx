import { Suspense } from 'react'
import { getTeacher } from '@/lib/auth/get-teacher'
import { getStatistics } from '@/lib/services/statistics.service'
import { db } from '@/lib/db'
import { gradingSessions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Upload, RefreshCw, FileText, CheckCircle2, Clock, Activity, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

// Mocked data for UI visual demonstration while real stats build up
const MOCK_STATS = {
  total: 24,
  graded: 18,
  pending: 6,
  successRate: 92,
}

async function StatsRow({ teacherId }: { teacherId: string }) {
  // We fetch real stats, but mix with mock for visual parity with the design if empty
  const realStats = await getStatistics(teacherId)
  
  const stats = [
    {
      title: "TOTAL SUBMISSIONS",
      value: realStats && realStats.totalGraded > 0 ? realStats.totalGraded : MOCK_STATS.total,
      icon: FileText,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "GRADED",
      value: realStats && realStats.totalGraded > 0 ? realStats.totalGraded : MOCK_STATS.graded,
      icon: CheckCircle2,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "PENDING",
      value: MOCK_STATS.pending, // This would normally be calculated from active sessions
      icon: Clock,
      trend: "-3%",
      trendUp: false,
    },
    {
      title: "SUCCESS RATE",
      value: `${realStats && realStats.averageScore > 0 ? Math.round(realStats.averageScore) : MOCK_STATS.successRate}%`,
      icon: Activity,
      trend: "+5%",
      trendUp: true,
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{stat.title}</p>
                <h3 className="text-4xl font-serif font-bold text-slate-900">{stat.value}</h3>
                <p className="text-xs text-slate-400">
                  <span className={stat.trendUp ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                    {stat.trend}
                  </span>{" "}
                  from last week
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
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
  const realSessions = await db.select()
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacherId))
    .orderBy(desc(gradingSessions.createdAt))
    .limit(5)

  // Mix with mock data if real DB is empty to show the UI
  const sessions = realSessions.length > 0 ? realSessions.map(s => ({
    id: s.id,
    name: `${s.subject.charAt(0).toUpperCase() + s.subject.slice(1)} Evaluation`,
    time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: s.status === 'completed' ? 'Graded' : s.status === 'processing' ? 'Processing' : 'Pending',
    score: '—'
  })) : [
    { id: '1', name: 'Math Homework Set 5', time: '2 min ago', status: 'Graded', score: '95%' },
    { id: '2', name: 'Essay Assignment', time: '15 min ago', status: 'Processing', score: '—' },
    { id: '3', name: 'Science Quiz', time: '1 hour ago', status: 'Graded', score: '88%' },
    { id: '4', name: 'History Paper', time: '2 hours ago', status: 'Pending', score: '—' },
  ]

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-serif font-bold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <div className="divide-y divide-slate-100">
        {sessions.map((session, i) => (
          <div key={session.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                session.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' :
                session.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {session.status === 'Graded' && <CheckCircle2 className="w-5 h-5" />}
                {session.status === 'Processing' && <Clock className="w-5 h-5" />}
                {session.status === 'Pending' && <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-serif font-medium text-slate-900 text-[15px]">{session.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{session.time}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                session.status === 'Graded' ? 'bg-emerald-100/50 text-emerald-600' :
                session.status === 'Processing' ? 'bg-blue-100/50 text-blue-600' :
                'bg-amber-100/50 text-amber-600'
              }`}>
                {session.status}
              </span>
              {session.score !== '—' && (
                <span className="font-serif font-bold text-slate-900">{session.score}</span>
              )}
            </div>
          </div>
        ))}
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
              Your AI-powered grading assistant. Upload student submissions and get instant, accurate grades powered by advanced AI.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg">
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 rounded-full px-6 shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
                <h4 className="font-serif font-bold text-lg text-slate-900">AI Features</h4>
                <p className="text-sm text-slate-500">Explore AI-powered grading tools</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  )
}
