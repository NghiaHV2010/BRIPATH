export default function CompanyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-64 bg-slate-200" />

          <div className="p-8">
            <div className="flex items-start gap-6 mb-8 -mt-20">
              <div className="w-32 h-32 bg-slate-300 rounded-2xl border-4 border-white shadow-lg" />
              <div className="flex-1 pt-16">
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="flex gap-4">
                  <div className="h-10 bg-slate-200 rounded w-24" />
                  <div className="h-10 bg-slate-200 rounded w-32" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
