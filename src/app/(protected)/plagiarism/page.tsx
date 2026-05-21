'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Upload as UploadIcon,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  X,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisResult {
  aiDetection: {
    percentage: number
    confidence: 'low' | 'medium' | 'high'
    flags: string[]
    error?: string
  }
  isHighRisk: boolean
}

interface FileEntry {
  name: string
  text: string
  result?: AnalysisResult
  status: 'pending' | 'analyzing' | 'done' | 'error'
}

export default function PlagiarismPage() {
  const [strictness, setStrictness] = useState('medium')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const newEntries: FileEntry[] = []
      for (const file of accepted) {
        try {
          const text = await readFileAsText(file)
          newEntries.push({ name: file.name, text, status: 'pending' })
        } catch {
          toast.error(`Could not read ${file.name}`)
        }
      }
      setFiles((prev) => [...prev, ...newEntries])
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
  })

  function addPastedText() {
    if (pasteText.trim().length < 20) {
      toast.error('Text is too short to analyze (minimum 20 characters)')
      return
    }
    setFiles((prev) => [
      ...prev,
      { name: 'Pasted text', text: pasteText.trim(), status: 'pending' },
    ])
    setPasteText('')
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function runAnalysis() {
    if (files.length === 0) {
      toast.error('Add at least one file or pasted text first')
      return
    }

    setIsRunning(true)

    const updated = [...files]
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]
      if (!item) continue
      if (item.status === 'done') continue
      updated[i] = { ...item, status: 'analyzing' }
      setFiles([...updated])

      try {
        const res = await fetch('/api/plagiarism', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text, strictness }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Analysis failed')
        }

        const result: AnalysisResult = await res.json()
        updated[i] = { ...item, result, status: 'done' }
      } catch (err: any) {
        updated[i] = { ...item, status: 'error' }
        toast.error(`Failed: ${item.name} — ${err.message}`)
      }
      setFiles([...updated])
    }

    setIsRunning(false)
    toast.success('Analysis complete')
  }

  const threshold = strictness === 'low' ? 90 : strictness === 'high' ? 50 : 70

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#edf4ff] via-[#f7faff] to-[#eef6f6] rounded-[2rem] p-10 border border-[#d4dfef] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <Badge
            variant="secondary"
            className="bg-white/75 border border-[#cbd9ef] text-[#5472a8] text-[10px] tracking-widest font-bold uppercase px-3 py-1 hover:bg-white/85"
          >
            <ShieldAlert className="w-3 h-3 mr-1" />
            AI Integrity Analysis
          </Badge>
          <h1 className="text-4xl font-serif font-bold text-[#14264d] tracking-tight">
            Plagiarism Checker
          </h1>
          <p className="text-[#506991] text-sm leading-relaxed">
            Upload student files or paste text to analyze AI-generated writing signals. Powered by NVIDIA Nemotron via OpenRouter.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/90 p-2 rounded-2xl border border-[#d4dfef] shadow-sm">
          <Select value={strictness} onValueChange={(v) => v && setStrictness(v)}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 text-[#304a76] font-medium bg-transparent">
              <SelectValue placeholder="Strictness" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <div className="bg-[#111827] text-white text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-xl whitespace-nowrap">
            Flag at {threshold}%
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-[#14264d]">Upload files</h2>
        <p className="text-sm text-[#5c739b]">
          Supports <code className="bg-[#ebf2ff] px-1 py-0.5 rounded text-[#3f5c90]">.txt</code> and{' '}
          <code className="bg-[#ebf2ff] px-1 py-0.5 rounded text-[#3f5c90]">.docx</code> files.
        </p>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-[#8eb1e1] bg-[#eef5ff] shadow-md'
              : 'border-[#d4dfef] bg-white/90 hover:border-[#bfd0e8] hover:shadow-sm'
          }`}
        >
          <input {...getInputProps()} />
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
              isDragActive ? 'bg-[#1f3766] text-white scale-110' : 'bg-[#ecf2ff] text-[#5e78aa]'
            }`}
          >
            <UploadIcon className="w-7 h-7" />
          </div>
          <p className="font-semibold text-[#233c67] text-base">
            {isDragActive ? 'Drop files here…' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-[#7d90b2] mt-1">or click to browse</p>
        </div>
      </div>

      {/* Paste Text */}
      <div className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-[#14264d]">Or paste text directly</h2>
        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste a student's essay, assignment, or any text here…"
          className="min-h-[120px] rounded-2xl border-[#d4dfef] bg-white/90 resize-none text-sm"
        />
        <Button
          onClick={addPastedText}
          variant="outline"
          className="rounded-full border-[#c7d4e9] text-[#3d598d] hover:bg-[#edf4ff]"
          disabled={pasteText.trim().length < 20}
        >
          Add to queue
        </Button>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-[#14264d]">
              Queue ({files.length} item{files.length !== 1 ? 's' : ''})
            </h2>
            <Button
              onClick={runAnalysis}
              disabled={isRunning}
              className="bg-[#111827] hover:bg-[#1d2940] text-white rounded-full px-6 shadow-sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing…
                </>
              ) : (
                'Run Analysis'
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file, idx) => (
              <Card key={idx} className="border-[#d4dfef] bg-white/90 rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  {/* File header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#ecf2ff] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#5f78ab]" />
                      </div>
                      <span className="text-sm font-medium text-[#233c67] truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {file.status === 'analyzing' && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                        </span>
                      )}
                      {file.status === 'pending' && (
                        <span className="text-xs text-[#7d90b2] font-medium">Pending</span>
                      )}
                      {file.status === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Failed
                        </span>
                      )}
                      {!isRunning && (
                        <button
                          onClick={() => removeFile(idx)}
                          className="w-7 h-7 rounded-full hover:bg-[#edf4ff] flex items-center justify-center text-[#7d90b2] hover:text-[#5472a8] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results */}
                  {file.status === 'done' && file.result && (
                    <div className="mt-4 pt-4 border-t border-[#e3ebf6] space-y-3">
                      <div className="flex items-center gap-4">
                        {/* Score ring */}
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-serif border-4 flex-shrink-0 ${
                            file.result.isHighRisk
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : file.result.aiDetection.percentage >= 40
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {file.result.aiDetection.percentage}%
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {file.result.isHighRisk ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-700">
                                <AlertTriangle className="w-3 h-3" /> High Risk — Flagged
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> Looks Authentic
                              </span>
                            )}
                            <span className="text-[10px] uppercase tracking-wider text-[#7d90b2] font-semibold">
                              {file.result.aiDetection.confidence} confidence
                            </span>
                          </div>
                          <p className="text-xs text-[#5c739b]">
                            AI Content Score: <span className="font-semibold text-[#304a76]">{file.result.aiDetection.percentage}%</span>
                          </p>
                        </div>
                      </div>

                      {/* Flags */}
                      {file.result.aiDetection.flags.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-widest font-semibold text-[#7d90b2] flex items-center gap-1">
                            <Info className="w-3 h-3" /> Detection Signals
                          </p>
                          <ul className="space-y-1">
                            {file.result.aiDetection.flags.map((flag, fi) => (
                              <li key={fi} className="text-xs text-[#536b93] flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-[#7d90b2] mt-1.5 flex-shrink-0" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
