import { getTeacher } from '@/lib/auth/get-teacher';
import { db } from '@/lib/db';
import { gradingSessions } from '@/lib/db/schema';
import { getResultsBySession } from '@/lib/services/student-results.service';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { ResultsTable } from '@/components/grade/results-table';

export default async function GradingResultPage({ params }: { params: { id: string } }) {
  const teacher = await getTeacher();
  if (!teacher) redirect('/');
  const { id } = await params;

  // Securing horizontal data structures naturally isolating teachers.
  const [session] = await db.select()
    .from(gradingSessions)
    .where(and(eq(gradingSessions.id, id), eq(gradingSessions.teacherId, teacher.id)))
    .limit(1);

  if (!session) return <div className="p-12 text-center text-muted-foreground font-medium">Session architecture unmapped or disjoint.</div>;

  const results = await getResultsBySession(session.id, teacher.id);
  const avgScore = results.length > 0 
    ? results.filter(r => r.score !== null).reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length 
    : 0;
  
  const flagCount = results.filter(r => r.isFlagged).length;

  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight text-foreground">{session.name}</h1>
            <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
               Executed Sequence On {new Date(session.createdAt).toLocaleDateString()}
            </p>
         </div>
         <a 
           href={`/api/export/csv?sessionId=${session.id}`} 
           download 
           className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium tracking-wider uppercase text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
         >
           Download CSV Execution
         </a>
      </div>

      <div className="flex gap-12 border-b pb-8">
        <div className="flex flex-col space-y-1">
          <span className="text-5xl font-semibold tracking-tighter">{results.length}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Documents Executed</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-5xl font-semibold tracking-tighter">{avgScore.toFixed(0)}%</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Heuristic Class Median</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-5xl font-semibold tracking-tighter text-red-600 dark:text-red-500">{flagCount}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Target Detection Triggers</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-medium tracking-tight border-b pb-2">Internal Payload Mapping</h2>
        <ResultsTable results={results} />
      </div>
    </div>
  );
}
