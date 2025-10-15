import { useState, useEffect } from "react";
import {
  Search,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Loader2,
  SearchIcon,
} from "lucide-react";
import { useJobStore } from "../../store/job.store";
import { Button } from "../ui/button";
import type { Job } from "../../types/job";

interface JobFiltersProps {
  onJobClick?: (job: Job) => void;
}

export default function JobFilters({ onJobClick }: JobFiltersProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSalary, setSalaryRange] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);

  const {
    filterJobs,
    getAllJobs,
    fetchJobLabels,
    jobLabels,
    isLoading,
    clearFilteredJobs,
    filteredJobs,
  } = useJobStore();

  useEffect(() => {
    fetchJobLabels();
  }, [fetchJobLabels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !searchTerm.trim() &&
      !selectedLocation &&
      !selectedField &&
      !selectedSalary
    )
      return;

    setIsSearching(true);
    setPage(1);

    await filterJobs({
      page: 1,
      name: searchTerm.trim() || undefined,
      location: selectedLocation || undefined,
      field: selectedField || undefined,
      salary: selectedSalary || undefined,
    });
  };

  const handleReset = async () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedField("");
    setSalaryRange("");
    setIsSearching(false);
    setPage(1);
    clearFilteredJobs();
    await getAllJobs({ page: 1 });
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
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
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
            >
              <option value="">Tất cả lĩnh vực</option>
              {jobLabels.map((label) => (
                <option key={label.id} value={label.label_name}>
                  {label.label_name}
                </option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedSalary}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
            >
              <option value="">Tất cả mức lương</option>
              <option value="5-10">5 - 10 triệu</option>
              <option value="10-15">10 - 15 triệu</option>
              <option value="15-20">15 - 20 triệu</option>
              <option value="20-30">20 - 30 triệu</option>
              <option value="30+">Trên 30 triệu</option>
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
