import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import UserCareerPath from "./UserCareerPath";
import {
  fetchQuestions,
  resetAnswer,
  getUserCareerPath,
} from "../../api/quiz_api";
import type { QuizQuestion } from "../../api/quiz_api";
import { Layout } from "../../components/layout";
import { LoginDialog } from "../../components/login/LoginDialog";
import { useAuthStore } from "../../store/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

export default function QuizLandingPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCareerPath, setHasCareerPath] = useState(false);

  // 🔹 Load câu hỏi và career path song song
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [questionData, careerResp] = await Promise.all([
          fetchQuestions(),
          getUserCareerPath(),
        ]);

        if (mounted) {
          setQuestions(questionData);
          const careerPaths = careerResp?.data ?? careerResp ?? [];
          setHasCareerPath(
            Array.isArray(careerPaths) && careerPaths.length > 0
          );
        }
      } catch (e: unknown) {
        let message = "Không tải được dữ liệu.";
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

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartQuiz = () => {
    setStarting(true);
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      // open login dialog and redirect to quiz/test after login
      setLoginOpen(true);
      return;
    }

    if (hasCareerPath) {
      // open confirm dialog for repeat flow
      setShowRepeatDialog(true);
      return;
    }

    // no existing career path, proceed directly
    navigate("/quiz/test");
  };

  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Reset starting if login dialog closes (user cancelled or clicked outside)
  useEffect(() => {
    if (!loginOpen) setStarting(false);
  }, [loginOpen]);

  const handleDialogOpenChange = (open: boolean) => {
    setShowRepeatDialog(open);
    if (!open) {
      // if the dialog is closed (cancelled or clicked outside), reset starting
      setStarting(false);
    }
  };

  const handleConfirmRepeat = () => {
    setShowRepeatDialog(false);
    // fire-and-forget: we don't want to block navigation on resetAnswer
    // run in background and ignore errors
    resetAnswer().catch(() => {});
    navigate("/quiz/test");
  };

  // Ensure starting flag is reset whenever the dialog is closed
  useEffect(() => {
    if (!showRepeatDialog) setStarting(false);
  }, [showRepeatDialog]);

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full text-center">
            {/* Hero */}
            {!hasCareerPath && (
              <>
                <div className="mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-10">
                    Khám Phá Định Hướng Nghề Nghiệp
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                    Trả lời các câu hỏi để khám phá những lĩnh vực nghề nghiệp
                    phù hợp với bạn nhất.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">⏱️</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Thời gian linh hoạt
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Không giới hạn thời gian, bạn có thể trả lời thoải mái.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">❓</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Bộ câu hỏi đa dạng
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Câu hỏi được thiết kế để hiểu rõ sở thích của bạn.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Kết quả chi tiết
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Nhận được phân tích và gợi ý nghề nghiệp phù hợp.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* UserCareerPath chỉ hiện nếu có */}

            {hasCareerPath && (
              <>
                <div className="mb-12 relative min-h-[100px]">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-10">
                    Danh sách lộ trình nghề nghiệp bạn đã tạo
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                    Xem lại các lộ trình nghề nghiệp bạn đã tạo hoặc khám phá
                    thêm
                  </p>
                </div>
                <UserCareerPath />
              </>
            )}

            {/* Button */}
            <div className="space-y-4 mt-8">
              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Đang tải...</span>
                </div>
              )}

              <Button
                onClick={handleStartQuiz}
                disabled={starting}
                size="lg"
                variant={"emerald"}
                className="rounded-3xl"
              >
                {starting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Đang khởi tạo...
                  </>
                ) : hasCareerPath ? (
                  "Khám phá thêm 🚀"
                ) : (
                  "Bắt đầu khám phá 🚀"
                )}
              </Button>
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                💡 Gợi ý: Hãy trả lời một cách chân thật để có kết quả chính xác
                nhất.
              </p>
            </div>
          </div>
        </div>
        {/* Repeat dialog using shadcn Dialog */}
        <Dialog open={showRepeatDialog} onOpenChange={handleDialogOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đừng bỏ lỡ cơ hội!</DialogTitle>
              <DialogDescription>
                Khám phá bản thân - Khơi nguồn tiềm năng nghề nghiệp phù hợp với
                bạn
              </DialogDescription>
            </DialogHeader>

            <div className="text-sm text-gray-700 my-4">
              <p className="font-medium">Hướng dẫn:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Chọn nhanh các đáp án phù hợp nhất với bạn.</li>
                <li>Bộ câu hỏi gồm 10 câu, không giới hạn thời gian.</li>
              </ul>
            </div>

            <DialogFooter>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRepeatDialog(false);
                    setStarting(false);
                  }}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Hủy
                </button>
                <Button onClick={handleConfirmRepeat} className="px-5 py-2">
                  OK
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo="/quiz/test"
      />
    </>
  );
}
