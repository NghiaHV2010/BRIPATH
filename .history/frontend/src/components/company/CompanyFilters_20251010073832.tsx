import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";
import CompanyCard from "./CompanyCard";
import type { CompanySummary } from "@/types/company";

export default function CompanyFilters({ onCompanyClick }: { onCompanyClick?: (companyId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(6);

  // local accumulation of fetched pages (so we can append when store overwrites filteredCompanies)
  const [displayedCompanies, setDisplayedCompanies] = useState<CompanySummary[]>([]);
  // how many items the last fetch (page) returned — backend page size = 12 in your case
  const [lastFetchCount, setLastFetchCount] = useState(0);

  const {
    filterCompanies,
    fetchCompanies,
    // store.filteredCompanies is still used as the immediate response holder,
    // but we accumulate pages into displayedCompanies.
    filteredCompanies,
    isLoading,
    clearFilteredCompanies,
  } = useCompanyStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setPage(1);
    setVisibleCount(6);
    setDisplayedCompanies([]);
    setLastFetchCount(0);

    // call store to fetch page 1
    await filterCompanies(1, searchTerm.trim(), "", "", "");

    // read the latest page data directly from the store synchronously
    const latest = useCompanyStore.getState().filteredCompanies ?? [];
    setDisplayedCompanies(latest);
    setLastFetchCount(latest.length);
  };

  const handleReset = async () => {
    setSearchTerm("");
    setIsSearching(false);
    setPage(1);
    setVisibleCount(6);
    setDisplayedCompanies([]);
    setLastFetchCount(0);
    clearFilteredCompanies();
    await fetchCompanies(1);
  };

  const handleLoadMore = async () => {
    const nextVisible = visibleCount + 6;

    // If we already have enough fetched items locally, just increase visibleCount.
    // Otherwise, if we need more and last fetch returned full page (12), fetch next page.
    if (nextVisible > displayedCompanies.length && lastFetchCount === 12) {
      const nextPage = page + 1;
      setPage(nextPage);

      // fetch next page (store will update filteredCompanies)
      await filterCompanies(nextPage, searchTerm.trim(), "", "", "");

      // get the newly fetched page (store.filteredCompanies holds the *latest page* because store probably overwrites)
      const latestPage = useCompanyStore.getState().filteredCompanies ?? [];

      // append the newly fetched page to our local accumulation
      setDisplayedCompanies((prev) => [...prev, ...latestPage]);
      setLastFetchCount(latestPage.length);
    }

    // always increase visible count so UI reveals next 6 (even if we didn't need to fetch)
    setVisibleCount(nextVisible);
  };

  const hasResults = isSearching && displayedCompanies.length > 0;
  const noResults = isSearching && displayedCompanies.length === 0 && !isLoading;

  // show load more if:
  // - we have more local items hidden (displayedCompanies.length > visibleCount)
  // OR
  // - last fetch returned full page (12) -> backend may have more pages
  const canShowLoadMore = displayedCompanies.length > visibleCount || lastFetchCount === 12;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      {/* Search header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Tìm kiếm công ty với lĩnh vực của bạn?</h2>
        <p className="text-slate-600">Nhập tên công ty hoặc lĩnh vực bạn quan tâm để tìm kiếm</p>
      </div>

      {/* Form tìm kiếm */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Ví dụ: FPT, công nghệ, ngân hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!searchTerm.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Tìm kiếm"}
          </button>
        </div>

        {isSearching && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-2 mx-auto"
            >
              <X className="w-4 h-4" />
              Xóa kết quả tìm kiếm
            </button>
          </div>
        )}
      </form>

      {/* Results */}
      {hasResults && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Kết quả tìm kiếm</h3>
            <div className="text-slate-600 bg-blue-50 px-4 py-2 rounded-lg">
              {displayedCompanies.length} công ty
            </div>
          </div>

          {/* Grid: hiển thị theo visibleCount (mặc định 6 = 3 hàng x 2 cột như bạn muốn) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedCompanies.slice(0, visibleCount).map((company) => (
              <CompanyCard key={company.id} company={company} onClick={() => onCompanyClick?.(company.id)} />
            ))}
          </div>

          {/* Load more */}
          {canShowLoadMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
                  </>
                ) : (
                  "Hiển thị thêm"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {noResults && (
        <p className="text-center mt-8 text-amber-600">Không tìm thấy công ty nào với từ khóa "{searchTerm}"</p>
      )}
    </div>
  );
}
