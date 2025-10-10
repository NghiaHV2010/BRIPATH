import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import {
  JobList,
  JobFilters,
  JobPagination,
} from "../../components/job";
import { useJobStore } from "../../store/job.store";
import { Layout } from "../../components/layout";

export default function JobsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10); // Có thể get từ API response

  const { jobs, isLoading, getAllJobs } = useJobStore();

  useEffect(() => {
    getAllJobs({ page: currentPage });
  }, [currentPage, getAllJobs]);

  const loadJobs = async (page: number) => {
    setCurrentPage(page);
    await getAllJobs({ page });
  };

  const handleJobClick = (jobId: string) => {
    console.log("Job clicked:", jobId);
    // Có thể navigate to job details page
    // window.location.href = `/jobs/${jobId}`;
  };

  return (
    <Layout className="bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Explore Jobs</h1>
              <p className="text-green-100 text-lg">
                Discover amazing job opportunities and find your dream career
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <JobFilters onJobClick={handleJobClick} />

        {isLoading ? (
          <div className="flex items-center justify-center py-16 ">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">Loading jobs...</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">
              Các công việc đang được tuyển dụng trên{" "}
              <span className="text-green-600">BriPath</span>
            </h2>
            <JobList onJobClick={handleJobClick} />
            <JobPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={loadJobs}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}