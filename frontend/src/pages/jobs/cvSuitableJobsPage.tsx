import { useState, useEffect } from "react";
import { fetchUserCVs, fetchSuitableJobs, feedbackJobForCV, fetchUserCVById } from "../../api/cv_api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, SquareArrowOutUpRight, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import { JobCard } from "../../components/job";
import { ResumeCard } from "../../components/resume/resumeCard";
import { Resume } from "../../components/resume/resume";
import toast, { Toaster } from "react-hot-toast";
import type { Job } from "../../types/job";
import type { Resume as ResumeType, ResumeListItem } from "../../types/resume";

// Extended Job type with feedback information
type JobWithFeedback = Job & {
  is_good?: boolean | null;
  score?: number;
};

export default function CVSuitableJobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cvs, setCvs] = useState<ResumeListItem[]>([]);
  const [suitableJobs, setSuitableJobs] = useState<JobWithFeedback[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const [selectedResumeData, setSelectedResumeData] = useState<ResumeType | null>(null);
  const [isLoadingResumeDetail, setIsLoadingResumeDetail] = useState(false);
  const [resumeDetailError, setResumeDetailError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Format score to percentage with 1 decimal place
  const formatMatchScore = (score?: number): string => {
    if (!score) return "0.0";
    return (score * 100).toFixed(1);
  };

  // Get match score color based on percentage
  const getMatchScoreColor = (score?: number): string => {
    if (!score) return "text-gray-500 bg-gray-100 border-gray-300";
    const percentage = score * 100;
    if (percentage >= 80) return "text-green-700 bg-green-100 border-green-300";
    if (percentage >= 60) return "text-blue-700 bg-blue-100 border-blue-300";
    if (percentage >= 40) return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-orange-700 bg-orange-100 border-orange-300";
  };

  // Get match level text
  const getMatchLevel = (score?: number): string => {
    if (!score) return "Không xác định";
    const percentage = score * 100;
    if (percentage >= 80) return "Rất phù hợp";
    if (percentage >= 60) return "Phù hợp";
    if (percentage >= 40) return "Tạm ổn";
    return "Ít phù hợp";
  };

  // Fetch user CVs on component mount
  useEffect(() => {
    const loadCVs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserCVs();
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
          const jobs = await fetchSuitableJobs<JobWithFeedback[]>(selectedCvId);
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

  const handleViewResumeDetails = async (cvId: number) => {
    try {
      setIsLoadingResumeDetail(true);
      const resume = await fetchUserCVById(cvId);
      setSelectedResumeData(resume);
      setShowResumeDialog(true);

    } catch (error) {
      setResumeDetailError(typeof error === "string" ? error : (error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải chi tiết CV."));
    } finally {
      setIsLoadingResumeDetail(false);
    }
  };

  const handleResumeCardClick = (cvId: number) => {
    setSelectedCvId(cvId);
  };

  const handleFeedbackJob = async (jobId: string, isGood: boolean) => {
    if (!selectedCvId) {
      toast.error("Không thể gửi phản hồi: Chưa chọn CV");
      return;
    }

    // Check if feedback already exists for this job
    const existingJob = suitableJobs.find(job => job.id === jobId);
    if (existingJob && existingJob.is_good !== null && existingJob.is_good !== undefined) {
      toast.error("Bạn đã đánh giá công việc này rồi!");
      return;
    }

    try {
      await feedbackJobForCV(jobId, selectedCvId, isGood);

      // Update the local state to reflect the feedback
      setSuitableJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, is_good: isGood }
            : job
        )
      );

      toast.success(isGood ? "Cảm ơn phản hồi tích cực của bạn!" : "Cảm ơn phản hồi của bạn!");

    } catch (error) {
      console.error("Error submitting job feedback:", error);
      toast.error("Không thể gửi phản hồi. Vui lòng thử lại!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải danh sách CV...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
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
    );
  }

  // No CV state - show Bouncy Fail animation
  if (!cvs || cvs.length === 0) {
    return (
      <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
        <div className="">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Việc làm phù hợp với CV
              </h3>
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
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Tải lên CV ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Has CV state - show CV selector and suitable jobs
  return (
    <div className="min-h-screen min-w-[95%] lg:min-w-4xl bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Việc làm phù hợp với CV
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Chọn CV để xem những công việc phù hợp với hồ sơ của bạn
          </p>

          {/* CV Selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Chọn CV để phân tích
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cvs.map((resume) => (
                <div key={resume.id} className="relative">
                  <ResumeCard
                    resume={resume}
                    onClick={handleResumeCardClick}
                    isSelected={selectedCvId === resume.id}
                  />
                  <div className="mt-3 absolute p-2 rounded-full bottom-2 right-2 cursor-pointer hover:bg-slate-200" onClick={() => handleViewResumeDetails(resume.id)}>
                    <SquareArrowOutUpRight className="size-6 text-gray-400" />
                  </div>
                </div>
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
              <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-12">
                {suitableJobs.map((job) => (
                  <div key={job.id} className="relative hover:scale-none">
                    {/* Match Score Badge */}
                    <div className="absolute -top-4 -left-1 z-10 ">
                      <div className={`px-3 py-1.5 rounded-full border-2 shadow-lg ${getMatchScoreColor(job.score)}`}>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <div className="flex flex-col items-start leading-none">
                            <span className="text-xs font-semibold">
                              {formatMatchScore(job.score)}%
                            </span>
                            <span className="text-[10px] font-medium opacity-80">
                              {getMatchLevel(job.score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <JobCard
                      job={job}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      isSaved={job.isSaved || false}
                    />

                    <div className="flex mt-1 justify-end items-center">
                      <p className="text-sm text-gray-400">
                        Hài lòng?
                      </p>
                      <button
                        className={`mx-2 transition-colors ${job.is_good === true
                          ? "text-green-600"
                          : job.is_good === false
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-green-600 cursor-pointer"
                          }`}
                        onClick={() => job.is_good === null || job.is_good === undefined ? handleFeedbackJob(job.id, true) : undefined}
                        disabled={job.is_good !== null && job.is_good !== undefined}
                        title={
                          job.is_good === true
                            ? "Bạn đã đánh giá tích cực"
                            : job.is_good === false
                              ? "Bạn đã đánh giá tiêu cực"
                              : "Công việc phù hợp"
                        }
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        className={`transition-colors ${job.is_good === false
                          ? "text-red-600"
                          : job.is_good === true
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-600 cursor-pointer"
                          }`}
                        onClick={() => job.is_good === null || job.is_good === undefined ? handleFeedbackJob(job.id, false) : undefined}
                        disabled={job.is_good !== null && job.is_good !== undefined}
                        title={
                          job.is_good === false
                            ? "Bạn đã đánh giá tiêu cực"
                            : job.is_good === true
                              ? "Bạn đã đánh giá tích cực"
                              : "Công việc không phù hợp"
                        }
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
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

        {/* Resume Detail Dialog */}
        <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <DialogContent className="max-w-5xl! w-[95%] max-h-[95vh] overflow-y-auto [&>button]:hidden [&>#dialog-close-button]:block p-4">
            <div className="flex w-full sticky top-0 justify-between items-center bg-slate-100 shadow-md z-50 px-4 py-2 rounded-xl">
              <DialogHeader>
                <DialogTitle>Chi tiết CV</DialogTitle>
                <DialogDescription>
                  Xem chi tiết thông tin CV của ứng viên
                </DialogDescription>
              </DialogHeader>

              <DialogClose id="dialog-close-button" asChild className="bg-red-100 text-center flex justify-center items-center size-10">
                <button
                  className="text-red-500 hover:text-red-700 hover:bg-red-200 rounded-full p-2 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogClose>
            </div>

            {selectedCvId && selectedResumeData && (
              <Resume
                resume={selectedResumeData}
                isLoading={isLoadingResumeDetail}
                error={resumeDetailError}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              maxWidth: "400px",
            },
            success: {
              style: {
                background: "#10B981",
                color: "white",
              },
              iconTheme: {
                primary: "white",
                secondary: "#10B981",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
