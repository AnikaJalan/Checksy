'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function FileUploadDropzone({ onUploadSuccess }: { onUploadSuccess: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload pipeline failed');
      
      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip', '.x-zip-compressed'] },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border border-dashed p-16 text-center cursor-pointer transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
         <div className="space-y-3">
           <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full mx-auto" />
           <p className="text-muted-foreground text-sm font-medium">Extracting and parsing ZIP contents securely...</p>
         </div>
      ) : (
         <div className="space-y-2">
            <p className="text-base font-medium">Drag & drop your mass submissions ZIP archive here</p>
            <p className="text-sm text-muted-foreground">Only .zip files containing formatting-free .docx structures are supported currently.</p>
         </div>
      )}
      {error && <p className="text-red-600 dark:text-red-400 mt-4 text-sm font-medium">{error}</p>}
    </div>
  );
}
