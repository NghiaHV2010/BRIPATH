import { useState, useEffect } from "react";
import {
  Search,
  X,
  MapPin,
  Briefcase,
  Loader2,
  SearchIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useCompanyStore } from "@/store/company.store";
import { fetchFields } from "@/api/company_api";
import type { CompanyField } from "@/types/company";

interface CompanyFiltersProps {
  userId?: string;
}

export default function CompanyFilters({ userId }: CompanyFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [fields, setFields] = useState<CompanyField[]>([]);

  const {
    filterCompanies,
    clearFilteredCompanies,
    fetchCompanies,
    isLoading,
    filteredCompanies,
  } = useCompanyStore();

  // ✅ Load danh sách field (ngành nghề)
  useEffect(() => {
    const loadFields = async () => {
      try {
        const data = await fetchFields();
        setFields(data);
      } catch (err) {
        console.error("❌ Lỗi khi load field:", err);
      }
    };
    loadFields();
  }, []);

  // ✅ Xử lý lọc
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() && !selectedLocation && !selectedField) return;

    setIsSearching(true);
    setPage(1);

    await filterCompanies(
      1,
      searchTerm.trim(),
      selectedLocation,
      selectedField,
      userId
    );
  };

  // ✅ Xóa lọc
  const handleReset = async () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedField("");
    setIsSearching(false);
    setPage(1);
    clearFilteredCompanies();
    await fetchCompanies(1, userId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Bộ lọc công ty - Tìm nhà tuyển dụng phù hợp
        </h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập tên công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
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

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Tất cả địa điểm</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Field */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Tất cả lĩnh vực</option>
              {fields.map((f) => (
                <option key={f.id} value={f.field_name}>
                  {f.field_name}
                </option>
              ))}
            </select>
          </div>
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
              Xóa bộ lọc
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
