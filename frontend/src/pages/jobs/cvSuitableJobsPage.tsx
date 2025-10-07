import { useState, useEffect } from "react";
import Layout from "../../components/layout/layout";
import { fetchUserCVs, fetchSuitableJobs } from "../../api/cv_api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, FileText } from "lucide-react";

interface CVRecord {
  id: number;
  cv_name: string;
  cv_file_url: string;
  created_at: string;
}

interface SuitableJob {
  id: string;
  job_title: string;
  company_name?: string;
  location?: string;
  salary?: string;
  created_at: string;
}

export default function CVSuitableJobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cvs, setCvs] = useState<CVRecord[]>([]);
  const [suitableJobs, setSuitableJobs] = useState<SuitableJob[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch user CVs on component mount
  useEffect(() => {
    const loadCVs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserCVs<CVRecord[]>();
        setCvs(data || []);

        // Auto-select first CV if available
        if (data && data.length > 0) {
          setSelectedCvId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching CVs:", error);
        setError("Không thể tải danh sách CV. Vui lòng thử lại sau.");
        setCvs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCVs();
  }, []);

  // Fetch suitable jobs when CV is selected
  useEffect(() => {
    if (selectedCvId) {
      const loadSuitableJobs = async () => {
        try {
          setIsLoadingJobs(true);
          const jobs = await fetchSuitableJobs<SuitableJob[]>(selectedCvId);
          setSuitableJobs(jobs || []);
        } catch (error) {
          console.error("Error fetching suitable jobs:", error);
          setJobsError(
            "Không thể tải danh sách việc làm phù hợp. Vui lòng thử lại."
          );
          setSuitableJobs([]);
        } finally {
          setIsLoadingJobs(false);
        }
      };

      loadSuitableJobs();
    }
  }, [selectedCvId]);

  const handleNavigateToProfile = () => {
    navigate("/profile");
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Đang tải danh sách CV...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Có lỗi xảy ra
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // No CV state - show Bouncy Fail animation
  if (!cvs || cvs.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Việc làm phù hợp với CV
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Tìm việc làm phù hợp dựa trên CV của bạn
                </p>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="w-64 h-64 mx-auto mb-6">
                  <DotLottieReact
                    src="https://lottie.host/embed/0c6dce74-beb8-4e94-a758-6c7e2d1e0b13/vlVP0m4zfa.json"
                    loop
                    autoplay
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Bạn chưa có CV nào!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Để tìm được việc làm phù hợp, bạn cần tải lên CV của mình
                  trước. Hệ thống sẽ phân tích và gợi ý những công việc phù hợp
                  nhất.
                </p>
                <Button
                  onClick={handleNavigateToProfile}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên CV ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Has CV state - show CV selector and suitable jobs
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Việc làm phù hợp với CV
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Chọn CV để xem những công việc phù hợp với hồ sơ của bạn
            </p>

            {/* CV Selector */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Chọn CV để phân tích
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cvs.map((cv) => (
                  <Card
                    key={cv.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCvId === cv.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedCvId(cv.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {cv.cv_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(cv.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suitable Jobs */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Việc làm phù hợp
              </h2>

              {isLoadingJobs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">
                    Đang phân tích CV và tìm kiếm việc làm phù hợp...
                  </p>
                </div>
              ) : jobsError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">
                    <FileText className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Không thể tải việc làm
                  </h3>
                  <p className="text-red-600 mb-4">{jobsError}</p>
                  <Button
                    onClick={() => {
                      setJobsError(null);
                      if (selectedCvId) {
                        // Trigger reload of jobs
                        setSelectedCvId(null);
                        setTimeout(() => setSelectedCvId(selectedCvId), 100);
                      }
                    }}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : suitableJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {suitableJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {job.job_title}
                            </h3>
                            {job.company_name && (
                              <p className="text-gray-600 mb-1">
                                {job.company_name}
                              </p>
                            )}
                            {job.location && (
                              <p className="text-sm text-gray-500 mb-1">
                                📍 {job.location}
                              </p>
                            )}
                            {job.salary && (
                              <p className="text-sm text-green-600 font-medium mb-2">
                                💰 {job.salary}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Đăng{" "}
                              {new Date(job.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : selectedCvId ? (
                <div className="text-center py-12">
                  <div className="w-48 h-48 mx-auto mb-6">
                    <DotLottieReact
                      src="https://lottie.host/embed/0c6dce74-beb8-4e94-a758-6c7e2d1e0b13/vlVP0m4zfa.json"
                      loop
                      autoplay
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Không tìm thấy việc làm phù hợp
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Hiện tại chưa có công việc nào phù hợp với CV này. Vui lòng
                    thử lại sau hoặc cập nhật thông tin CV.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  Vui lòng chọn CV để xem việc làm phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
