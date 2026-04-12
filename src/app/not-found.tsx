import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-black text-slate-50 flex flex-col items-center justify-center min-h-[80vh] font-sans">
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-medium tracking-tight text-amber-500">404</h2>
        <p className="text-muted-foreground text-lg">The artifact or route you requested sits outside our mapping perimeter.</p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-2 bg-white text-black font-medium rounded hover:bg-slate-200 transition"
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
