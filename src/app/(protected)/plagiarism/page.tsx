'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload as UploadIcon, ShieldAlert } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PlagiarismPage() {
  const [isHovered, setIsHovered] = useState(false)
  const [strictness, setStrictness] = useState('medium')

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Hero Banner */}
      <div className="bg-slate-100/50 rounded-[2rem] p-10 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-4 max-w-xl">
          <Badge variant="secondary" className="bg-slate-200 text-slate-600 text-[10px] tracking-widest font-bold uppercase px-3 py-1 hover:bg-slate-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            AI Integrity Analysis
          </Badge>
          
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Plagiarism Checker
          </h1>
          
          <p className="text-slate-500 text-sm leading-relaxed">
            Upload student files or a ZIP batch to analyze AI-generated writing signals and likely source matches.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <Select value={strictness} onValueChange={setStrictness}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 text-slate-700 font-medium bg-transparent">
              <SelectValue placeholder="Select strictness" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="high">high</SelectItem>
            </SelectContent>
          </Select>
          <div className="bg-zinc-900 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-xl">
            Auto-flag at {strictness === 'low' ? '90%' : strictness === 'medium' ? '70%' : '50%'}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900">Upload submissions</h2>
          <p className="text-sm text-slate-500">Supports multiple <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.txt</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.docx</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.pdf</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.zip</code> uploads.</p>
        </div>

        <Card 
          className={`border-2 border-dashed rounded-[2rem] transition-all duration-300 ease-out cursor-pointer ${
            isHovered ? 'border-slate-400 bg-slate-50 shadow-md' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-20 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
              isHovered ? 'bg-white shadow-md scale-110 text-slate-900' : 'bg-slate-50 shadow-sm text-slate-700'
            }`}>
              <UploadIcon className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Drag and drop files here
            </h3>
            
            <p className="text-sm text-slate-500">
              or click to browse for student submissions
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
