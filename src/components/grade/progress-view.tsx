'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionData {
  status: string;
  totalFiles: number;
}

export function ProgressView({ sessionId, onComplete }: { sessionId: string; onComplete: () => void }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData>({ status: 'pending', totalFiles: 0 });
  const [completedCount, setCompletedCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/grade/${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();

      const s: SessionData = {
        status: data.session?.status ?? 'pending',
        totalFiles: data.session?.totalFiles ?? 0,
      };
      setSession(s);
      setCompletedCount(Array.isArray(data.results) ? data.results.length : 0);

      if (s.status === 'completed' || s.status === 'partial') {
        setTimeout(() => onComplete(), 800);
      }
    } catch {
      // silent — keep trying
    }
  }, [sessionId, onComplete]);

  // Poll every 2.5 seconds
  useEffect(() => {
    poll(); // immediate first call
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [poll]);

  // Track elapsed time & set timeout after 3 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= 180) setTimedOut(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isFailed = session.status === 'failed';
  const isDone = session.status === 'completed' || session.status === 'partial';
  const progressPct =
    session.totalFiles > 0 ? Math.round((completedCount / session.totalFiles) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto p-12 text-center space-y-8 animate-in fade-in duration-700">
      {/* Icon */}
      <div className="flex justify-center">
        {isFailed ? (
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
        ) : isDone ? (
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-semibold text-slate-900">
          {isFailed
            ? 'Grading Failed'
            : isDone
            ? 'Grading Complete!'
            : timedOut
            ? 'Taking longer than expected…'
            : 'Grading in Progress'}
        </h2>
        <p className="text-sm text-slate-500">
          {isFailed
            ? 'Something went wrong with the batch job.'
            : isDone
            ? `Processed ${completedCount} of ${session.totalFiles} submissions.`
            : `Processed ${completedCount} of ${session.totalFiles || '?'} submissions`}
        </p>
      </div>

      {/* Progress bar */}
      {!isFailed && (
        <div className="space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                isDone ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: session.totalFiles > 0 ? `${progressPct}%` : '15%' }}
            />
          </div>
          {session.totalFiles > 0 && (
            <p className="text-xs text-slate-400 text-right">{progressPct}%</p>
          )}
        </div>
      )}

      {/* Status note */}
      {!isFailed && !isDone && !timedOut && (
        <p className="text-xs text-slate-400">
          The AI is analyzing each submission in the background. This may take a minute or two.
        </p>
      )}

      {/* Timeout escape hatch */}
      {timedOut && !isDone && !isFailed && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
          <p className="text-sm font-medium text-amber-800">
            The job is taking longer than expected.
          </p>
          <p className="text-xs text-amber-600">
            The background worker may still be running. Check back on the Sessions page.
          </p>
          <Button
            onClick={() => router.push(`/grade/${sessionId}`)}
            variant="outline"
            size="sm"
            className="mt-1 rounded-full border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            View Results Anyway <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <Button
          onClick={() => router.push('/upload')}
          variant="outline"
          className="rounded-full"
        >
          Try Again
        </Button>
      )}

      {/* Done redirect button */}
      {isDone && (
        <Button
          onClick={onComplete}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6"
        >
          View Results <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
