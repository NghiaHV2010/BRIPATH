import { useEffect, useState } from "react";
import { getSavedJobs, unsaveJobApi } from "@/api/job_api";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Bookmark,
  Filter,
  Loader,
  Search
} from "lucide-react";
import type { SavedJobs } from "@/types/job";
import { JobCard } from "@/components/job";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getSavedJobs();

        if (res.success) {
          console.log(res.data);
          setSavedJobs(res.data);
        } else {
          alert("Không thể tải danh sách công việc đã lưu. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error loading saved savedJobs:", error);
        {
          alert("Có lỗi xảy ra khi tải danh sách công việc đã lưu.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUnsave = async (jobId: string) => {
    setSavedJobs(prev => prev.filter(j => j.jobs.id !== jobId));
    try {
      await unsaveJobApi(jobId);
      toast({ variant: "success", title: "Thành công!", description: "Đã bỏ lưu công việc." });
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể bỏ lưu. Thử lại sau." });
    }
  };

  const filteredJobs = savedJobs.filter(j => {
    // Ensure j and j.jobs exist before accessing properties
    if (!j || !j.jobs) return false;

    const matchesSearch = j.jobs.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.jobs.jobCategories?.job_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.jobs.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || j.jobs.jobCategories?.job_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(savedJobs
    .filter(j => j && j.jobs && j.jobs.jobCategories?.job_category)
    .map(j => j.jobs.jobCategories!.job_category)
  )];

  const handleJobClick = (id: string): void => {
    // Navigate to the job detail page
    window.location.href = `/jobs/${id}`;
  };

  if (loading && !savedJobs) {
    return <Loader className="size-10 animate-spin" />;
  }

  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Việc làm đã lưu</h3>
        </div>
        <p className="text-gray-600">
          Quản lý và theo dõi các công việc bạn đã lưu. Tìm thấy {savedJobs.length} công việc đã lưu.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công việc, công ty, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Tất cả ngành nghề</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {savedJobs.length === 0 ? "Chưa có công việc nào được lưu" : "Không tìm thấy công việc phù hợp"}
            </h3>
            <p className="text-gray-500 mb-6">
              {savedJobs.length === 0
                ? "Hãy khám phá và lưu những công việc bạn quan tâm để dễ dàng theo dõi sau này."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy công việc phù hợp."
              }
            </p>
            {savedJobs.length === 0 && (
              <Link
                to="/jobs"
                className=""
              >
                Khám phá công việc
              </Link>
            )}
          </div>
        ) : (
          filteredJobs.map((j) => (
            <div key={j.jobs.id} className="relative">
              <p className="absolute top-1 right-2 z-10 font-thin text-sm text-gray-600">{new Date(j.saved_at).toLocaleString()}</p>
              <JobCard
                job={j.jobs}
                onClick={() => handleJobClick(j.jobs.id)}
                onSave={() => handleUnsave(j.jobs.id)}
                isSaved={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
