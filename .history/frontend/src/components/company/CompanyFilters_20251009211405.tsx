import { useState } from "react";
import { Search, MapPin, Briefcase, X } from "lucide-react";
import { useCompanyStore } from "../../store/company.store";

interface CompanyFiltersProps {}

export default function CompanyFilters({}: CompanyFiltersProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [field, setField] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFilter({
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      field: field.trim() || undefined,
    });
  };

  // Auto-filter on change instead of waiting for submit
  const handleInputChange = (
    fieldName: "name" | "location" | "field",
    value: string
  ) => {
    // Update state first
    if (fieldName === "name") setName(value);
    if (fieldName === "location") setLocation(value);
    if (fieldName === "field") setField(value);

    // Create updated filter object
    const currentFilters = {
      name: fieldName === "name" ? value : name,
      location: fieldName === "location" ? value : location,
      field: fieldName === "field" ? value : field,
    };

    // Debounce for name field, immediate for location/field
    if (fieldName === "name") {
      setTimeout(() => {
        onFilter({
          name: currentFilters.name.trim() || undefined,
          location: currentFilters.location.trim() || undefined,
          field: currentFilters.field.trim() || undefined,
        });
      }, 500);
    } else {
      onFilter({
        name: currentFilters.name.trim() || undefined,
        location: currentFilters.location.trim() || undefined,
        field: currentFilters.field.trim() || undefined,
      });
    }
  };

  const handleReset = () => {
    setName("");
    setLocation("");
    setField("");
    onReset();
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
