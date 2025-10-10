import { useState } from "react";
import { Search, X } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";
import CompanyFilterCard from "./CompanyFilterCard";

// Custom Skeleton cho filter cards - compact hơn
const CompanyFilterSkeleton = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
    {/* Header với avatar và tên */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-1.5"></div>
        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
    
    {/* Badge */}
    <div className="h-5 bg-slate-200 rounded-full w-20 mb-3"></div>
    
    {/* Info lines */}
    <div className="space-y-1.5 mb-3">
      <div className="h-2 bg-slate-200 rounded w-3/4"></div>
      <div className="h-2 bg-slate-200 rounded w-1/2"></div>
    </div>
    
    {/* Bottom action */}
    <div className="pt-2 border-t border-slate-100">
      <div className="flex justify-between items-center">
        <div className="h-2 bg-slate-200 rounded w-1/3"></div>
        <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

interface CompanyFiltersProps {
  onCompanyClick?: (companyId: string) => void;
}

export default function CompanyFilters({
  onCompanyClick,
}: CompanyFiltersProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    console.log("🔍 Searching for:", searchTerm);

    // Call filter API với tất cả parameters (trống nếu không có)
    await filterCompanies(1, searchTerm.trim(), "", "", "");
  };

  const handleReset = async () => {
    setSearchTerm("");
    setIsSearching(false);
    clearFilteredCompanies(); // Xóa kết quả filter
    await fetchCompanies(1);
  };

  const hasResults = isSearching && filteredCompanies.length > 0;
  const noResults = isSearching && filteredCompanies.length === 0 && !isLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tìm kiếm công ty với lĩnh vực của bạn?
        </h2>
        <p className="text-slate-600">
          Nhập tên công ty hoặc lĩnh vực bạn quan tâm để tìm kiếm
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ví dụ: FPT, công nghệ, ngân hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!searchTerm.trim() || isLoading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tìm...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Tìm kiếm
              </>
            )}
          </button>
        </div>

        {/* Reset Button */}
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

      {/* Results Status */}
      {hasResults && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-center">
            Tìm thấy {filteredCompanies.length} công ty phù hợp với "
            {searchTerm}"
          </p>
        </div>
      )}

      {noResults && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-center">
            Không tìm thấy công ty nào với từ khóa "{searchTerm}"
          </p>
        </div>
      )}

      {/* Loading Skeleton - hiển thị khi đang search */}
      {isSearching && isLoading && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded-full w-20 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CompanyCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Companies Results - trong cùng container */}
      {isSearching && !isLoading && filteredCompanies.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Kết quả tìm kiếm
            </h3>
            <div className="text-slate-600 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="font-semibold text-blue-600">
                {filteredCompanies.length}
              </span>{" "}
              công ty
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <CompanyFilterCard
                key={company.id}
                company={company}
                onClick={() => onCompanyClick?.(company.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
