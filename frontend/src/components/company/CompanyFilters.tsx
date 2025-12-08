import { useState, useEffect } from "react";

import { Search, MapPin, Briefcase, Loader2, SearchIcon } from "lucide-react";

import { Button } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { useCompanyStore } from "@/store/company.store";
import { fetchFields } from "@/api/company_api";
import type { CompanyField } from "@/types/company";
import { VIETNAM_PROVINCES } from "@/constants/location";

const COMPANY_SIZES = [
  { value: "1-10", label: "1 - 10 nhân viên" },

  { value: "11-50", label: "11 - 50 nhân viên" },

  { value: "51-200", label: "51 - 200 nhân viên" },

  { value: "201-500", label: "201 - 500 nhân viên" },

  { value: "501-1000", label: "501 - 1000 nhân viên" },

  { value: "1000+", label: "1000+ nhân viên" },
];

interface CompanyFiltersProps {
  onSearch: (name: string, location: string, field: string) => Promise<void>;

  onReset?: () => void;
}

export default function CompanyFilters({
  onSearch,

  onReset,
}: CompanyFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedLocation, setSelectedLocation] = useState("");

  const [selectedField, setSelectedField] = useState("");

  const [selectedSize, setSelectedSize] = useState("");

  const [fields, setFields] = useState<CompanyField[]>([]);

  const { isLoading } = useCompanyStore();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim() && !selectedLocation && !selectedField) return;

    await onSearch(searchTerm.trim(), selectedLocation, selectedField);
  };

  const handleReset = () => {
    setSearchTerm("");

    setSelectedLocation("");

    setSelectedField("");

    setSelectedSize("");

    onReset?.();
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
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center min-w-[60px] px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SearchIcon />
            )}
          </Button>
        </div>

        {/* Advanced Filters */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Location */}

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              {/* ✅ SỬA: Thêm class text-black vào SelectTrigger để đảm bảo màu chữ kế thừa là màu đen */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-blue-500 text-black">
                {/* ✅ SelectValue không cần class màu chữ nữa vì đã kế thừa từ Trigger, nhưng giữ lại để tăng cường nếu cần */}

                <SelectValue
                  placeholder="Tất cả địa điểm"
                  className="text-gray-900"
                />
              </SelectTrigger>

              <SelectContent>
                {VIETNAM_PROVINCES.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field */}

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select value={selectedField} onValueChange={setSelectedField}>
              {/* ✅ SỬA: Thêm class text-black vào SelectTrigger */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-blue-500 text-black">
                <SelectValue
                  placeholder="Tất cả lĩnh vực"
                  className="text-gray-900"
                />
              </SelectTrigger>

              <SelectContent>
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.field_name}>
                    {f.field_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company size */}

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select value={selectedSize} onValueChange={setSelectedSize}>
              {/* ✅ SỬA: Thêm class text-black vào SelectTrigger */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-blue-500 text-black">
                <SelectValue
                  placeholder="Tất cả quy mô"
                  className="text-gray-900"
                />
              </SelectTrigger>

              <SelectContent>
                {COMPANY_SIZES.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}

        {(searchTerm || selectedLocation || selectedField || selectedSize) && (
          <div className="flex justify-center mt-2">
            <Button
              variant={"custom"}
              onClick={handleReset}
              className="text-red-600 text-lg font-medium"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
