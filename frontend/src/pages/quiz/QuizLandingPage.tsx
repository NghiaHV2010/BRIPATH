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
import { CompanyCarousel } from "@/components/company";
import { useCompanyStore } from "../../store/company.store";

export default function QuizLandingPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCareerPath, setHasCareerPath] = useState(false);
  // company carousel data
  const { companies, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    // load companies for carousel (page 1)
    fetchCompanies(1).catch(() => {});
  }, [fetchCompanies]);

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
        <div className="min-h-screen bg-transparent  flex items-center justify-center  ">
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

            {/* UserCareerPath chỉ hiện nếu có */}

            {hasCareerPath && (
              <>
                <div className="mb-12 relative min-h-[200px] overflow-hidden ">
                  {/* Ảnh nền phía sau */}
                  <img
                    src="/animations/wave-haikei.svg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                  />
                  {/* Nội dung phía trên */}
                  <div className="relative z-10 text-center mt-15 ">
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

            <div className="min-h-screen bg-transparent flex flex-col items-center p-0 w-full max-w-none">
              {/* Section 1 */}
              <div className="w-full py-5 px-40 bg-gradient-to-b from-white via-emerald-100 to-white">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                  16 nhóm tính cách bạn nên biết
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-8 ">
                  {[
                    {
                      type: "ISTJ",
                      color: "from-red-400 to-red-600",
                      desc: "Người quản lý",
                    },
                    {
                      type: "ISFP",
                      color: "from-blue-400 to-blue-600",
                      desc: "Người sáng tạo",
                    },
                    {
                      type: "INFP",
                      color: "from-pink-400 to-pink-600",
                      desc: "Người mơ mộng",
                    },
                    {
                      type: "INTJ",
                      color: "from-purple-400 to-purple-600",
                      desc: "Nhà chiến lược",
                    },
                    {
                      type: "ISFJ",
                      color: "from-orange-400 to-orange-600",
                      desc: "Người chăm sóc",
                    },
                    {
                      type: "ISTP",
                      color: "from-amber-400 to-amber-600",
                      desc: "Nhà thợ",
                    },
                    {
                      type: "INFJ",
                      color: "from-yellow-400 to-yellow-600",
                      desc: "Người tư vấn",
                    },
                    {
                      type: "INTP",
                      color: "from-green-400 to-green-600",
                      desc: "Nhà tư tưởng",
                    },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <div
                        className={`bg-gradient-to-br ${item.color} h-32 rounded-lg mb-3 flex items-center justify-center`}
                      >
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold">{item.type}</div>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.type}
                      </p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="relative left-1/2 right-1/2 w-[95%] max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
                  {companies && companies.length > 0 && (
                    <CompanyCarousel
                      companies={companies.slice(0, 6)}
                      onCompanyClick={(companyId: string) => {
                        // mirror CompaniesPage behavior: save scroll/page then navigate
                        sessionStorage.setItem(
                          "companyScrollPosition",
                          window.scrollY.toString()
                        );
                        sessionStorage.setItem("companyPage", "1");
                        navigate(`/companies/${companyId}`);
                      }}
                      title="Công ty nổi bật"
                    />
                  )}
                </div>
              </div>
              {/* Section 2 */}
              <div className="w-full py-20 bg-gradient-to-b from-white via-emerald-50 to-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                  {/* Tiêu đề */}
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Hướng dẫn khám phá lộ trình nghề nghiệp
                  </h2>
                  <h4 className="text-lg text-emerald-600 font-medium mb-12">
                    để có kết quả chính xác nhất 💡
                  </h4>

                  {/* Danh sách hướng dẫn */}
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
                        <div className="text-5xl flex-shrink-0">
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

            {/* Button */}
            <div className="space-y-4 mb-20">
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
            {/* <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                💡 Gợi ý: Hãy trả lời một cách chân thật để có kết quả chính xác
                nhất.
              </p>
            </div> */}
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
