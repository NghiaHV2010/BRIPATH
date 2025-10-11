import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../store/quiz.store";
import { createCPAPI } from "../../api/quiz_api";
import type { SuitableJobCategory } from "../../api/quiz_api";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Trophy, RotateCcw, Briefcase, TrendingUp } from "lucide-react";

export default function QuizResultsPage() {
  const navigate = useNavigate();

  const { results, isLoading, error, resetQuiz } = useQuizStore();

  // Handle job category click - call createCPAPI for career path
  const handleJobCategoryClick = async (jobCategory: SuitableJobCategory) => {
    try {
      // TODO: Get proper user ID from auth
      const userId = 1; // Replace with actual user ID
      const jobSpecialized = jobCategory.job_category; // Use job category name

      const careerPathData = await createCPAPI(userId, jobSpecialized);

      // Navigate to career path details page or show modal with career path data
      console.log("Career path data:", careerPathData);
      // TODO: Navigate to career path page or show details
    } catch (err) {
      console.error("Error creating career path:", err);
    }
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    navigate("/quiz");
  };

  const handleExploreJobs = () => {
    navigate("/jobs");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tính toán kết quả...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Không có kết quả</p>
            <Button onClick={() => navigate("/quiz")}>Làm lại quiz</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Sort results by score (descending)
  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const topResult = sortedResults[0];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Kết Quả Định Hướng Nghề Nghiệp
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dựa trên câu trả lời của bạn, đây là những lĩnh vực nghề nghiệp
              phù hợp nhất
            </p>
          </div>

          {/* Top Result Highlight */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Lĩnh vực phù hợp nhất</h2>
                <p className="text-blue-100">
                  Độ phù hợp: {Math.round(topResult.score * 100)}%
                </p>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-3">
              {topResult.job_category}
            </h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              {topResult.description}
            </p>
          </div>

          {/* All Results */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tất cả kết quả phân tích
            </h2>
            <div className="grid gap-6">
              {sortedResults.map((result, index) => {
                const scorePercentage = Math.round(result.score * 100);
                const isTop = index === 0;

                return (
                  <div
                    key={result.id}
                    onClick={() => handleJobCategoryClick(result)}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 cursor-pointer ${
                      isTop
                        ? "border-blue-200 shadow-lg hover:shadow-xl"
                        : "border-gray-100 hover:border-blue-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                            ${
                              isTop
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                          >
                            #{index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900">
                            {result.job_category}
                          </h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {result.description}
                        </p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Độ phù hợp
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            isTop ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          {scorePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            isTop
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                          }`}
                          style={{ width: `${scorePercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Click indicator */}
                    <div className="text-center mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-blue-600 font-medium">
                        👆 Click để xem lộ trình nghề nghiệp chi tiết
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleExploreJobs}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              Khám Phá Việc Làm
            </Button>

            <Button
              onClick={handleRetakeQuiz}
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Làm Lại Quiz
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Gợi ý tiếp theo
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dựa trên kết quả này, bạn có thể tìm hiểu thêm về các vị trí
                công việc, khóa học và cơ hội phát triển trong lĩnh vực{" "}
                <strong>{topResult.job_category}</strong>. Hãy khám phá các công
                việc phù hợp trên nền tảng của chúng tôi!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
