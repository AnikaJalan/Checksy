import { Suspense } from 'react';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getStatistics } from '@/lib/services/statistics.service';
import { db } from '@/lib/db';
import { gradingSessions, apiKeys } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

async function StatsRow({ teacherId }: { teacherId: string }) {
  const stats = await getStatistics(teacherId);
  
  if (!stats) return <p className="text-sm text-muted-foreground">No grading activity yet.</p>;

  // Convert raw seconds visually matching time constraints locally
  const hoursSaved = Math.floor(stats.timeSavedSeconds / 3600);
  const minsSaved = Math.floor((stats.timeSavedSeconds % 3600) / 60);
  const timeSavedStr = hoursSaved > 0 ? `${hoursSaved}h ${minsSaved}m` : `${minsSaved} mins`;

  return (
    <div className="flex flex-wrap gap-12 border-b pb-8">
      <div className="flex flex-col space-y-1">
        <span className="text-4xl font-semibold tracking-tighter">{stats.totalGraded}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Graded</span>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-4xl font-semibold tracking-tighter">{stats.averageScore}%</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg Score</span>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-4xl font-semibold tracking-tighter">{stats.flaggedCount}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Flagged Risks</span>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-4xl font-semibold tracking-tighter text-emerald-600 dark:text-emerald-500">{timeSavedStr}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Saved</span>
      </div>
    </div>
  );
}

async function RecentSessions({ teacherId }: { teacherId: string }) {
  const sessions = await db.select()
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacherId))
    .orderBy(desc(gradingSessions.createdAt))
    .limit(6);

  const [hasApiKey] = await db.select().from(apiKeys).where(eq(apiKeys.teacherId, teacherId)).limit(1);

  if (sessions.length === 0) {
    return (
      <div className="border border-dashed p-8 text-center rounded-lg text-sm text-muted-foreground">
        <p>No active grading sessions history.</p>
        {!hasApiKey && (
           <p className="mt-2 text-foreground">
             Get started by <Link href="/settings/keys" className="underline underline-offset-4 text-blue-600">configuring an LLM Provider Key here</Link>.
           </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full text-left overflow-x-auto">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="text-muted-foreground font-medium border-b">
          <tr>
            <th className="pb-3 pr-4 font-medium text-left">Assignment Name</th>
            <th className="pb-3 px-4 font-medium text-left">Status</th>
            <th className="pb-3 px-4 font-medium text-right">Files</th>
            <th className="pb-3 pl-4 font-medium text-right">Date Executed</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sessions.map(s => (
             <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
               <td className="py-4 pr-4">
                 <Link href={`/grade/${s.id}`} className="font-medium hover:underline focus:underline outline-none">
                   {s.name}
                 </Link>
               </td>
               <td className="py-4 px-4">
                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold ${
                   s.status === 'completed' ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                   s.status === 'failed' ? 'bg-red-100/50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                   s.status === 'processing' ? 'bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                 }`}>
                   {s.status}
                 </span>
               </td>
               <td className="py-4 px-4 text-right text-muted-foreground">
                 {s.totalFiles} submissions
               </td>
               <td className="py-4 pl-4 text-right text-muted-foregroundtabular-nums tracking-tight">
                 {new Date(s.createdAt).toLocaleDateString()}
               </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function DashboardPage() {
  const teacher = await getTeacher();
  if (!teacher) return null; // Wait for clerk native redirects

  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-5xl mx-auto space-y-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Grading Analytics</h2>
        </div>
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
           <StatsRow teacherId={teacher.id} />
        </Suspense>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Recent Sessions</h2>
        </div>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
           <RecentSessions teacherId={teacher.id} />
        </Suspense>
      </div>
    </div>
  );
}
