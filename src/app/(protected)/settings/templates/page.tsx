'use client'

import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, X, Check, BookOpen, GraduationCap, FileText, Zap } from 'lucide-react'

interface CustomRule {
  id: string
  name: string
  isActive: boolean
}

interface Template {
  id: string
  name: string
  subject: string
  strictness: string
  customInstructions: string | null
  aiDetectionEnabled: boolean
  ruleIds: string[]
  maxScore: number
}

const SUBJECTS = [
  { value: 'general', label: 'General' },
  { value: 'english', label: 'English / Language Arts' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'history', label: 'History / Social Studies' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'economics', label: 'Economics' },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [rules, setRules] = useState<CustomRule[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('general')
  const [strictness, setStrictness] = useState('moderate')
  const [customInstructions, setCustomInstructions] = useState('')
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true)
  const [maxScore, setMaxScore] = useState(100)
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/rules').then(r => r.json())
    ]).then(([templatesData, rulesData]) => {
      setTemplates(templatesData)
      setRules(rulesData.filter((r: CustomRule) => r.isActive)) // Only show active rules
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load data')
      setLoading(false)
    })
  }, [])

  function openForm(template?: Template) {
    if (template) {
      setEditingId(template.id)
      setName(template.name)
      setSubject(template.subject)
      setStrictness(template.strictness)
      setCustomInstructions(template.customInstructions ?? '')
      setAiDetectionEnabled(template.aiDetectionEnabled)
      setMaxScore(template.maxScore)
      setSelectedRuleIds(template.ruleIds ?? [])
    } else {
      setEditingId(null)
      setName('')
      setSubject('general')
      setStrictness('moderate')
      setCustomInstructions('')
      setAiDetectionEnabled(true)
      setMaxScore(100)
      setSelectedRuleIds([])
    }
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
  }

  function toggleRule(id: string) {
    setSelectedRuleIds(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const url = editingId ? `/api/templates/${editingId}` : '/api/templates'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          strictness,
          customInstructions: customInstructions || null,
          aiDetectionEnabled,
          maxScore,
          ruleIds: selectedRuleIds
        }),
      })

      if (!res.ok) throw new Error('Failed to save template')
      
      const savedTemplate = await res.json()
      
      if (editingId) {
        setTemplates(templates.map(t => t.id === editingId ? savedTemplate : t))
      } else {
        setTemplates([savedTemplate, ...templates])
      }
      
      toast.success(`Template ${editingId ? 'updated' : 'created'} successfully`)
      closeForm()
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete template')
      
      toast.success('Template deleted')
      setTemplates(templates.filter(t => t.id !== id))
    } catch {
      toast.error('Failed to delete template')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading templates…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Grading Templates</h3>
          <p className="text-slate-500 text-sm mt-1">
            Manage assignment templates with predefined custom rules to speed up grading.
          </p>
        </div>
        <Button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-5 gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>
      
      <Separator />

      {isFormOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 relative shadow-sm animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={closeForm}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h4 className="text-lg font-serif font-bold text-slate-900 mb-6">
            {editingId ? 'Edit Template' : 'Create New Template'}
          </h4>
          
          <form onSubmit={handleSave} className="space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Template Name</Label>
              <Input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Weekly Math Quiz"
                className="rounded-xl border-slate-200 max-w-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-2xl">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Default Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Strictness */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Strictness</Label>
                <Select value={strictness} onValueChange={setStrictness}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lenient">Lenient</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Score */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Max Score</Label>
                <Input 
                  type="number"
                  min={1}
                  value={maxScore}
                  onChange={e => setMaxScore(Number(e.target.value))}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>
            </div>

            {/* Custom Rules Multi-Select */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex justify-between items-end">
                <span>Attach Custom Rules</span>
                <span className="text-slate-400 font-normal normal-case tracking-normal">
                  {selectedRuleIds.length} selected
                </span>
              </Label>
              {rules.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  No active custom rules available. Create them in the Custom Rules tab.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {rules.map(rule => {
                    const isSelected = selectedRuleIds.includes(rule.id)
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected 
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate">{rule.name}</span>
                          {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Custom Instructions Override */}
            <div className="space-y-2 max-w-2xl">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Template Custom Instructions</Label>
              <Textarea 
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="Optional instructions specific to this template…"
                className="rounded-xl border-slate-200 min-h-[80px] resize-none"
              />
            </div>

            {/* AI Detection Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 max-w-md">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800">AI Content Detection</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={aiDetectionEnabled}
                onClick={() => setAiDetectionEnabled(!aiDetectionEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiDetectionEnabled ? 'bg-zinc-900' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${aiDetectionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save Template
              </Button>
              <Button type="button" variant="ghost" onClick={closeForm} className="rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 && !isFormOpen ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-500 text-sm">No templates created yet.</p>
          <Button variant="link" onClick={() => openForm()} className="mt-2 text-blue-600">
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-900">{t.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <BookOpen className="w-3 h-3" />
                      {t.subject}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                      t.strictness === 'strict' ? 'bg-rose-100 text-rose-700' :
                      t.strictness === 'lenient' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t.strictness}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => openForm(t)} className="w-8 h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>Max Score: <strong>{t.maxScore}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Rules: <strong>{t.ruleIds?.length || 0} attached</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className={`w-4 h-4 ${t.aiDetectionEnabled ? 'text-amber-500' : 'text-slate-300'}`} />
                  <span>AI Detection: <strong>{t.aiDetectionEnabled ? 'On' : 'Off'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
