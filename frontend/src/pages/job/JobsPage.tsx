import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [currentPage, setCurrentPage] = useState(1); // JobList page
  const [filterPage, setFilterPage] = useState(1); // Filtered jobs page
  const [urgentJobs, setUrgentJobs] = useState<Job[]>([]); // Việc gấp
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const jobsPerFilterPage = 8;

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
  } = useJobStore();

  // Paginate filtered jobs
  const totalFilterPages = Math.ceil(filteredJobs.length / jobsPerFilterPage);
  const paginatedFilteredJobs = filteredJobs.slice(
    (filterPage - 1) * jobsPerFilterPage,
    filterPage * jobsPerFilterPage
  );

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
    const ws = new WebSocket(
      import.meta.env.VITE_WS_URL || "ws://localhost:3000"
    );

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    ws.onmessage = (message) => {
      const event = JSON.parse(message.data.toString());

      if (event.type === "urgentJobsUpdate") {
        // console.log('🔥 Cập nhật job việc gấp:', event.data);
        setUrgentJobs(event.data);
      }
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from WebSocket server");
    };

    return () => ws.close();
  }, []);

  const handleJobClick = (jobId: string) => {
    sessionStorage.setItem("jobScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("jobPage", currentPage.toString());
    navigate(`/jobs/${jobId}`);
  };

  const handleJobClickFromFilters = (job: Job) => {
    handleJobClick(job.id);
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
    useJobStore.setState((state) => ({
      filteredJobs: state.filteredJobs.map((job) =>
        job.id === jobId ? { ...job, isSaved: !isSaved } : job
      ),
    }));
  };

  const handleResetFilter = async () => {
    clearFilteredJobs();
    setFilterPage(1);
  };

  return (
    <Layout className="bg-linear-to-br from-slate-50 to-slate-100">
      {/* Filters */}
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white py-16 px-4 mb-8">
        <div className="max-w-[1500px] mx-auto flex justify-center">
          <JobFilters onJobClick={() => handleJobClickFromFilters} />
        </div>
      </div>

      {/* Urgent Jobs */}
      {urgentJobs && urgentJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="flex justify-between items-center mb-6 w-full max-w-[1700px] mx-auto">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {urgentJobs.map((u) => (
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

      {/* Filtered Jobs */}
      {filteredJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-slate-800 text-xl font-bold">
                Tìm thấy {filteredJobs.length} công việc phù hợp
              </h2>
              <button
                onClick={handleResetFilter}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                Xóa bộ lọc
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedFilteredJobs.map((job) => (
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

            <JobPagination
              currentPage={filterPage}
              totalPages={totalFilterPages}
              onPageChange={setFilterPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Carousel */}
      {jobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-[95%] max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
          <JobCarousel
            jobs={jobs}
            onJobClick={handleJobClick}
            title="Công việc nổi bật"
          />
        </div>
      )}

      {/* JobList */}
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
              totalPages={totalPages || 10} // hoặc lấy từ API
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
