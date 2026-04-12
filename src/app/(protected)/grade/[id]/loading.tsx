export default function ResultLoading() {
  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-12 animate-pulse">
      <div className="flex items-start justify-between">
         <div className="space-y-3">
            <div className="h-8 w-64 bg-white/5 rounded" />
            <div className="h-4 w-40 bg-white/5 rounded" />
         </div>
         <div className="h-9 w-40 bg-white/5 rounded" />
      </div>

      <div className="flex gap-12 border-b pb-8 border-white/10">
        <div className="space-y-2">
          <div className="h-12 w-16 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-12 w-24 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-12 w-12 bg-white/5 rounded" />
          <div className="h-3 w-24 bg-white/5 rounded" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-6 w-48 bg-white/5 rounded" />
        <div className="h-[400px] w-full bg-white/5 rounded" />
      </div>
    </div>
  );
}
