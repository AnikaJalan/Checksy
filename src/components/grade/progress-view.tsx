'use client';
import { useEffect, useState } from 'react';

export function ProgressView({ sessionId, onComplete }: { sessionId: string; onComplete: () => void }) {
  const [stats, setStats] = useState<{ status: string; totalFiles: number }>({ status: 'pending', totalFiles: 0 });
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/grade/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        setStats({ status: data.session.status, totalFiles: data.session.totalFiles || 0 });
        setCompletedCount(data.results ? data.results.length : 0);

        if (data.session.status === 'completed' || data.session.status === 'partial' || data.session.status === 'failed') {
          clearInterval(interval);
          if (data.session.status !== 'failed') setTimeout(() => onComplete(), 1000);
        }
      } catch (err) {
        // Silent poll fail tracking continuously natively handling disconnects gracefully
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, onComplete]);

  const progressPercentage = stats.totalFiles > 0 ? Math.round((completedCount / stats.totalFiles) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-12 text-center animate-in fade-in duration-700">
      <div className="space-y-6">
        <h2 className="text-xl font-medium tracking-tight">Active Execution</h2>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border">
           <div 
             className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
             style={{ width: `${progressPercentage}%` }}
           />
        </div>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {stats.status === 'failed' ? 'Batch execution fatal.' : `Processed ${completedCount} of ${stats.totalFiles || '?'} submissions`}
        </p>
      </div>
    </div>
  );
}
