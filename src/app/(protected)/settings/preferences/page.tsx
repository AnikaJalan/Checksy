'use client'

import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Save,
  Loader2,
  GraduationCap,
  SlidersHorizontal,
  MessageSquare,
  ShieldAlert,
  Bell,
  Sparkles,
  RotateCcw,
  Brain,
} from 'lucide-react'

interface Preferences {
  defaultSubject: string
  defaultStrictness: string
  aiDetectionEnabled: boolean
  defaultMaxScore: number
  feedbackTone: string
  preferredLlmProvider: string | null
  preferredLlmModel: string | null
  // local-only extras (stored but mapped to existing fields)
  customMessage?: string
  emailNotifications?: boolean
  aiSensitivity?: string
  autoFlagThreshold?: number
}

const SUBJECTS = [
  { value: 'general', label: 'General', desc: 'General grading across all subjects.' },
  { value: 'mathematics', label: 'Mathematics', desc: 'Focuses on accuracy, working shown, and logic.' },
  { value: 'english', label: 'English / Language Arts', desc: 'Grammar, structure, argument quality.' },
  { value: 'science', label: 'Science', desc: 'Hypothesis, methodology, data interpretation.' },
  { value: 'history', label: 'History / Social Studies', desc: 'Evidence use, chronology, argument.' },
  { value: 'computer_science', label: 'Computer Science', desc: 'Code correctness, efficiency, comments.' },
  { value: 'economics', label: 'Economics', desc: 'Models, reasoning, data application.' },
]

