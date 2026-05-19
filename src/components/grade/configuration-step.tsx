'use client';

import { useState } from 'react';
import { GradingConfig } from '@/types/grading';
import { Loader2, Trash2, Archive, ChevronDown, Zap, FileText } from 'lucide-react';

const SUBJECTS = [
  { value: 'general', label: 'General' },
  { value: 'english', label: 'English / Language Arts' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History / Social Studies' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'economics', label: 'Economics' },
];

const QUICK_PROMPTS = [
  {
    id: 'standard',
    title: 'Standard Grading',
    desc: 'Grade based on correctness, completeness, and understanding of the material.',
    value: '',
  },
  {
    id: 'constructive',
    title: 'Constructive Feedback Focus',
    desc: 'Focus on providing detailed constructive feedback that helps students improve.',
    value: 'Prioritise actionable, constructive feedback for every student. Highlight what they did well before pointing out gaps. Suggest specific improvements.',
  },
  {
    id: 'strict',
    title: 'Strict Grading',
    desc: 'Apply strict grading standards with emphasis on accuracy and precision.',
    value: 'Apply strict academic standards. Penalise vague language, missing citations, and logical errors. Reward precise, well-supported arguments.',
  },
  {
    id: 'creative',
    title: 'Creative Assessment',
    desc: 'Reward original thinking, creativity, and unique perspectives.',
    value: 'Reward original ideas, creative expression, and unique perspectives. Do not penalise unconventional structure if the argument is compelling.',
  },
];

function strictnessLabel(val: number) {
  if (val < 25) return { text: 'LENIENT', color: 'bg-emerald-100 text-emerald-700' };
  if (val < 50) return { text: 'FAIR', color: 'bg-amber-100 text-amber-700' };
  if (val < 75) return { text: 'MODERATE', color: 'bg-orange-100 text-orange-700' };
  return { text: 'STRICT', color: 'bg-rose-100 text-rose-700' };
}

function strictnessToKey(val: number): 'lenient' | 'moderate' | 'strict' {
  if (val < 33) return 'lenient';
  if (val < 66) return 'moderate';
  return 'strict';
}

export function ConfigurationStep({
  fileCount,
  fileName,
  files,
  onStartSession,
  onCancel,
}: {
  fileCount: number;
  fileName?: string;
  files: any[];
  onStartSession: (config: GradingConfig, name: string) => void;
  onCancel?: () => void;
}) {
  const [sessionName, setSessionName] = useState('');
  const [subject, setSubject] = useState('general');
  const [strictnessVal, setStrictnessVal] = useState(50);
  const [maxScore, setMaxScore] = useState(100);
  const [enableAiDetection, setEnableAiDetection] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>('standard');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const label = strictnessLabel(strictnessVal);
  const selectedSubject = SUBJECTS.find((s) => s.value === subject);

  const handlePromptSelect = (id: string) => {
    setSelectedPrompt(id);
    const p = QUICK_PROMPTS.find((q) => q.id === id);
    if (p) setCustomInstructions(p.value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const name = sessionName.trim() || `${selectedSubject?.label ?? 'General'} — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    onStartSession(
      {
        subject,
        strictness: strictnessToKey(strictnessVal),
        enableAiDetection,
        customInstructions,
        maxScore,
        feedbackTone: 'neutral',
      },
      name
    );
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Configure Grading Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Define how your assignments should be graded.</p>
        </div>
        {fileName && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <Archive className="w-3 h-3" />
            {fileName}
          </span>
        )}
      </div>

      {/* Session Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Assignment Name
        </label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder={`e.g. Mid-term Essay — Class 10B`}
          maxLength={120}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
        />
        <p className="text-xs text-slate-400">Leave blank to auto-generate from subject &amp; date.</p>
      </div>

      {/* Subject Area */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject Area</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSubjectOpen(!subjectOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
          >
            {selectedSubject?.label ?? 'Select subject'}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${subjectOpen ? 'rotate-180' : ''}`} />
          </button>
          {subjectOpen && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { setSubject(s.value); setSubjectOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${subject === s.value ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grading Strictness */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grading Strictness</label>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${label.color}`}>
              {label.text}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {strictnessVal}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={strictnessVal}
            onChange={(e) => setStrictnessVal(Number(e.target.value))}
            className="flex-1 h-2 appearance-none rounded-full bg-slate-200 accent-zinc-900 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #18181b ${strictnessVal}%, #e2e8f0 ${strictnessVal}%)`
            }}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={strictnessVal}
            onChange={(e) => setStrictnessVal(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-16 px-2 py-1.5 text-center text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <p className="text-xs text-slate-400">
          {strictnessVal}% strictness determines how rigorously the AI evaluates answers.
        </p>
      </div>

      {/* Max Score */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Max Score</label>
        <div className="flex items-center gap-3">
          {[10, 20, 50, 100].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMaxScore(v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${maxScore === v ? 'bg-zinc-900 text-white border-zinc-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {v}
            </button>
          ))}
          <input
            type="number"
            min={1}
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            className="w-20 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Quick Prompt Selection */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Prompt Selection</label>
        <div className="space-y-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePromptSelect(p.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                selectedPrompt === p.id
                  ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${selectedPrompt === p.id ? 'bg-zinc-900' : 'bg-slate-300'}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Instructions</label>
        <textarea
          value={customInstructions}
          onChange={(e) => { setCustomInstructions(e.target.value); setSelectedPrompt(null); }}
          placeholder="Or write your own custom grading instructions…"
          className="w-full min-h-[100px] px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-slate-400"
        />
      </div>

      {/* AI Detection Toggle */}
      <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Content Detection</p>
            <p className="text-xs text-slate-400">Adds ~15s per file to check for AI-generated content</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enableAiDetection}
          onClick={() => setEnableAiDetection(!enableAiDetection)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableAiDetection ? 'bg-zinc-900' : 'bg-slate-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enableAiDetection ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dispatching…
            </>
          ) : (
            `Start Grading ${fileCount > 0 ? `(${fileCount} files)` : ''}`
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all"
            title="Cancel and re-upload"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
