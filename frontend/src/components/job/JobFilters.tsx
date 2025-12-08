import { useState, useEffect } from "react";

import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Loader2,
  SearchIcon,
} from "lucide-react";

import { useJobStore } from "../../store/job.store";

import { Button } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { VIETNAM_PROVINCES } from "@/constants/location";

// Định nghĩa các khoảng Lương (Dùng cho Salary)

const SALARY_RANGES = [
  { value: "5-10", label: "5 - 10 triệu" },

  { value: "10-15", label: "10 - 15 triệu" },

  { value: "15-20", label: "15 - 20 triệu" },

  { value: "20-30", label: "20 - 30 triệu" },

  { value: "30+", label: "Trên 30 triệu" },
];

interface JobFiltersProps {
  onSearch: (
    name: string,
    location: string,
    label: string,
    salary: string
  ) => Promise<void>;
  onReset?: () => void;
}

export default function JobFilters({ onSearch, onReset }: JobFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedLocation, setSelectedLocation] = useState("");

  const [selectedLabel, setSelectedLabel] = useState("");

  const [selectedSalary, setSalaryRange] = useState("");

  const { fetchJobLabels, jobLabels, isLoading } = useJobStore();

  useEffect(() => {
    fetchJobLabels();
  }, [fetchJobLabels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !searchTerm.trim() &&
      !selectedLocation &&
      !selectedLabel &&
      !selectedSalary
    )
      return;

    await onSearch(
      searchTerm.trim(),
      selectedLocation,
      selectedLabel,
      selectedSalary
    );
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedLabel("");
    setSalaryRange("");
    onReset?.();
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      {/* Header */}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Bộ lọc công việc - Tìm việc nhanh chóng trên BriPath
        </h2>
      </div>

      {/* Search Form */}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="text"
              placeholder="Ví dụ: Software Engineer, Marketing..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Location (Sử dụng Select shadcn) */}

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              {/* ✅ FIX: Thêm text-black vào SelectTrigger để đảm bảo màu chữ hiển thị */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-green-500 text-black">
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

          {/* Field (Sử dụng Select shadcn) */}

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              {/* ✅ FIX: Thêm text-black vào SelectTrigger để đảm bảo màu chữ hiển thị */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-green-500 text-black">
                <SelectValue
                  placeholder="Loại công việc"
                  className="text-gray-900"
                />
              </SelectTrigger>

              <SelectContent>
                {/* JobLabels đã được fetch từ store */}

                {jobLabels.map(label => (
                  <SelectItem key={label.id} value={label.label_name}>
                    {label.label_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary (Sử dụng Select shadcn) */}

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />

            <Select value={selectedSalary} onValueChange={setSalaryRange}>
              {/* ✅ FIX: Thêm text-black vào SelectTrigger để đảm bảo màu chữ hiển thị */}

              <SelectTrigger className="w-full pl-10 pr-4 py-3 h-auto border-slate-300 focus:ring-2 focus:ring-green-500 text-black">
                <SelectValue
                  placeholder="Tất cả mức lương"
                  className="text-gray-900"
                />
              </SelectTrigger>

              <SelectContent>
                {SALARY_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}

        {(searchTerm ||
          selectedLocation ||
          selectedLabel ||
          selectedSalary) && (
            <div className="flex justify-center mt-2">
              <Button
                type="button"
                variant="custom"
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
