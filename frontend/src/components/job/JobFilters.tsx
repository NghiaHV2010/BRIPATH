import { useState, useEffect } from "react";
import { Search, X, MapPin, Briefcase, DollarSign } from "lucide-react";
import { useJobStore } from "../../store/job.store";

interface JobFiltersProps {
  onJobClick?: (jobId: string) => void;
}

export default function JobFilters({ onJobClick }: JobFiltersProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSalary, setSalaryRange] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { jobs, jobLabels, isLoading, filterJobs, getAllJobs, fetchJobLabels } =
    useJobStore();

  // Load job labels on mount
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
    ) {
      return;
    }

    setIsSearching(true);
    console.log("🔍 Filtering jobs:", {
      searchTerm,
      selectedLocation,
      selectedField,
      selectedSalary,
    });

    // Call filter API với all parameters
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
    await getAllJobs({ page: 1 });
  };

  const hasResults = isSearching && jobs.length > 0;
  const noResults = isSearching && jobs.length === 0 && !isLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tìm kiếm công việc phù hợp với bạn?
        </h2>
        <p className="text-slate-600">
          Nhập vị trí công việc hoặc lĩnh vực bạn quan tâm
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Main Search Input */}
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
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
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

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Location Filter */}
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

          {/* Field/Category Filter */}
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

          {/* Salary Filter */}
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

      {/* Results Status */}
      {hasResults && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-center">
            Tìm thấy {jobs.length} công việc phù hợp
          </p>
        </div>
      )}

      {noResults && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-center">
            Không tìm thấy công việc nào phù hợp với bộ lọc
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isSearching && isLoading && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-slate-200 rounded-full w-20 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtered Jobs Results */}
      {isSearching && !isLoading && jobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">
              Kết quả tìm kiếm
            </h3>
            <div className="text-slate-600 bg-green-50 px-4 py-2 rounded-lg">
              <span className="font-semibold text-green-600">
                {jobs.length}
              </span>{" "}
              công việc
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onJobClick?.(job.id)}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
              >
                <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                  {job.job_title}
                </h4>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                  {job.salary && job.salary.length > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-green-600">
                        {job.salary[0]} {job.currency || "VND"}
                      </span>
                    </div>
                  )}
                  {job.jobCategories && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.jobCategories.job_category}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      job.status === "on_going"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.status === "on_going" ? "Đang tuyển" : job.status}
                  </span>
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
