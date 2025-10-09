import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJobStore } from "../../store/job.store";
import { useAuthStore } from "../../store/auth";
import { JobCarousel } from "@/components";
import { Button } from "@/components/ui/button";

// UI state cho form filter (tách biệt với API params)
type JobFilterUI = {
  searchTerm: string;
  location: string;
  field: string;
  salary: string;
};

const createDefaultJobFilters = (): JobFilterUI => ({
  searchTerm: "",
  location: "",
  field: "",
  salary: "",
});

export default function JobsPage() {
  const navigate = useNavigate();
  const {
    jobs,
    isLoading: loading,
    error,
    totalPages,
    getAllJobs,
    filterJobs,
  } = useJobStore();
  const { authUser: user } = useAuthStore();

  const [filters, setFilters] = useState<JobFilterUI>(
    createDefaultJobFilters()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltered, setIsFiltered] = useState(false);

  // Load initial jobs on component mount
  useEffect(() => {
    getAllJobs({ page: 1, userId: user?.id });
  }, [getAllJobs, user?.id]);

  const handleSearch = async () => {
    // Map UI state sang FilterJobParams cho API
    const filterParams = {
      page: 1,
      userId: user?.id,
      name: filters.searchTerm || undefined,
      location: filters.location || undefined,
      field: filters.field || undefined,
      salary: filters.salary || undefined,
    };

    await filterJobs(filterParams);
    setCurrentPage(1);
    setIsFiltered(true);
  };

  const handleClearFilters = async () => {
    setFilters(createDefaultJobFilters());
    await getAllJobs({ page: 1, userId: user?.id });
    setCurrentPage(1);
    setIsFiltered(false);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    if (isFiltered) {
      // Map UI state sang FilterJobParams cho API
      const filterParams = {
        page,
        userId: user?.id,
        name: filters.searchTerm || undefined,
        location: filters.location || undefined,
        field: filters.field || undefined,
        salary: filters.salary || undefined,
      };
      await filterJobs(filterParams);
    } else {
      await getAllJobs({ page, userId: user?.id });
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => getAllJobs({ page: 1, userId: user?.id })}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Tìm kiếm việc làm mơ ước của bạn
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Hàng nghìn cơ hội việc làm đang chờ đợi bạn
            </p>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm việc làm..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Địa điểm"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <select
                    value={filters.field}
                    onChange={(e) =>
                      setFilters({ ...filters, field: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Tất cả lĩnh vực</option>
                    <option value="IT">Công nghệ thông tin</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Kinh doanh</option>
                    <option value="Finance">Tài chính</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filters.salary}
                    onChange={(e) =>
                      setFilters({ ...filters, salary: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Mức lương</option>
                    <option value="5-10">5-10 triệu</option>
                    <option value="10-20">10-20 triệu</option>
                    <option value="20-30">20-30 triệu</option>
                    <option value="30+">Trên 30 triệu</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-4">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
                {isFiltered && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Carousel - Featured Jobs */}
      {jobs.length > 0 && !isFiltered && (
        <JobCarousel jobs={jobs.slice(0, 8)} title="Việc làm nổi bật" />
      )}

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isFiltered ? "Kết quả tìm kiếm" : "Tất cả việc làm"}
          </h2>
          <span className="text-gray-600">{jobs.length} việc làm</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy việc làm nào
            </h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi tiêu chí tìm kiếm của bạn
            </p>
            {isFiltered && (
              <Button onClick={handleClearFilters} variant="outline">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer border border-gray-200 hover:border-blue-200"
                  onClick={() => handleJobClick(job.id)}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {job.job_title?.charAt(0)?.toUpperCase() || "J"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {job.jobCategories?.job_category || "Công ty"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job.location || "Hồ Chí Minh"}
                      </p>
                    </div>
                    {job.status === "on_going" && (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                        Đang tuyển
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">
                    {job.job_title}
                  </h4>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span className="font-medium text-green-600">
                        {job.salary && job.salary.length > 0
                          ? `${job.salary[0]}${
                              job.currency ? ` ${job.currency}` : ""
                            }`
                          : "Thỏa thuận"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{job.location || "Hồ Chí Minh"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.jobCategories && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {job.jobCategories.job_category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Mới đăng</span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-2"
                  >
                    Trước
                  </Button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className="px-3 py-2"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="px-3 py-2"
                  >
                    Sau
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
