'use client';
import { useState } from 'react';

export function ResultsTable({ results }: { results: any[] }) {
  const [filter, setFilter] = useState('');
  
  // Real-time pure filtering array mapping matching string slices iteratively gracefully.
  const filtered = results.filter(r => r.studentName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <input 
        type="text" 
        placeholder="Filter by specific student constraint..." 
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="h-10 w-full max-w-sm rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      
      <div className="w-full overflow-x-auto border rounded-sm">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="py-3 px-4 text-left font-medium">Student Identify Constraint</th>
              <th className="py-3 px-4 text-right font-medium">Mapped Score</th>
              <th className="py-3 px-4 text-center font-medium">Heuristic AI %</th>
              <th className="py-3 px-4 text-center font-medium">Detection Risk Alerts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
               <tr key={r.id} className="hover:bg-muted/30 transition-colors duration-200">
                 <td className="py-3 px-4 font-medium tracking-tight">{r.studentName}</td>
                 <td className="py-3 px-4 text-right tabular-nums tracking-tighter text-base">{r.score !== null ? `${r.score}` : 'Err'}</td>
                 <td className="py-3 px-4 text-center tabular-nums text-muted-foreground tracking-tight">{r.aiScore !== null ? `${r.aiScore}%` : '-'}</td>
                 <td className="py-3 px-4 text-center">
                   {r.isFlagged ? (
                     <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest leading-none">High Alert</span>
                   ) : (
                     <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest leading-none">Clean Pass</span>
                   )}
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
