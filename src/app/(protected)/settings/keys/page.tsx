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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Key, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface MaskedKey {
  provider: string
  keyHint: string
  updatedAt: string | null
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', description: 'Powering GPT-4o and GPT-4o-mini.' },
  { id: 'anthropic', name: 'Anthropic', description: 'Nuanced feedback via Claude 3.5 Sonnet.' },
  { id: 'google', name: 'Google Gemini', description: 'Fast processing via Gemini 2.0 Flash.' },
  { id: 'nvidia', name: 'NVIDIA NIM', description: 'Free inference via Llama 3.1 70B Instruct.' },
  { id: 'wolfram', name: 'Wolfram Alpha', description: 'Verification for Math assignments.' },
]

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<MaskedKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')

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
    } catch (error) {
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!activeProvider || !newKey) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider, key: newKey }),
      })

      if (res.ok) {
        toast.success(`${activeProvider} key saved successfully`)
        setNewKey('')
        setActiveProvider(null)
        fetchKeys()
      } else {
        toast.error('Failed to save key')
      }
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete key')
    }
  }

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
                  <Button variant="outline" size="sm" onClick={() => setActiveProvider(provider.id)}>
                    {config ? 'Update' : 'Configure'}
                  </Button>
                  <Dialog open={activeProvider === provider.id} onOpenChange={(open) => !open && setActiveProvider(null)}>
                    <DialogContent className="bg-zinc-950 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle>Configure {provider.name}</DialogTitle>
                        <DialogDescription>
                          Paste your {provider.name} API key below. We encrypt this key at rest and only use it in server-side memory during grading.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          type="password"
                          placeholder="sk-..."
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="bg-zinc-900 border-zinc-800"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setActiveProvider(null)}>Cancel</Button>
                        <Button 
                          onClick={handleSave} 
                          disabled={!newKey || isSaving}
                          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        >
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Key
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {config && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(provider.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    </div>
  )
}
