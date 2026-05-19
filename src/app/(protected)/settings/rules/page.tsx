'use client'

import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface CustomRule {
  id: string
  name: string
  description: string
  isActive: boolean
}

export default function CustomRulesPage() {
  const [rules, setRules] = useState<CustomRule[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    try {
      const res = await fetch('/api/rules')
      const data = await res.json()
      setRules(data)
    } catch {
      toast.error('Failed to load custom rules')
    } finally {
      setLoading(false)
    }
  }

  function openForm(rule?: CustomRule) {
    if (rule) {
      setEditingId(rule.id)
      setName(rule.name)
      setDescription(rule.description)
    } else {
      setEditingId(null)
      setName('')
      setDescription('')
    }
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setName('')
    setDescription('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return

    setSubmitting(true)
    try {
      const url = editingId ? `/api/rules/${editingId}` : '/api/rules'
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (!res.ok) throw new Error('Failed to save rule')
      
      toast.success(`Rule ${editingId ? 'updated' : 'created'} successfully`)
      fetchRules()
      closeForm()
    } catch {
      toast.error('Failed to save custom rule')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this custom rule?')) return

    try {
      const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete rule')
      
      toast.success('Rule deleted')
      setRules(rules.filter(r => r.id !== id))
    } catch {
      toast.error('Failed to delete custom rule')
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      setRules(rules.map(r => r.id === id ? { ...r, isActive: !isActive } : r))
    } catch {
      toast.error('Failed to update rule status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading rules…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Custom Rules</h3>
          <p className="text-slate-500 text-sm mt-1">
            Define specific checking logic (e.g. &quot;Deduct 5 points for missing references&quot;).
          </p>
        </div>
        <Button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-5 gap-2">
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>
      
      <Separator />

      {isFormOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative">
          <button 
            onClick={closeForm}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h4 className="text-base font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Custom Rule' : 'Create New Custom Rule'}
          </h4>
          
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Rule Name</Label>
              <Input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Strict Citations"
                className="rounded-xl border-slate-200 bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Instruction</Label>
              <Textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Deduct 5 marks if the student fails to cite at least two academic sources."
                className="rounded-xl border-slate-200 bg-white min-h-[100px] resize-none"
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={submitting} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-6">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Save Rule
              </Button>
            </div>
          </form>
        </div>
      )}

      {rules.length === 0 && !isFormOpen ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-500 text-sm">No custom rules added yet.</p>
          <Button variant="link" onClick={() => openForm()} className="mt-2 text-blue-600">
            Create your first rule
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-start justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="space-y-1.5 flex-1 pr-6">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-slate-900">{rule.name}</h4>
                  <button
                    onClick={() => toggleActive(rule.id, rule.isActive)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest transition-colors ${
                      rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{rule.description}</p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openForm(rule)}
                  className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(rule.id)}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
