'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploadDropzone } from '@/components/grade/file-upload-dropzone';
import { ConfigurationStep } from '@/components/grade/configuration-step';
import { ProgressView } from '@/components/grade/progress-view';

export default function NewGradingSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'UPLOAD' | 'CONFIG' | 'POLLING'>('UPLOAD');
  const [uploadData, setUploadData] = useState<{ files: any[] } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  if (step === 'UPLOAD') {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-32 space-y-6 animate-in fade-in duration-700">
        <div className="space-y-2">
           <h1 className="text-3xl font-medium tracking-tight">Data Upload Context</h1>
           <p className="text-muted-foreground font-medium tracking-wide">Extracting safely enclosed `.docx` artifacts stripping generic filesystem namespaces gracefully directly into RAM structures.</p>
        </div>
        <FileUploadDropzone 
           onUploadSuccess={(data) => {
             setUploadData(data);
             if (data.files && data.files.length > 0) setStep('CONFIG');
           }} 
        />
      </div>
    );
  }

  if (step === 'CONFIG' && uploadData) {
    return (
      <ConfigurationStep 
        fileCount={uploadData.files.length}
        files={uploadData.files}
        onStartSession={async (configData) => {
          const res = await fetch('/api/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `Assignment Execution - ${new Date().toLocaleDateString()}`,
              config: configData,
              files: uploadData.files
            })
          });
          const { sessionId: sid } = await res.json();
          setSessionId(sid);
          setStep('POLLING');
        }}
      />
    );
  }

  if (step === 'POLLING' && sessionId) {
    return (
      <div className="pt-48">
        <ProgressView 
          sessionId={sessionId} 
          onComplete={() => router.push(`/grade/${sessionId}`)} 
        />
      </div>
    );
  }

  return null;
}
