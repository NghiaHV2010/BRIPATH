import { useState } from "react";
import { Search, MapPin, Briefcase, X } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";

export default function CompanyFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const { filterCompanies, fetchCompanies, companies, isLoading } = useCompanyStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFilter();
  };

  const handleFilter = async () => {
    const filters = {
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      field: field.trim() || undefined
    };
    console.log("🔍 Filtering with:", filters);
    
    await filterCompanies(1, filters.name, filters.location, filters.field);
  };

  // Only update state, no auto-filter
  const handleInputChange = (
    fieldName: "name" | "location" | "field",
    value: string
  ) => {
    if (fieldName === "name") setName(value);
    if (fieldName === "location") setLocation(value);
    if (fieldName === "field") setField(value);
  };

  const handleReset = async () => {
    setName("");
    setLocation("");
    setField("");
    await fetchCompanies(1);
  };

  const hasActiveFilters = name || location || field;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Lọc công ty</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tên công ty..."
            value={name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Địa điểm..."
            value={location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Lĩnh vực..."
            value={field}
            onChange={(e) => handleInputChange("field", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
