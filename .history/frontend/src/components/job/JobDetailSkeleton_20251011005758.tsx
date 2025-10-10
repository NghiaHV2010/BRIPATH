export function JobDetailSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="h-7 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="flex gap-3 ml-6">
          <div className="h-10 bg-slate-200 rounded w-24"></div>
          <div className="h-10 bg-slate-200 rounded w-20"></div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-28"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-6 bg-slate-200 rounded-full w-16"></div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-20"></div>
      </div>
    </div>
  );
}
