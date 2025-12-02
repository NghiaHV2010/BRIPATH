import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  JobList,
  JobFilters,
  JobPagination,
  JobCarousel,
} from "../../components/job";
import { useJobStore } from "../../store/job.store";
import { Layout } from "../../components/layout";
import JobCard from "../../components/job/JobCard";
import type { Job } from "@/types/job";
import { Clock } from "lucide-react";

export default function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [filterPage, setFilterPage] = useState(1);
  const [allFilteredJobs, setAllFilteredJobs] = useState<Job[]>([]);
  const [currentFilterParams, setCurrentFilterParams] = useState({
    name: "",
    location: "",
    label: "",
    salary: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [urgentJobs, setUrgentJobs] = useState<Job[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const {
    jobs,
    totalPages,
    filteredJobs,
    isLoading,
    getAllJobs,
    checkIfSaved,
    saveJob,
    unsaveJob,
    clearFilteredJobs,
    filterJobs,
  } = useJobStore();

  const hasMoreFilteredJobs = filteredJobs.length === 16;

  // Real-time timer for Vietnam timezone (UTC+7)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatVietnamTime = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  useEffect(() => {
    getAllJobs({ page: currentPage });
  }, [currentPage, getAllJobs]);

  useEffect(() => {
    const isExternalNavigation =
      !sessionStorage.getItem("jobScrollPosition") &&
      !sessionStorage.getItem("jobPage") &&
      !sessionStorage.getItem("jobFilterState");

    if (isExternalNavigation && currentPage !== 1) {
      sessionStorage.removeItem("jobScrollPosition");
      sessionStorage.removeItem("jobPage");
      sessionStorage.removeItem("jobFilterState");
      setCurrentPage(1);
    }
  }, [location.pathname, currentPage]);

  useEffect(() => {
    return () => {
      if (!sessionStorage.getItem("filteredJobs")) {
        clearFilteredJobs();
        setAllFilteredJobs([]);
        setHasSearched(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("jobScrollPosition");
    const savedPage = sessionStorage.getItem("jobPage");
    const savedFilteredJobs = sessionStorage.getItem("filteredJobs");
    const savedFilterPage = sessionStorage.getItem("filterPage");
    const savedFilterParams = sessionStorage.getItem("filterParams");

    if (savedFilteredJobs && savedFilterPage && savedFilterParams) {
      try {
        setAllFilteredJobs(JSON.parse(savedFilteredJobs));
        setFilterPage(parseInt(savedFilterPage));
        setCurrentFilterParams(JSON.parse(savedFilterParams));
        setHasSearched(JSON.parse(savedFilteredJobs).length > 0);

        sessionStorage.removeItem("filteredJobs");
        sessionStorage.removeItem("filterPage");
        sessionStorage.removeItem("filterParams");
      } catch (err) {
        console.error("Error restoring filter state:", err);
      }
    }

    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem("jobScrollPosition");
      }, 100);
    }

    if (savedPage && parseInt(savedPage) !== currentPage) {
      setCurrentPage(parseInt(savedPage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filteredJobs.length > 0) {
      if (filterPage === 1) {
        setAllFilteredJobs(filteredJobs);
      } else {
        setAllFilteredJobs(prev => {
          const existingIds = new Set(prev.map(job => job.id));
          const newJobs = filteredJobs.filter(job => !existingIds.has(job.id));
          return [...prev, ...newJobs];
        });
      }
    }
  }, [filteredJobs, filterPage]);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(
          import.meta.env.VITE_WS_URL || "ws://localhost:3000"
        );

        ws.onopen = () => {
          console.log("✅ Connected to WebSocket server");
        };

        ws.onmessage = message => {
          const event = JSON.parse(message.data.toString());

          if (event.type === "urgentJobsUpdate") {
            setUrgentJobs(event.data);
          }
        };

        ws.onerror = error => {
          console.warn("WebSocket connection error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
        };

        return ws;
      } catch (error) {
        console.warn("Failed to connect to WebSocket server:", error);
        return null;
      }
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleJobClick = (jobId: string) => {
    sessionStorage.setItem("jobScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("jobPage", currentPage.toString());

    if (allFilteredJobs.length > 0) {
      sessionStorage.setItem("filteredJobs", JSON.stringify(allFilteredJobs));
      sessionStorage.setItem("filterPage", filterPage.toString());
      sessionStorage.setItem(
        "filterParams",
        JSON.stringify(currentFilterParams)
      );
    }

    navigate(`/jobs/${jobId}`);
  };

  const handleSaveJob = async (jobId: string) => {
    const isSaved = checkIfSaved(jobId);
    if (isSaved) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
    // Update filteredJobs' isSaved state immediately for UI feedback
    // (Zustand store does not update filteredJobs on save/unsave by default)
    useJobStore.setState(state => ({
      filteredJobs: state.filteredJobs.map(job =>
        job.id === jobId ? { ...job, isSaved: !isSaved } : job
      ),
    }));
  };

  const handleFilterSearch = async (
    name: string,
    location: string,
    label: string,
    salary: string
  ) => {
    setIsSearching(true);
    setFilterPage(1);
    setAllFilteredJobs([]);
    setHasSearched(true);
    setCurrentFilterParams({ name, location, label, salary });
    await filterJobs({
      page: 1,
      name: name || undefined,
      location: location || undefined,
      label: label || undefined,
      salary: salary || undefined,
    });
    setIsSearching(false);
  };

  const handleLoadMore = async () => {
    const nextPage = filterPage + 1;
    setFilterPage(nextPage);
    await filterJobs({
      page: nextPage,
      name: currentFilterParams.name || undefined,
      location: currentFilterParams.location || undefined,
      label: currentFilterParams.label || undefined,
      salary: currentFilterParams.salary || undefined,
    });
  };

  const handleResetFilter = async () => {
    clearFilteredJobs();
    setFilterPage(1);
    setAllFilteredJobs([]);
    setCurrentFilterParams({ name: "", location: "", label: "", salary: "" });
    setHasSearched(false);
    setIsSearching(false);

    sessionStorage.removeItem("filteredJobs");
    sessionStorage.removeItem("filterPage");
    sessionStorage.removeItem("filterParams");
    sessionStorage.removeItem("jobFilterState");
  };

  const loadJobs = async (page: number) => {
    setCurrentPage(page);
    sessionStorage.setItem("jobPage", page.toString());
    await getAllJobs({ page });
  };

  return (
    <Layout className="bg-linear-to-br from-slate-50 to-slate-100">
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white py-16 px-4 mb-8">
        <div className="max-w-[1500px] mx-auto flex justify-center">
          <JobFilters
            onSearch={handleFilterSearch}
            onReset={handleResetFilter}
          />
        </div>
      </div>

      {isSearching && allFilteredJobs.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Đang tìm kiếm...</p>
          </div>
        </div>
      )}

      {/* Urgent Jobs */}
      {urgentJobs && urgentJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="flex flex-wrap justify-between items-center mb-6 w-full max-w-[1700px] mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Một cú click, việc gấp có liền!
            </h2>
            {/* Vietnam Time Display */}
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md border border-gray-200">
              <Clock className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <div className="font-semibold text-gray-800">
                  {formatVietnamTime(currentTime)}
                </div>
                <div className="text-xs text-gray-500">Vietnam (UTC+7)</div>
              </div>
            </div>
          </div>
          {/* Add timer here */}
          <div className="max-w-[1700px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {urgentJobs.map(u => (
                <JobCard
                  key={u.id}
                  job={u}
                  onClick={() => handleJobClick(u.id)}
                  onSave={() => handleSaveJob(u.id)}
                  compact={false}
                  isSaved={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {allFilteredJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <h2 className="text-slate-800 text-xl font-bold mb-4">
              Kết quả tìm kiếm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allFilteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job.id)}
                  onSave={() => handleSaveJob(job.id)}
                  compact={false}
                  isSaved={job.isSaved || false}
                />
              ))}
            </div>

            {hasMoreFilteredJobs && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Tìm thấy {allFilteredJobs.length} công việc phù hợp
              </p>
            </div>
          </div>
        </div>
      )}

      {hasSearched && allFilteredJobs.length === 0 && !isSearching && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="w-16 h-16 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700">
                  Không tìm thấy công việc phù hợp
                </h3>
                <p className="text-sm text-slate-500">
                  Vui lòng thử lại với từ khóa hoặc bộ lọc khác
                </p>
                <button
                  onClick={handleResetFilter}
                  className="mt-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-[95%] max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
          <JobCarousel
            jobs={jobs}
            onJobClick={handleJobClick}
            title="Công việc nổi bật"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Đang tải việc làm...</p>
          </div>
        </div>
      ) : (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-8">
          <div className="max-w-[1700px] mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Tất cả công việc trên{" "}
              <span className="text-green-600">BriPath</span>
            </h2>
            <JobList onJobClick={handleJobClick} />
            <JobPagination
              currentPage={currentPage}
              totalPages={totalPages || 10}
              onPageChange={loadJobs}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
