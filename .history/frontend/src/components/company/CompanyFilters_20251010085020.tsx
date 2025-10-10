import { useEffect, useState } from "react";
import { X, Loader2, SearchIcon } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";
import CompanyCard from "./CompanyCard";
import type { CompanySummary, CompanyField } from "@/types/company";
import { Button } from "../ui/button";
import { fetchFields } from "@/api/company_api"; // 👈 thêm dòng này

export default function CompanyFilters({
  onCompanyClick,
}: {
  onCompanyClick?: (companyId: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(6);

  // dữ liệu hiển thị
  const [displayedCompanies, setDisplayedCompanies] = useState<
    CompanySummary[]
  >([]);
  const [lastFetchCount, setLastFetchCount] = useState(0);

  // thêm các state mới cho field và location
  const [fields, setFields] = useState<CompanyField[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { filterCompanies, fetchCompanies, isLoading, clearFilteredCompanies } =
    useCompanyStore();

  // fetch danh sách lĩnh vực + địa điểm khi load trang
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // 1️⃣ Lấy danh sách field
        const fieldData = await fetchFields();
        setFields(fieldData);

        // 2️⃣ Lấy danh sách company để trích xuất location
        await fetchCompanies(1);
        const allCompanies = useCompanyStore.getState().companies ?? [];

        // 🔍 Lấy ra các thành phố (city) duy nhất từ users
        const uniqueCities = Array.from(
          new Set(
            allCompanies
              .map((c) => c.users?.address_city)
              .filter((city): city is string => Boolean(city))
          )
        );

        setLocations(uniqueCities);
      } catch (err) {
        console.error("Lỗi khi tải danh sách lĩnh vực hoặc địa điểm:", err);
      }
    };
    loadOptions();
  }, [fetchCompanies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() && !selectedField && !selectedLocation) return;

    setIsSearching(true);
    setPage(1);
    setVisibleCount(6);
    setDisplayedCompanies([]);
    setLastFetchCount(0);

    await filterCompanies(
      1,
      searchTerm.trim(),
      selectedLocation,
      selectedField,
      ""
    );

    const latest = useCompanyStore.getState().filteredCompanies ?? [];
    setDisplayedCompanies(latest);
    setLastFetchCount(latest.length);
  };

  const handleReset = async () => {
    setSearchTerm("");
    setSelectedField("");
    setSelectedLocation("");
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

    if (nextVisible > displayedCompanies.length && lastFetchCount === 12) {
      const nextPage = page + 1;
      setPage(nextPage);
      await filterCompanies(
        nextPage,
        searchTerm.trim(),
        selectedLocation,
        selectedField,
        ""
      );
      const latestPage = useCompanyStore.getState().filteredCompanies ?? [];
      setDisplayedCompanies((prev) => [...prev, ...latestPage]);
      setLastFetchCount(latestPage.length);
    }

    setVisibleCount(nextVisible);
  };

  const hasResults = isSearching && displayedCompanies.length > 0;
  const noResults =
    isSearching && displayedCompanies.length === 0 && !isLoading;

  const canShowLoadMore =
    displayedCompanies.length > visibleCount || lastFetchCount === 12;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Tìm kiếm công ty với lĩnh vực của bạn?
        </h2>
        <p className="text-slate-600">
          Nhập từ khóa, chọn lĩnh vực hoặc địa điểm để lọc kết quả
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
        {/* hàng 1: search input */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ví dụ: FPT, công nghệ, ngân hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={isLoading}
            variant="emerald"
            className="flex items-center justify-center min-w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SearchIcon />
            )}
          </Button>
        </div>

        {/* hàng 2: dropdown chọn field + location */}
       
          {/* field */}
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn lĩnh vực --</option>
            {fields.map((f) => (
              <option key={f.id} value={f.field_name}>
                {f.field_name}
              </option>
            ))}
          </select>

          {/* location */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn địa điểm --</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        

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

      {/* RESULTS */}
      {hasResults && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Kết quả tìm kiếm
            </h3>
            <div className="text-slate-600 bg-blue-50 px-4 py-2 rounded-lg">
              {displayedCompanies.length} công ty / doanh nghiệp
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedCompanies.slice(0, visibleCount).map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => onCompanyClick?.(company.id)}
              />
            ))}
          </div>

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
        <p className="text-center mt-8 text-amber-600">
          Không tìm thấy công ty nào với từ khóa "{searchTerm}"
        </p>
      )}
    </div>
  );
}
