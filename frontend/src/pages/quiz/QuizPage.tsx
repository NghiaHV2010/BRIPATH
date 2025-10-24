import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../store/quiz.store";
import { answerQuiz } from "../../api/quiz_api";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { ChevronRight, Check, AlertCircle } from "lucide-react";

export default function QuizPage() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Removed answeredQuestions state (sidebar deleted)

  const {
    questions,
    currentQuestionIndex,
    isLoading,
    isLoadingAnswers,
    isSubmitting,
    isSavingAnswer,
    error,
    loadQuestions,
    loadAnswersForQuestion,
    selectAnswer,
    nextQuestion,
    submitQuizAndGetResults,
    getCurrentQuestion,
    getCurrentAnswers,
    getSelectedAnswersForCurrent,
    getProgress,
    canGoNext,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentAnswers = getCurrentAnswers();
  const selectedAnswers = getSelectedAnswersForCurrent();
  const progress = getProgress();
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  useEffect(() => {
    if (questions.length === 0) {
      loadQuestions();
    }
  }, [questions.length, loadQuestions]);

  useEffect(() => {
    if (currentQuestion) {
      setIsTransitioning(true);
      loadAnswersForQuestion(currentQuestion.id);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, loadAnswersForQuestion]);

  // Removed useEffect for answeredQuestions (sidebar deleted)

  const handleAnswerSelect = (answerId: number) => {
    if (!currentQuestion) return;
    selectAnswer(currentQuestion.id, answerId);
  };

  const handleNext = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await nextQuestion();
  };

  const handleSubmit = async () => {
    if (currentQuestion) {
      const currentAnswers = selectedAnswers || [];
      if (currentAnswers.length > 0) {
        try {
          await answerQuiz(currentQuestion.id, currentAnswers);
        } catch (error) {
          console.error("Error saving final answer:", error);
        }
      }
    }

    // 👉 Bắt đầu loading 3 giây (hiệu ứng “tạo kết quả định hướng”)
    setIsGeneratingResult(true);

    // Giả lập hệ thống đang xử lý
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      await submitQuizAndGetResults();
      navigate("/quiz/results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const isLastQuestion = !canGoNext();
  const hasSelectedAnswers = selectedAnswers.length > 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-700 font-medium">Đang tải câu hỏi...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-200 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-700 mb-6 text-lg">{error}</p>
            <Button
              onClick={() => navigate("/quiz")}
              variant="outline"
              className="min-w-[120px]"
            >
              Quay lại
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentQuestion) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy câu hỏi</p>
            <Button onClick={() => navigate("/quiz")}>Quay lại</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-blue-200 py-8 md:py-12">
        <div className="max-w-350 mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tiến độ</p>
                <p className="text-2xl font-bold text-gray-900">
                  Câu {currentQuestionIndex + 1}
                  <span className="text-gray-400 font-normal">
                    {" "}
                    / {questions.length}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Hoàn thành</p>
                <p className="text-2xl font-bold text-blue-600 bg-clip-text">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>

            {/* Progress Bar - just colored bar, no wrapper */}
            <div className="relative w-full h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/30"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-6">
            <div className="flex-1">
              {/* Question Card with Animation */}
              <div
                className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 mb-8 transition-all duration-300 ${
                  isTransitioning
                    ? "opacity-50 scale-98"
                    : "opacity-100 scale-100"
                }`}
              >
                {/* Question Number Badge */}
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-white to-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    {currentQuestionIndex + 1}
                  </span>
                  Câu hỏi
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Loading Answers */}
                {isLoadingAnswers && (
                  <div className="text-center py-12">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-600">Đang tải đáp án...</p>
                  </div>
                )}

                {!isLoadingAnswers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentAnswers.map((answer, index) => {
                      const isSelected = selectedAnswers.includes(answer.id);
                      return (
                        <button
                          key={answer.id}
                          onClick={() => handleAnswerSelect(answer.id)}
                          className={`group text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                            isSelected
                              ? "border-blue-500 bg-linear-to-r from-white to-blue-100 shadow-lg shadow-blue-100"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md"
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Answer Letter Badge */}
                            <div
                              className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-300 ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-700"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>

                            <span
                              className={`flex-1 text-base transition-colors duration-300 ${
                                isSelected
                                  ? "text-blue-900 font-medium"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {answer.answer}
                            </span>

                            {/* Check Icon */}
                            <div
                              className={`shrink-0 transition-all duration-300 ${
                                isSelected
                                  ? "scale-100 opacity-100"
                                  : "scale-0 opacity-0"
                              }`}
                            >
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selection Info */}
                <div className="pt-6 border-t border-blue-100">
                  {/* Hàng chính: bên trái là info, bên phải là button */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Bên trái: selection info */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3].map((num) => (
                          <div
                            key={num}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                              selectedAnswers.length >= num
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-400"
                            }`}
                          >
                            {selectedAnswers.length >= num ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              num
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-sm text-blue-600 ml-2">
                        {selectedAnswers.length === 0 ? (
                          <span className="text-blue-500 font-medium">
                            Vui lòng chọn ít nhất 1 đáp án
                          </span>
                        ) : (
                          <span className="text-blue-700">
                            Đã chọn{" "}
                            <span className="font-semibold text-blue-600">
                              {selectedAnswers.length}
                            </span>{" "}
                            đáp án
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      {isLastQuestion ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!hasSelectedAnswers || isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2 px-6 h-10 rounded-xl disabled:opacity-50 text-white"
                        >
                          {isGeneratingResult ? (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="relative w-5 h-5">
                                  <div className="absolute w-full h-full rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                  <div className="absolute inset-1 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                                </div>
                                <span className="hidden sm:inline animate-pulse">
                                  Đang tạo kết quả định hướng...
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Nộp bài</span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={!hasSelectedAnswers || isSavingAnswer}
                          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2 px-6 h-10 rounded-xl disabled:opacity-50 text-white"
                        >
                          {isSavingAnswer ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">
                                Đang lưu...
                              </span>
                            </>
                          ) : (
                            <>
                              <span>Tiếp theo</span>
                              <ChevronRight className="w-5 h-5" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
