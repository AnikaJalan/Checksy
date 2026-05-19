'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload as UploadIcon, ShieldCheck, Activity, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ConfigurationStep } from '@/components/grade/configuration-step'
import { ProgressView } from '@/components/grade/progress-view'
import { toast } from 'sonner'
import { GradingConfig } from '@/types/grading'

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'configure' | 'process'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<any>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Upload pipeline failed');
      }
      
      const data = await res.json();
      setManifest({ ...data, fileName: file.name });
      setStep('configure');
      toast.success(`Extracted ${data.count} submissions successfully.`);
    } catch (err: any) {
      setError(err.message);
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip', '.x-zip-compressed'] },
    maxFiles: 1,
    disabled: isUploading || step !== 'upload'
  });

  const handleStartSession = async (config: GradingConfig, name: string) => {
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          config,
          files: manifest.manifest
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Grading session dispatched to background workers!');
      setManifest((prev: any) => ({ ...prev, sessionId: data.sessionId }));
      setStep('process');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#edf4ff] via-[#f7faff] to-[#eef6f6] rounded-[2rem] p-12 border border-[#d4dfef] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#c8ddff]/50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge variant="outline" className="bg-white/70 backdrop-blur-sm border-[#c9d9f0] text-[#5270a6] text-[10px] tracking-widest font-bold uppercase px-3 py-1">
            <Activity className="w-3 h-3 mr-1" />
            Teacher Portal
          </Badge>
          
          <h1 className="text-6xl font-serif font-bold text-[#14264d] tracking-tight leading-tight">
            Grade with <span className="text-[#4f72ae] italic">intelligence.</span>
          </h1>
          
          <p className="text-[#4f678f] text-lg leading-relaxed max-w-xl">
            Upload assignments, set your criteria, and let AI handle the heavy lifting for every student in your archive.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Flow */}
        <div className="lg:col-span-2">
          {step === 'upload' ? (
            <Card 
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[2rem] transition-all duration-300 ease-out focus-visible:outline-none ${
                isDragActive ? 'border-[#8eb1e1] bg-[#eef5ff] shadow-md' : 'border-[#d4dfef] bg-white/90 shadow-sm hover:border-[#bfd0e8] cursor-pointer'
              } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <CardContent className="p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
                {isUploading ? (
                  <>
                    <div className="w-24 h-24 rounded-3xl bg-[#ecf2ff] flex items-center justify-center mb-8">
                      <Loader2 className="w-10 h-10 text-[#4f72ae] animate-spin" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#14264d] mb-3">Extracting Files...</h3>
                    <p className="text-[#5c739b] max-w-sm mx-auto">Parsing .docx files from your archive securely.</p>
                  </>
                ) : (
                  <>
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 transition-all duration-300 ${
                      isDragActive ? 'bg-white shadow-xl scale-110 text-[#4f72ae]' : 'bg-[#f3f7ff] shadow-sm text-[#5f7db4]'
                    }`}>
                      <UploadIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#14264d] mb-3">Drop Assignments (.zip)</h3>
                    <p className="text-[#5c739b] max-w-sm mx-auto">Support .zip files up to 200MB. Your grading flow starts here.</p>
                    {error && <p className="text-rose-500 mt-4 text-sm font-medium bg-rose-50 px-3 py-1 rounded-full">{error}</p>}
                  </>
                )}
              </CardContent>
            </Card>
          ) : step === 'configure' ? (
            <Card className="border-[#d4dfef] rounded-[2rem] shadow-sm overflow-hidden bg-white/90">
               <ConfigurationStep 
                 fileCount={manifest.count}
                 fileName={manifest.fileName}
                 files={manifest.manifest} 
                 onStartSession={handleStartSession}
                 onCancel={() => { setStep('upload'); setManifest(null); }}
               />
            </Card>
          ) : (
            <Card className="border-[#d4dfef] rounded-[2rem] shadow-sm overflow-hidden bg-white/90">
               <ProgressView 
                 sessionId={manifest.sessionId} 
                 onComplete={() => router.push(`/grade/${manifest.sessionId}`)} 
               />
            </Card>
          )}
        </div>

        {/* Right Column: Status Center */}
        <div className="lg:col-span-1">
          <Card className="border-[#d4dfef] rounded-[2rem] shadow-sm h-full bg-white/90">
            <CardContent className="p-8 flex flex-col h-full gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-[#4f72ae]" />
                  <h3 className="text-xl font-serif font-bold text-[#14264d]">Status Center</h3>
                </div>
                <p className="text-sm text-[#5c739b]">Monitor your grading job progress.</p>
              </div>

              {/* Stat pills — shown when a ZIP is uploaded */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#e3ebf6] bg-[#f5f9ff] p-4 text-center">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#6d84ac] mb-2">Status</p>
                  {step === 'upload' && (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm font-semibold">
                      <Clock className="w-3.5 h-3.5" /> Waiting
                    </span>
                  )}
                  {step === 'configure' && (
                    <span className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-semibold">
                      <Activity className="w-3.5 h-3.5" /> Configuring
                    </span>
                  )}
                  {step === 'process' && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Processing
                    </span>
                  )}
                </div>
                <div className="rounded-2xl border border-[#e3ebf6] bg-[#f5f9ff] p-4 text-center">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#6d84ac] mb-2">Files</p>
                  <p className="text-2xl font-serif font-bold text-[#14264d]">
                    {manifest?.count ?? 0}
                  </p>
                </div>
              </div>

              {/* Step tracker */}
              <div className="flex-1 bg-[#f5f9ff] rounded-2xl border border-[#e3ebf6] flex flex-col p-5 text-sm">
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step === 'upload' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : 'bg-emerald-100 text-emerald-600'}`}>
                      {step === 'upload' ? <span className="font-bold text-xs">1</span> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-[13px] ${step === 'upload' ? 'text-slate-900' : 'text-slate-500'}`}>Upload Archive</p>
                      <p className="text-slate-400 text-xs mt-0.5">Provide a ZIP of .docx files</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step === 'configure' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : step === 'process' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                      {step === 'process' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="font-bold text-xs">2</span>}
                    </div>
                    <div>
                      <p className={`font-semibold text-[13px] ${step === 'configure' ? 'text-slate-900' : 'text-slate-400'}`}>Configure Rules</p>
                      <p className="text-slate-400 text-xs mt-0.5">Set subject & AI detection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step === 'process' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : 'bg-slate-200 text-slate-400'}`}>
                      <span className="font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className={`font-semibold text-[13px] ${step === 'process' ? 'text-slate-900' : 'text-slate-400'}`}>Process</p>
                      <p className="text-slate-400 text-xs mt-0.5">Background AI analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
