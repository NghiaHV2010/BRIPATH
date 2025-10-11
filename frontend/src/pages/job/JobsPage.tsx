import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase } from "lucide-react";
import {
  JobList,
  JobFilters,
  JobPagination,
  JobCarousel,
} from "../../components/job";
import { useJobStore } from "../../store/job.store";
import { Layout } from "../../components/layout";

export default function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10); // Có thể get từ API response

  const { jobs, isLoading, getAllJobs } = useJobStore();

  useEffect(() => {
    getAllJobs({ page: currentPage });
  }, [currentPage, getAllJobs]);

  // Handle external navigation detection
  useEffect(() => {
    // Check if this is external navigation (from navbar, direct URL, etc.)
    const isExternalNavigation =
      !sessionStorage.getItem("jobScrollPosition") &&
      !sessionStorage.getItem("jobPage") &&
      !sessionStorage.getItem("jobFilterState");

    if (isExternalNavigation) {
      // Clear any leftover states and start fresh
      sessionStorage.removeItem("jobScrollPosition");
      sessionStorage.removeItem("jobPage");
      sessionStorage.removeItem("jobFilterState");

      // Reset to page 1
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
  }, [location.pathname, currentPage]);

  // Restore states when returning from job detail (run once on mount)
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("jobScrollPosition");
    const savedPage = sessionStorage.getItem("jobPage");

    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem("jobScrollPosition");
      }, 100);
    }

    if (savedPage) {
      const page = parseInt(savedPage);
      if (page !== currentPage) {
        setCurrentPage(page);
        // Don't call getAllJobs here as it will be handled by the first useEffect
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const loadJobs = async (page: number) => {
    setCurrentPage(page);
    sessionStorage.setItem("jobPage", page.toString()); // 🔹 lưu page hiện tại
    await getAllJobs({ page });
  };

  const handleJobClick = (jobId: string) => {
    // 🔹 lưu vị trí cuộn trước khi rời trang
    sessionStorage.setItem("jobScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("jobPage", currentPage.toString());
    navigate(`/jobs/${jobId}`);
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

        {jobs.length > 0 && (
          <JobCarousel
            jobs={jobs}
            onJobClick={handleJobClick}
            title="Công việc nổi bật"
          />
        )}

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
              Tất cả công việc trên{" "}
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
