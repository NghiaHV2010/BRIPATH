"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { resetAnswer } from "../../api/quiz_api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useQuizStore } from "../../store/quiz.store";
import { Briefcase, AlertTriangle, Lightbulb, Heart, Zap, TrendingUp, Target } from "lucide-react";
import { Layout } from "../../components/layout";
import { createCPAPI, type JobType, type SuitableJobCategory } from "../../api/quiz_api";
import { toast } from "sonner";

export default function QuizResultsPage() {
  const navigate = useNavigate();
  const { results, isLoading, error, resetQuiz } = useQuizStore();
  const [cpLoading, setCPLoading] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [animatedCards, setAnimatedCards] = useState<Set<number>>(new Set());

  // Format score to percentage with 1 decimal place
  const formatScore = (score?: number): string => {
    if (!score) return "0.0";
    return (score * 100).toFixed(1);
  };

  // Get score color based on percentage
  const getScoreColor = (score?: number): string => {
    if (!score) return "text-gray-500 bg-gray-100 border-gray-300";
    const percentage = score * 100;
    if (percentage >= 80) return "text-green-700 bg-green-100 border-green-300";
    if (percentage >= 60) return "text-blue-700 bg-blue-100 border-blue-300";
    if (percentage >= 40) return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-orange-700 bg-orange-100 border-orange-300";
  };

  // Get match level text
  const getMatchLevel = (score?: number): string => {
    if (!score) return "Không phù hợp";
    const percentage = score * 100;
    if (percentage >= 80) return "Rất phù hợp";
    if (percentage >= 60) return "Phù hợp";
    if (percentage >= 40) return "Tạm phù hợp";
    return "Ít phù hợp";
  };

  // Get category score color (lighter shades for category)
  const getCategoryScoreColor = (score?: number): string => {
    if (!score) return "text-gray-600 bg-gray-50 border-gray-200";
    const percentage = score * 100;
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    results.forEach((result, index) => {
      setTimeout(() => {
        setAnimatedCards((prev) => new Set([...prev, result.id]));
      }, index * 100);
    });
  }, [results]);

  const confirmAndReset = async () => {
    await resetAnswer();
    resetQuiz();
    setShowConfirmExit(false);
    if (pendingAction) pendingAction();
  };

  const handleRetakeQuiz = () => {
    setPendingAction(() => () => navigate("/quiz"));
    setShowConfirmExit(true);
  };

  const handleExploreJobs = () => {
    setPendingAction(() => () => navigate("/jobs"));
    setShowConfirmExit(true);
  };

  const handleJobTypeClick = async (jobType: JobType) => {
    setCPLoading(true);
    try {
      const careerPathData = await createCPAPI(jobType.id, jobType.job_type);

      if (!careerPathData.success) {
        toast.error(careerPathData.message || "Đã có lỗi xảy ra.");
        setCPLoading(false);
        return;
      }

      navigate("/quiz/career-path", {
        state: { careerPath: careerPathData, isLoading: false },
      });
    } catch (err) {
      console.error("Error creating career path:", err);
    } finally {
      setCPLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-emerald-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải kết quả...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-emerald-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate("/quiz")} variant="outline">
              Quay lại
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (results.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-emerald-50">
          <Button onClick={() => navigate("/quiz")}>Làm lại quiz</Button>
        </div>
      </Layout>
    );
  }

  const linearColors = [
    "bg-blue-100",
    "bg-emerald-100",
    "bg-purple-100",
    "bg-orange-100",
    "bg-red-100",
    "bg-amber-100",
  ];

  return (
    <Layout>
      {/* Full Page Loading Overlay */}
      {cpLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Đang tạo lộ trình nghề nghiệp
            </h3>
            <p className="text-gray-600 mb-4">Vui lòng đợi trong giây lát...</p>
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Quá trình này có thể mất 20-60 giây
            </p>
          </div>
        </div>
      )}

      <div
        className={`min-h-screen py-12 bg-white ${cpLoading ? "pointer-events-none select-none" : ""
          }`}
      >
        <div className="text-center max-w-8xl mb-12">
          <div className="flex flex-col items-center justify-center gap-3 py-4 px-4">
            <h1 className="text-3xl pb-2 sm:text-4xl md:text-5xl font-bold text-center bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Kết Quả Định Hướng Nghề Nghiệp
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center max-w-3xl">
              Dựa trên câu trả lời của bạn, đây là những lĩnh vực nghề nghiệp
              phù hợp nhất với bạn
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 max-w-6xl mx-auto mb-8">
            <p className="text-gray-800 text-sm sm:text-base">
              <span className="font-semibold text-blue-600">💡 Hướng dẫn:</span>{" "}
              Dưới đây là các kết quả định hướng với những chuyên ngành rõ ràng.
              Khi bạn click vào một chuyên ngành, hệ thống sẽ tạo lộ trình nghề
              nghiệp chi tiết cho bạn. Quá trình này sẽ mất khoảng{" "}
              <span className="font-semibold">20</span> -{" "}
              <span className="font-semibold">60</span> giây để xử lý.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 mb-12">
            {results.map((result: SuitableJobCategory, resultIndex: number) => (
              <div
                key={result.id}
                className={`transform transition-all duration-700 mb-30 ${animatedCards.has(result.id)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                  } ${cpLoading ? "opacity-50" : ""}`}
              >
                {/* Category Header with Score */}
                <div className="mb-6 relative">
                  {/* Category Score Badge */}
                  <div className="flex justify-center mb-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-md ${getCategoryScoreColor(result.score)}`}>
                      <Target className="w-5 h-5" />
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-bold">
                          Độ phù hợp: {formatScore(result.score)}%
                        </span>
                        <span className="text-xs font-medium">
                          {getMatchLevel(result.score)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl text-center font-bold text-gray-900 mb-2">
                    {result.job_category}
                  </h2>
                  <p className="text-gray-600 text-center sm:text-lg">
                    {result.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 text-center sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {result.job_types.map(
                    (jobType: JobType, jobIndex: number) => {
                      const bgColor =
                        linearColors[
                        (resultIndex * 3 + jobIndex) % linearColors.length
                        ];

                      return (
                        <div
                          key={jobType.id}
                          onClick={() =>
                            !cpLoading && handleJobTypeClick(jobType)
                          }
                          className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform ${cpLoading
                            ? "cursor-not-allowed"
                            : "cursor-pointer hover:scale-none hover:shadow-lg"
                            } ${bgColor} flex flex-col`}
                          style={{ minHeight: "16rem" }}
                        >
                          {/* Overlay hover */}
                          <div className="absolute inset-0 bg-linear-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Job Type Score Badge */}
                          <div className="absolute top-0 right-0 z-20">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 shadow-md ${getScoreColor(jobType.score)} transition-all group-hover:scale-none`}>
                              <TrendingUp className="w-3.5 h-3.5" />
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-xs font-bold">
                                  {formatScore(jobType.score)}%
                                </span>
                                <span className="text-[10px] font-medium opacity-90">
                                  phù hợp
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Nội dung card - cấu trúc cố định */}
                          <div className="relative z-10 flex flex-col h-full pt-8">
                            {/* Title - cố định ở trên */}
                            <h3 className="font-bold text-lg text-gray-900 mb-3 min-h-14 flex items-center justify-center">
                              {jobType.job_type}
                            </h3>

                            {/* Description - chiếm không gian giữa */}
                            <p className="text-gray-700 text-sm leading-relaxed mb-4 grow line-clamp-4">
                              {jobType.description}
                            </p>

                            {/* Button - cố định ở dưới */}
                            <div className="mt-auto pt-4 border-t border-gray-300/50">
                              <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold group-hover:gap-3 transition-all">
                                <span>Tạo lộ trình ngay</span>
                                <span className="inline-block group-hover:translate-x-1 transition-transform">
                                  →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-7xl mx-auto my-6 border-t-3 border-gray-300"></div>

        <div className="max-w-5xl mx-auto pt-10 pb-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Tips học tập */}
            <div className="bg-white rounded-xl border-2 shadow-sm p-6 border-l-10 border-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Tips Học Tập
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>
                    Bắt đầu với các khóa học cơ bản để xây dựng nền tảng vững
                    chắc
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Thực hành thường xuyên qua các dự án thực tế</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Tham gia cộng đồng để học hỏi từ những người khác</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Đặt mục tiêu rõ ràng và theo dõi tiến độ của bạn</span>
                </li>
              </ul>
            </div>

            {/* Tính cách nói lên điều gì */}
            <div className="bg-white rounded-xl border-2 shadow-sm p-6 border-l-10 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Tính Cách Bạn Nói Lên Điều Gì
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Bạn có khả năng phân tích và giải quyết vấn đề tốt
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Bạn có sự kiên trì và quyết tâm trong công việc</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Bạn có khả năng học hỏi nhanh chóng</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Bạn có tư duy sáng tạo và linh hoạt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex flex-col sm:flex-row gap-4 py-10 justify-center">
          <Button
            onClick={handleExploreJobs}
            size="lg"
            variant={"emerald"}
            className="rounded-2xl"
            disabled={cpLoading}
          >
            <Briefcase className="w-5 h-5 mr-2" />
            Khám Phá Việc Làm
          </Button>

          <Button
            onClick={handleRetakeQuiz}
            size="lg"
            variant="default"
            className="rounded-2xl"
            disabled={cpLoading}
          >
            <Zap className="w-5 h-5 mr-2" />
            Làm Lại Bài Quiz
          </Button>
        </div>
      </div>

      <Dialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Rời khỏi trang?
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Bạn chưa chọn lộ trình nghề nghiệp. Nếu thoát, dữ liệu câu trả lời
            sẽ bị <b>xóa toàn bộ</b>. Bạn có chắc chắn muốn thoát không?
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmExit(false)}>
              Ở lại
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmAndReset}
            >
              Thoát & Xóa dữ liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
