export default function DashboardLoading() {
  return (
    <div className="p-8 md:p-12 lg:p-16 max-w-5xl mx-auto space-y-12 animate-pulse">
      <div className="space-y-6">
        <div className="h-6 w-48 bg-white/5 rounded" />
        <div className="h-20 w-full max-w-lg bg-white/5 rounded" />
      </div>

      <div className="space-y-6">
        <div className="h-6 w-32 bg-white/5 rounded" />
        <div className="h-64 w-full bg-white/5 rounded" />
      </div>
    </div>
  );
}
