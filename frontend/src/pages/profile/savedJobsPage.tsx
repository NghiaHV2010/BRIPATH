import { useEffect, useState } from "react";
import { getSavedJobs, unsaveJobApi } from "@/api/job_api";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Bookmark,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  Trash2,
  ExternalLink,
  Filter,
  Search
} from "lucide-react";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unsaving, setUnsaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getSavedJobs();
        if (mounted && res.success) {
          setJobs(res.data);
        } else if (mounted) {
          alert("Không thể tải danh sách công việc đã lưu. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error loading saved jobs:", error);
        if (mounted) {
          alert("Có lỗi xảy ra khi tải danh sách công việc đã lưu.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUnsave = async (jobId: string) => {
    setUnsaving(jobId);
    try {
      await unsaveJobApi(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast({
        variant: "success",
        title: "Thành công!",
        description: "Đã bỏ lưu công việc thành công.",
      });
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi bỏ lưu công việc. Vui lòng thử lại.",
      });
    } finally {
      setUnsaving(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobCategories?.job_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || job.jobCategories?.job_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(jobs.map(job => job.jobCategories?.job_category).filter(Boolean))];

  const formatSalary = (salary: any, currency: string) => {
    if (Array.isArray(salary)) {
      return salary.join(" - ") + (currency ? ` ${currency}` : "");
    }
    return salary + (currency ? ` ${currency}` : "");
  };

  return (
    <div className="min-h-screen max-w-4xl w-[100%] bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">Việc làm đã lưu</h3>
          </div>
          <p className="text-gray-600">
            Quản lý và theo dõi các công việc bạn đã lưu. Tìm thấy {jobs.length} công việc đã lưu.
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
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {jobs.length === 0 ? "Chưa có công việc nào được lưu" : "Không tìm thấy công việc phù hợp"}
              </h3>
              <p className="text-gray-500 mb-6">
                {jobs.length === 0
                  ? "Hãy khám phá và lưu những công việc bạn quan tâm để dễ dàng theo dõi sau này."
                  : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy công việc phù hợp."
                }
              </p>
              {jobs.length === 0 && (
                <Link
                  to="/jobs"
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Khám phá công việc
                </Link>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="group block"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {job.job_title}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            {job.jobCategories?.job_category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {job.jobCategories.job_category}
                              </span>
                            )}
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.working_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.working_time}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            {job.salary && (
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatSalary(job.salary, job.currency || "")}</span>
                              </div>
                            )}
                            {job.created_at && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Đăng {new Date(job.created_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem chi tiết
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={unsaving === job.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {unsaving === job.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Bỏ lưu
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bỏ lưu công việc</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn bỏ lưu công việc "{job.job_title}"?
                              Hành động này không thể hoàn tác và công việc sẽ bị xóa khỏi danh sách đã lưu.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnsave(job.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                              Bỏ lưu
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
