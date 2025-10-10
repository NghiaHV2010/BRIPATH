import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";
import CompanyCard from "./CompanyCard";

export default function CompanyFilters({ onCompanyClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(6);

  const {
    filterCompanies,
    fetchCompanies,
    filteredCompanies,
    isLoading,
    clearFilteredCompanies,
  } = useCompanyStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setPage(1);
    await filterCompanies(1, searchTerm.trim(), "", "", "");
  };

  const handleReset = async () => {
    setSearchTerm("");
    setIsSearching(false);
    setPage(1);
    clearFilteredCompanies();
    await fetchCompanies(1);
  };

  const handleLoadMore = async () => {
    const nextVisible = visibleCount + 6;
    if (
      nextVisible > filteredCompanies.length &&
      filteredCompanies.length % 12 === 0
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      await filterCompanies(nextPage, searchTerm.trim(), "", "", "");
    }
    setVisibleCount(nextVisible);
  };

  const hasResults = isSearching && filteredCompanies.length > 0;
  const noResults = isSearching && filteredCompanies.length === 0 && !isLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      {/* Search header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Tìm kiếm công ty với lĩnh vực của bạn?
        </h2>
        <p className="text-slate-600">
          Nhập tên công ty hoặc lĩnh vực bạn quan tâm để tìm kiếm
        </p>
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
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Tìm kiếm"
            )}
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

      {/* Kết quả */}
      {hasResults && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Kết quả tìm kiếm
            </h3>
            <div className="text-slate-600 bg-blue-50 px-4 py-2 rounded-lg">
              {filteredCompanies.length} công ty
            </div>
          </div>

          {/* Grid 2 cột × 3 hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompanies.slice(0, visibleCount).map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => onCompanyClick?.(company.id)}
              />
            ))}
          </div>

          {/* Load more */}
          {filteredCompanies.length > visibleCount && (
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
                  "Hiển thị thêm công ty..."
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {noResults && (
        <p className="text-center mt-8 text-amber-600">
          Không tìm thấy công ty nào với từ khóa "{searchTerm}"
        </p>
      )}
    </div>
  );
}
