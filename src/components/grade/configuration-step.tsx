'use client';
import { useState } from 'react';
import { GradingConfig } from '@/types/grading';

export function ConfigurationStep({
  fileCount,
  files,
  onStartSession
}: {
  fileCount: number;
  files: any[];
  onStartSession: (config: GradingConfig) => void;
}) {
  const [subject, setSubject] = useState('general');
  const [strictness, setStrictness] = useState<'lenient' | 'moderate' | 'strict'>('moderate');
  const [enableAiDetection, setEnableAiDetection] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onStartSession({
      subject,
      strictness,
      enableAiDetection,
      customInstructions,
      maxScore: 100,
      feedbackTone: 'neutral',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-medium tracking-tight">Configure Execution</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider">
          {fileCount} submission{fileCount > 1 ? 's' : ''} extracted securely
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Subject Adapter</label>
          <div className="flex flex-wrap gap-2">
            {['general', 'english', 'history', 'science', 'math'].map(s => (
               <button
                 type="button"
                 key={s}
                 onClick={() => setSubject(s)}
                 className={`px-4 py-2 text-sm uppercase tracking-wider font-semibold border rounded-sm transition-colors ${subject === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
               >
                 {s}
               </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium leading-none">Strictness Tolerance</label>
          <div className="flex flex-wrap gap-2">
            {(['lenient', 'moderate', 'strict'] as const).map(s => (
               <button
                 type="button"
                 key={s}
                 onClick={() => setStrictness(s)}
                 className={`px-4 py-2 text-sm uppercase tracking-wider font-semibold border rounded-sm transition-colors ${strictness === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
               >
                 {s}
               </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium leading-none">Custom Pre-Prompt Injection (Optional)</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="E.g. Penalize them severely if they didn't include citations..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 rounded-sm border p-4">
          <input 
            type="checkbox" 
            id="ai-detect" 
            checked={enableAiDetection}
            onChange={(e) => setEnableAiDetection(e.target.checked)}
            className="h-4 w-4 rounded-sm border-primary text-primary shadow focus:ring-primary"
          />
          <div className="space-y-1 leading-none">
            <label htmlFor="ai-detect" className="text-sm font-medium cursor-pointer">Enable AI Content Heuristics</label>
            <p className="text-xs text-muted-foreground">Force queries checking for AI syntactical generation vectors.</p>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Dispatching Batch...' : 'Begin Mass Execution'}
          </button>
        </div>
      </form>
    </div>
  );
}
