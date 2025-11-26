import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import UserCareerPath from "./UserCareerPath";
import {
  fetchQuestions,
  resetAnswer,
  getUserCareerPath,
} from "../../api/quiz_api";
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
  const [starting, setStarting] = useState(false);
  const [hasCareerPath, setHasCareerPath] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const careerResp = await getUserCareerPath();

        if (mounted) {
          const careerPaths = careerResp?.data ?? careerResp ?? [];
          setHasCareerPath(
            Array.isArray(careerPaths) && careerPaths.length > 0
          );
        }
      } catch (e: unknown) {
        console.error("Failed to load quiz data", e);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartQuiz = async () => {
    const delay = new Promise((resolve) => setTimeout(resolve, 500));
    setStarting(true);
    const authUser = useAuthStore.getState().authUser;
    await delay;
    if (!authUser) {
      setLoginOpen(true);
      setStarting(false);
      return;
    }
    setShowRepeatDialog(true);
  };

  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!loginOpen) setStarting(false);
  }, [loginOpen]);

  const handleDialogOpenChange = (open: boolean) => {
    setShowRepeatDialog(open);
    if (!open) {
      setStarting(false);
    }
  };
  const handleConfirmRepeat = async () => {
    setShowRepeatDialog(false);
    setStarting(true);
    const delay = new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await Promise.all([
        resetAnswer().catch(() => { }),
        fetchQuestions(),
        delay, // đảm bảo tối thiểu 500ms loading
      ]);
      navigate("/quiz/test");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!showRepeatDialog) setStarting(false);
  }, [showRepeatDialog]);

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="max-w-full w-full text-center">
            {/* Hero */}
            {!hasCareerPath && (
              <>
                <div className="mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-15">
                    Khám Phá Định Hướng Nghề Nghiệp
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                    Trả lời các câu hỏi để khám phá những lĩnh vực nghề nghiệp
                    phù hợp với bạn nhất.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
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

            {hasCareerPath && (
              <>
                <div className="mb-12 relative min-h-[200px] overflow-hidden">
                  <div className="relative z-10 text-center mt-15">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                      Danh sách lộ trình nghề nghiệp bạn đã tạo
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                      Xem lại các lộ trình nghề nghiệp bạn đã tạo hoặc khám phá
                      thêm
                    </p>
                  </div>
                </div>

                <UserCareerPath />
              </>
            )}

            {/* Button */}
            <div className="space-y-4 mb-20">
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

            <div className="min-h-screen bg-transparent flex flex-col items-center p-0 w-full max-w-none">
              <div className="w-full py-20 bg-linear-to-b from-white via-emerald-50 to-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Hướng dẫn khám phá lộ trình nghề nghiệp
                  </h2>
                  <h4 className="text-lg text-emerald-600 font-medium mb-12">
                    để có kết quả chính xác nhất 💡
                  </h4>

                  <div className="grid gap-10 md:gap-14">
                    {[
                      {
                        icon: "🧘",
                        title: "Giữ tâm trạng thoải mái",
                        desc: "Hãy trả lời các câu hỏi một cách tự nhiên và chân thật. Không cần suy nghĩ quá nhiều, chỉ cần chọn đáp án phù hợp nhất với bạn.",
                      },
                      {
                        icon: "⚖️",
                        title: "Trung thực khi trả lời câu hỏi",
                        desc: "Hãy phản ánh những gì bạn thực sự cảm thấy, không phải những gì bạn nghĩ rằng nên trả lời. Kết quả sẽ chính xác hơn khi bạn trung thực.",
                      },
                      {
                        icon: "📅",
                        title: "Kiểm tra lại định kỳ",
                        desc: "Tính cách có thể thay đổi theo thời gian. Hãy làm lại bài trắc nghiệm sau vài tháng để xem kết quả có thay đổi không.",
                      },
                    ].map((guide, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="text-5xl shrink-0">
                          {guide.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                            {guide.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {guide.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                <li>Chọn các đáp án phù hợp nhất với bạn.</li>
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
                <Button
                  onClick={handleConfirmRepeat}
                  variant={"emerald"}
                  className="px-5 py-2"
                >
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