const TONES = [
  { value: 'encouraging', label: 'Encouraging', desc: 'Warm and motivational, highlights strengths first.' },
  { value: 'neutral', label: 'Neutral', desc: 'Balanced and objective, just the facts.' },
  { value: 'academic', label: 'Academic / Formal', desc: 'Professional tone suitable for university-level work.' },
  { value: 'concise', label: 'Concise', desc: 'Short, direct feedback without elaboration.' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 ${
        checked ? 'bg-zinc-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SectionCard({ icon: Icon, title, description, children }: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-[15px]">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Separator className="bg-slate-100" />
      {children}
    </div>
  )
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>({
    defaultSubject: 'general',
    defaultStrictness: 'moderate',
    aiDetectionEnabled: true,
    defaultMaxScore: 100,
    feedbackTone: 'neutral',
    preferredLlmProvider: null,
    preferredLlmModel: null,
    customMessage: '',
    emailNotifications: true,
    aiSensitivity: 'medium',
    autoFlagThreshold: 70,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/preferences')
      .then((r) => r.json())
      .then((data) => {
        setPrefs((prev) => ({
          ...prev,
          ...data,
          customMessage: data.customMessage ?? '',
          emailNotifications: data.emailNotifications ?? true,
          aiSensitivity: data.aiSensitivity ?? 'medium',
          autoFlagThreshold: data.autoFlagThreshold ?? 70,
        }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultSubject: prefs.defaultSubject,
          defaultStrictness: prefs.defaultStrictness,
          aiDetectionEnabled: prefs.aiDetectionEnabled,
          defaultMaxScore: prefs.defaultMaxScore,
          feedbackTone: prefs.feedbackTone,
          preferredLlmProvider: prefs.preferredLlmProvider || null,
          preferredLlmModel: prefs.preferredLlmModel || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Preferences saved successfully')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setPrefs({
      defaultSubject: 'general',
      defaultStrictness: 'moderate',
      aiDetectionEnabled: true,
      defaultMaxScore: 100,
      feedbackTone: 'neutral',
      preferredLlmProvider: null,
      preferredLlmModel: null,
      customMessage: '',
      emailNotifications: true,
      aiSensitivity: 'medium',
      autoFlagThreshold: 70,
    })
    toast('Reset to defaults — click Save to apply.')
  }

  const selectedSubject = SUBJECTS.find((s) => s.value === prefs.defaultSubject)

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading preferences…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Grading Preferences</h3>
          <p className="text-slate-500 text-sm mt-1">
            These settings pre-fill the upload page and act as your fallback defaults.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-5 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* Subject & Strictness */}
        <SectionCard
          icon={GraduationCap}
          title="Default Subject"
          description="Sets the subject context that shapes the AI's grading rubric."
        >
          <div className="space-y-4">
            <Select value={prefs.defaultSubject} onValueChange={(v) => v && set('defaultSubject', v)}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubject && (
              <p className="text-sm text-slate-400">{selectedSubject.desc}</p>
            )}
          </div>
        </SectionCard>

        {/* Strictness & Max Score */}
        <SectionCard
          icon={SlidersHorizontal}
          title="Default Strictness"
          description="Controls how harshly the AI evaluates minor mistakes."
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Level</Label>
              <Select value={prefs.defaultStrictness} onValueChange={(v) => v && set('defaultStrictness', v)}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">Lenient — Forgiving of minor errors</SelectItem>
                  <SelectItem value="moderate">Moderate — Balanced evaluation</SelectItem>
                  <SelectItem value="strict">Strict — Penalises all mistakes</SelectItem>
                  <SelectItem value="very_strict">Very Strict — University standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Max Score</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={prefs.defaultMaxScore}
                onChange={(e) => set('defaultMaxScore', Number(e.target.value))}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </SectionCard>

        {/* Feedback Tone */}
        <SectionCard
          icon={MessageSquare}
          title="Feedback Tone"
          description="Determines the writing style used when the AI generates student feedback."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('feedbackTone', t.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    prefs.feedbackTone === t.value
                      ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Custom Instructions */}
        <SectionCard
          icon={Brain}
          title="Default Custom Instructions"
          description="Reusable grading guidance sent to the AI for every session. You can override per-session."
        >
          <Textarea
            value={prefs.customMessage ?? ''}
            onChange={(e) => set('customMessage', e.target.value)}
            placeholder="e.g. Focus on argument structure. Deduct 5 marks for every missing citation. Reward original thinking."
            className="min-h-[110px] rounded-xl border-slate-200 resize-none text-sm"
          />
          <p className="text-xs text-slate-400">
            {(prefs.customMessage ?? '').length} / 1000 characters
          </p>
        </SectionCard>

        {/* Plagiarism / AI Detection */}
        <SectionCard
          icon={ShieldAlert}
          title="Plagiarism Detection"
          description="Run AI-based integrity analysis before grading and auto-flag high-risk submissions."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Enable AI detection</p>
                <p className="text-xs text-slate-400">Adds ~15 seconds per submission</p>
              </div>
              <Toggle
                checked={prefs.aiDetectionEnabled}
                onChange={(v) => set('aiDetectionEnabled', v)}
              />
            </div>

            {prefs.aiDetectionEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Sensitivity</Label>
                  <Select
                    value={prefs.aiSensitivity ?? 'medium'}
                    onValueChange={(v) => v && set('aiSensitivity', v)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low — Flag at 90%+</SelectItem>
                      <SelectItem value="medium">Medium — Flag at 70%+</SelectItem>
                      <SelectItem value="high">High — Flag at 50%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    Auto-flag threshold
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={prefs.autoFlagThreshold ?? 70}
                    onChange={(e) => set('autoFlagThreshold', Number(e.target.value))}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={Bell}
          title="Email Notifications"
          description="Store notification preferences with the rest of your profile."
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Notify when batch grading completes</p>
              <p className="text-xs text-slate-400">Sends a summary to your registered email address</p>
            </div>
            <Toggle
              checked={prefs.emailNotifications ?? true}
              onChange={(v) => set('emailNotifications', v)}
            />
          </div>
        </SectionCard>

        {/* AI Model Override */}
        <SectionCard
          icon={Sparkles}
          title="AI Model Override"
          description="Override the default OpenRouter / NVIDIA Nemotron system model. Leave blank to use the system default."
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Provider</Label>
              <Select
                value={prefs.preferredLlmProvider ?? '__default__'}
                onValueChange={(v) => set('preferredLlmProvider', v === '__default__' ? null : v)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="System default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">System default (OpenRouter)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="openrouter">OpenRouter (custom key)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Model ID</Label>
              <Input
                value={prefs.preferredLlmModel ?? ''}
                onChange={(e) => set('preferredLlmModel', e.target.value || null)}
                placeholder="e.g. gpt-4o-mini"
                className="rounded-xl border-slate-200 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Custom model keys must be configured in{' '}
            <a href="/settings/keys" className="underline underline-offset-2 text-slate-600">
              Settings → API Keys
            </a>
          </p>
        </SectionCard>

        {/* Bottom Save */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
