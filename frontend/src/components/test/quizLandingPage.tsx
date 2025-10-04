import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { fetchQuestions } from "../../api";
import type { QuizQuestion } from "../../api";

export default function QuizLandingPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchQuestions();
        if (mounted) setQuestions(data);
      } catch (e: unknown) {
        let message = "Không tải được câu hỏi";
        if (typeof e === "object" && e && "response" in e) {
          type ErrResp = { data?: { message?: string } };
          const resp = (e as { response?: ErrResp }).response;
          if (resp?.data?.message) message = resp.data.message;
        }
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const startQuiz = () => {
    navigate("/quiz/test", { state: { questions } });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Hero Content */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trắc nghiệm nghề nghiệp
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Khám phá con đường sự nghiệp phù hợp với bạn thông qua trắc nghiệm
            thông minh được hỗ trợ bởi AI.{" "}
            {loading && (
              <span className="text-sm text-blue-500">
                (Đang tải câu hỏi...)
              </span>
            )}
            {!loading && error && (
              <span className="text-sm text-red-500"> ({error})</span>
            )}
            {!loading && !error && questions && (
              <span className="text-sm text-green-600">
                {" "}
                (Có {questions.length} câu hỏi)
              </span>
            )}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div
            className="bg-white rounded-xl p-6 shadow-lg 
                transition-transform duration-300 ease-out 
                hover:scale-105 hover:shadow-2xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl">🧠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Thông minh
            </h3>
            <p className="text-gray-600 text-sm">
              Phân tích tính cách và sở thích để đưa ra gợi ý chính xác
            </p>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-lg 
                transition-transform duration-300 ease-out 
                hover:scale-105 hover:shadow-2xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nhanh chóng
            </h3>
            <p className="text-gray-600 text-sm">
              Chỉ 10 câu hỏi đơn giản, hoàn thành trong 5 phút
            </p>
          </div>
          <div
            className="bg-white rounded-xl p-6 shadow-lg 
                transition-transform duration-300 ease-out 
                hover:scale-105 hover:shadow-2xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cá nhân hóa
            </h3>
            <p className="text-gray-600 text-sm">
              Kết quả được tùy chỉnh riêng cho từng người dùng
            </p>
          </div>
        </div>
        {/* CTA Button */}
        <Button
          onClick={startQuiz}
          disabled={
            loading || !!error || (questions !== null && questions.length === 0)
          }
          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
             hover:from-blue-700 hover:to-indigo-700 
             text-white text-lg font-semibold rounded-xl 
             transform transition-transform duration-300 ease-out
             hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Đang tải..." : "🚀 Bắt đầu làm bài trắc nghiệm"}
        </Button>

        <p className="text-gray-500 text-sm mt-4">
          Hoàn toàn miễn phí • Cần đăng nhập để lưu kết quả
        </p>

        {/* Additional Info */}
        <div
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg 
                transform transition-transform duration-300 ease-out 
                hover:scale-105 hover:shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cách thức hoạt động
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Trả lời câu hỏi
                </h3>
                <p className="text-gray-600 text-sm">
                  Hoàn thành 10 câu hỏi về sở thích và tính cách của bạn
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  AI phân tích
                </h3>
                <p className="text-gray-600 text-sm">
                  Hệ thống AI phân tích và so khớp với cơ sở dữ liệu nghề nghiệp
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Nhận kết quả
                </h3>
                <p className="text-gray-600 text-sm">
                  Xem top 3 nghề nghiệp phù hợp nhất với bạn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
