import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../store/quiz.store";
import { answerQuiz } from "../../api/quiz_api";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function QuizPage() {
  const navigate = useNavigate();

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
    previousQuestion,
    submitQuizAndGetResults,
    getCurrentQuestion,
    getCurrentAnswers,
    getSelectedAnswersForCurrent,
    getProgress,
    canGoNext,
    canGoPrevious,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentAnswers = getCurrentAnswers();
  const selectedAnswers = getSelectedAnswersForCurrent();
  const progress = getProgress();

  // Load questions on mount
  useEffect(() => {
    if (questions.length === 0) {
      loadQuestions();
    }
  }, [questions.length, loadQuestions]);

  // Load answers for current question
  useEffect(() => {
    if (currentQuestion) {
      loadAnswersForQuestion(currentQuestion.id);
    }
  }, [currentQuestion, loadAnswersForQuestion]);

  const handleAnswerSelect = (answerId: number) => {
    if (!currentQuestion) return;
    selectAnswer(currentQuestion.id, answerId);
  };

  const handleNext = async () => {
    window.scrollTo(0, 0);
    await nextQuestion(); // Save current answer and move to next
  };

  const handlePrevious = () => {
    window.scrollTo(0, 0);
    previousQuestion();
  };

  const handleSubmit = async () => {
    // First save the current (last) question's answer
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

    // Submit quiz only - results will show job categories
    await submitQuizAndGetResults();
    navigate("/quiz/results");
  };

  const isLastQuestion = !canGoNext();
  const hasSelectedAnswers = selectedAnswers.length > 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải câu hỏi...</p>
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

  if (!currentQuestion) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy câu hỏi</p>
            <Button onClick={() => navigate("/quiz")} className="mt-4">
              Quay lại
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Loading Answers */}
            {isLoadingAnswers && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải đáp án...</p>
              </div>
            )}

            {/* Answer Options */}
            {!isLoadingAnswers && (
              <div className="space-y-4">
                {currentAnswers.map((answer) => {
                  const isSelected = selectedAnswers.includes(answer.id);
                  return (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswerSelect(answer.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{answer.answer}</span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selection Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Đã chọn {selectedAnswers.length}/3 đáp án
                {selectedAnswers.length === 0 && (
                  <span className="text-amber-600 ml-2">
                    (Vui lòng chọn ít nhất 1 đáp án)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </Button>

            <div className="flex gap-4">
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!hasSelectedAnswers || isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Nộp bài
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!hasSelectedAnswers || isSavingAnswer}
                  className="flex items-center gap-2"
                >
                  {isSavingAnswer ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Câu tiếp
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
