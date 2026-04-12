'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-slate-50 flex items-center justify-center min-h-screen font-sans">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-medium tracking-tight text-amber-500">Something went critically wrong!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">A severe execution error happened globally mapping this tree. We caught it safely.</p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition"
          >
            Attempt Re-Execution
          </button>
        </div>
      </body>
    </html>
  );
}
