'use client'

import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Key, Trash2, CheckCircle2, Loader2, Eye, EyeOff, Copy } from 'lucide-react'

interface MaskedKey {
  provider: string
  keyHint: string
  updatedAt: string | null
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'Powering GPT-4o and GPT-4o-mini.', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', description: 'Nuanced feedback via Claude 3.5 Sonnet.', placeholder: 'sk-ant-...' },
  { id: 'google', name: 'Google Gemini', description: 'Fast processing via Gemini 2.0 Flash (free tier).', placeholder: 'AIza...' },
  { id: 'nvidia', name: 'NVIDIA NIM', description: 'Free inference via Llama 3.1 70B Instruct.', placeholder: 'nvapi-...' },
  { id: 'wolfram', name: 'Wolfram Alpha', description: 'Verification for Math assignments.', placeholder: 'XXXXXX-XXXXXXXXXX' },
]

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<MaskedKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys')
      if (res.ok) {
        const data = await res.json()
        setKeys(data)
      }
    } catch {
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (providerId: string) => {
    setNewKey('')
    setShowKey(false)
    setActiveProvider(providerId)
  }

  const closeDialog = () => {
    setActiveProvider(null)
    setNewKey('')
    setShowKey(false)
  }

  const handleSave = async () => {
    if (!activeProvider || !newKey.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider, key: newKey.trim() }),
      })

      if (res.ok) {
        toast.success(`${activeProvider} key saved successfully`)
        closeDialog()
        fetchKeys()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error ?? 'Failed to save key')
      }
    } catch {
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (provider: string) => {
    if (!confirm(`Are you sure you want to remove your ${provider} key?`)) return
    try {
      const res = await fetch(`/api/keys/${provider}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${provider} key removed`)
        fetchKeys()
      }
    } catch {
      toast.error('Failed to delete key')
    }
  }

  const activeProviderInfo = PROVIDERS.find(p => p.id === activeProvider)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight text-foreground">API Keys</h3>
        <p className="text-muted-foreground text-sm">
          Manage integrations with AI providers. Checksy uses Bring-Your-Own-Key
          (BYOK) for security and cost control.
        </p>
      </div>
      <Separator />

      <div className="grid gap-4">
        {PROVIDERS.map((provider) => {
          const config = keys.find((k) => k.provider === provider.id)
          return (
            <Card key={provider.id} className="border-white/5 bg-white/[0.02]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base font-semibold">{provider.name}</CardTitle>
                    {config ? (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase font-bold">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-800 text-[10px] uppercase font-bold">
                        Not Set
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{provider.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openDialog(provider.id)}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-medium border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    {config ? 'Update' : 'Configure'}
                  </button>
                  {config && (
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {config ? (
                  <div className="flex items-center text-xs text-muted-foreground font-mono">
                    <Key className="w-3 h-3 mr-2" />
                    <span>•••• •••• •••• {config.keyHint}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs italic">Setup required to use this provider in grading sessions.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Unified dialog controlled by state */}
      <Dialog open={!!activeProvider} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {activeProviderInfo?.name}</DialogTitle>
            <DialogDescription>
              Paste your {activeProviderInfo?.name} API key below. It will be encrypted at rest and only used server-side during grading.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="relative">
              <input
                autoFocus
                type={showKey ? 'text' : 'password'}
                placeholder={activeProviderInfo?.placeholder ?? 'Paste your key here…'}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onPaste={(e) => {
                  // Explicitly handle paste to guarantee it works
                  const pasted = e.clipboardData.getData('text')
                  setNewKey(pasted)
                  e.preventDefault()
                }}
                className="w-full h-12 pl-4 pr-20 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      setNewKey(text)
                      toast.success('Key pasted from clipboard')
                    } catch {
                      toast.error('Could not read clipboard. Please paste manually with ⌘V.')
                    }
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  title="Paste from clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-600">
              Click inside the box and press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">⌘V</kbd>
              {' '}or click the <Copy className="inline w-3 h-3 mx-0.5" /> button to paste.
            </p>
          </div>

          <DialogFooter>
            <button
              onClick={closeDialog}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!newKey.trim() || isSaving}
              className="inline-flex items-center justify-center h-9 px-5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Key
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
