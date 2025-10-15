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

export default function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1); // JobList page
  const [filterPage, setFilterPage] = useState(1); // Filtered jobs page
  const [urgentJobs, setUrgentJobs] = useState<Job[]>([]); // Việc gấp
  const jobsPerFilterPage = 8;

  const {
    jobs,
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

  useEffect(() => {
    getAllJobs({ page: currentPage });
  }, [currentPage, getAllJobs]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('✅ Connected to WebSocket server');
    };

    ws.onmessage = (message) => {
      const event = JSON.parse(message.data.toString());

      if (event.type === 'urgentJobsUpdate') {
        console.log('🔥 Cập nhật job việc gấp:', event.data);
        setUrgentJobs(event.data);
      }
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from WebSocket server');
    };

    return () => ws.close();
  }, []);

  const handleJobClick = (jobId: string) => {
    sessionStorage.setItem("jobScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("jobPage", currentPage.toString());
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveJob = async (jobId: string) => {
    const isSaved = checkIfSaved(jobId);
    if (isSaved) await unsaveJob(jobId);
    else await saveJob(jobId);
  };

  const handleResetFilter = async () => {
    clearFilteredJobs();
    setFilterPage(1);
  };

  return (
    <Layout className="bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Filters */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 px-4 mb-8">
        <div className="max-w-[1500px] mx-auto flex justify-center">
          <JobFilters onJobClick={() => handleJobClick} />
        </div>
      </div>

      {/* Urgent Jobs */}
      {urgentJobs && urgentJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="max-w-[1700px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {urgentJobs.map((u) => (
                <div className="relative" key={u.id}>
                  <div className="absolute -top-1 right-0 bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded rounded-tr-lg rounded-bl-lg z-20">Việc gấp</div>
                  <JobCard
                    job={u}
                    onClick={() => handleJobClick(u.id)}
                    onSave={() => handleSaveJob(u.id)}
                    compact={false}
                    isSaved={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtered Jobs */}
      {filteredJobs.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="max-w-[1700px] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-green-800 text-2xl font-semibold">
                Tìm thấy {filteredJobs.length} công việc phù hợp
              </h2>
              <button
                onClick={handleResetFilter}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                Xóa bộ lọc
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="relative left-1/2 right-1/2 w-screen max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
          <JobCarousel
            jobs={jobs}
            onJobClick={handleJobClick}
            title="Công việc nổi bật"
          />
        </div>
      )}

      {/* JobList */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Loading jobs...</p>
          </div>
        </div>
      ) : (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10">
          <div className="max-w-[1700px] mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Tất cả công việc trên{" "}
              <span className="text-green-600">BriPath</span>
            </h2>
            <JobList onJobClick={handleJobClick} />
            <JobPagination
              currentPage={currentPage}
              totalPages={10} // hoặc lấy từ API
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
