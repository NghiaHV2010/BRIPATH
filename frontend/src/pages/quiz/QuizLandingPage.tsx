import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export default function QuizLandingPage() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [hasCareerPath, setHasCareerPath] = useState(false);
  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isButtonStatic, setIsButtonStatic] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const featureMarksRef = useRef<(HTMLDivElement | null)[]>([]);
  const featureBubblesRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const staticButtonRef = useRef<HTMLDivElement>(null);
  const guideSectionRef = useRef<HTMLDivElement>(null);
  const guideItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

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

  // GSAP Animations
  useEffect(() => {
    // Hero section animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }

    // Animated path drawing with ScrollTrigger
    if (pathRef.current && featuresRef.current) {
      // Animate path on scroll
      gsap.fromTo(
        pathRef.current,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        }
      );

      // Individual ScrollTriggers for each mark and bubble at center of viewport
      featureMarksRef.current.forEach((mark) => {
        if (mark) {
          ScrollTrigger.create({
            trigger: mark,
            start: "center center",
            onEnter: () => {
              gsap.to(mark, {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
              });
            },
          });
        }
      });

      featureBubblesRef.current.forEach((bubble) => {
        if (bubble) {
          ScrollTrigger.create({
            trigger: bubble,
            start: "center center",
            onEnter: () => {
              gsap.fromTo(
                bubble,
                { opacity: 0, scale: 0.8, y: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "back.out(1.7)",
                }
              );
            },
          });
        }
      });

      // ScrollTrigger for button fixed/static behavior
      if (buttonContainerRef.current) {
        ScrollTrigger.create({
          trigger: buttonContainerRef.current,
          start: "top bottom",
          end: "top bottom",
          onEnter: () => setIsButtonStatic(true),
          onLeaveBack: () => setIsButtonStatic(false),
        });
      }
    }

    // Guide section animation
    if (guideSectionRef.current) {
      const guideItems = guideItemsRef.current.filter((item) => item !== null);
      gsap.fromTo(
        guideItems,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: guideSectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, [hasCareerPath]);

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
        delay,
      ]);
      navigate("/quiz/test");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!showRepeatDialog) setStarting(false);
  }, [showRepeatDialog]);

  const features = [
    {
      title: "Thời gian linh hoạt",
      desc: "Không giới hạn thời gian, bạn có thể trả lời thoải mái và suy nghĩ kỹ càng.",
    },
    {
      title: "Bộ câu hỏi đa dạng",
      desc: "Câu hỏi được thiết kế khoa học để hiểu rõ sở thích và tính cách của bạn.",
    },
    {
      title: "Kết quả chi tiết",
      desc: "Nhận được phân tích chuyên sâu và gợi ý nghề nghiệp phù hợp nhất.",
    },
  ];

  const guides = [
    {
      image: "/assets/images/element_icon_4.png",
      title: "Giữ tâm trạng thoải mái",
      desc: "Hãy trả lời các câu hỏi một cách tự nhiên và chân thật. Không cần suy nghĩ quá nhiều, chỉ cần chọn đáp án phù hợp nhất với bạn.",
    },
    {
      image: "/assets/images/element_icon_5.png",
      title: "Trung thực khi trả lời câu hỏi",
      desc: "Hãy phản ánh những gì bạn thực sự cảm thấy, không phải những gì bạn nghĩ rằng nên trả lời. Kết quả sẽ chính xác hơn khi bạn trung thực.",
    },
    {
      image: "/assets/images/element_icon_6.png",
      title: "Kiểm tra lại định kỳ",
      desc: "Tính cách có thể thay đổi theo thời gian. Hãy làm lại bài trắc nghiệm sau vài tháng để xem kết quả có thay đổi không.",
    },
  ];

  const ButtonComponent = (
    <Button
      onClick={handleStartQuiz}
      disabled={starting}
      size="lg"
      className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 md:px-12 py-4 md:py-6 rounded-full text-base md:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
    >
      {starting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
          <span className="text-sm md:text-base">Đang khởi tạo...</span>
        </>
      ) : (
        <>
          <span className="text-sm md:text-base">Bắt đầu khám phá</span>
        </>
      )}
    </Button>
  );

  return (
    <>
      <Layout>
        <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-blue-50 relative overflow-hidden pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            {!hasCareerPath && (
              <>
                <div ref={heroRef} className="pt-20 pb-16 text-center">
                  <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold text-sm">
                      🎯 Khám phá tiềm năng của bạn
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                    Định Hướng
                    <span className="text-blue-600"> Nghề Nghiệp</span>
                    <br />
                    Cho Tương Lai
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Trả lời các câu hỏi thú vị để khám phá những lĩnh vực nghề
                    nghiệp phù hợp với tính cách và sở thích của bạn.
                  </p>
                </div>

                {/* Features Path Section */}
                <div
                  ref={featuresRef}
                  className="relative max-w-2xl mx-auto py-16 mb-16 min-h-[1400px] md:min-h-[1600px]"
                >
                  {/* SVG Path - Vertical center line */}
                  <svg
                    className="absolute left-1/2 -translate-x-1/2 top-0 h-full pointer-events-none"
                    width="200"
                    height="100%"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="pathGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#2563eb" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path
                      ref={pathRef}
                      d="M 100 50 Q 50 250, 100 450 Q 150 650, 100 850 Q 50 1050, 100 1250 L 100 1500"
                      stroke="url(#pathGradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="8 8"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
                      }}
                    />
                  </svg>

                  {/* Feature Milestones */}
                  <div className="relative z-10 space-y-64 md:space-y-80 pt-16">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-center justify-center"
                      >
                        {/* Milestone marker on path - hidden on mobile, shown on desktop */}
                        <div
                          ref={(el) => {
                            featureMarksRef.current[idx] = el;
                          }}
                          className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full border-3 md:border-4 border-white shadow-xl items-center justify-center z-20 opacity-0 scale-0"
                        >
                          <span className="text-white font-bold text-base md:text-lg">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Feature bubble */}
                        <div
                          ref={(el) => {
                            featureBubblesRef.current[idx] = el;
                          }}
                          className={`absolute ${idx % 2 === 0
                            ? "left-0 md:left-auto md:right-1/2 md:mr-20"
                            : "right-0 md:right-auto md:left-1/2 md:ml-20"
                            } w-full px-2 md:px-0 max-w-[280px] sm:max-w-sm group opacity-0`}
                        >
                          <div className="relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400">
                            {/* Index badge at top left corner - mobile only */}
                            <div className="md:hidden absolute -top-3 -left-3 w-10 h-10 bg-blue-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center z-10">
                              <span className="text-white font-bold text-base">
                                {idx + 1}
                              </span>
                            </div>

                            {/* Connector line to milestone - desktop only */}
                            <div
                              className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-0.5 bg-linear-to-r ${idx % 2 === 0
                                ? "from-blue-500 to-transparent left-full ml-1"
                                : "from-transparent to-blue-500 right-full mr-1"
                                } w-16`}
                            />

                            {/* Content */}
                            <div className="flex items-start gap-3 md:gap-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1 md:mb-2">
                                  {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                                  {feature.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Static CTA Button at end of path */}
                  <div
                    ref={buttonContainerRef}
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 flex justify-center"
                  >
                    <div ref={staticButtonRef}>{ButtonComponent}</div>
                  </div>
                </div>
              </>
            )}

            {hasCareerPath && (
              <div ref={heroRef} className="pt-12 pb-16">
                <div className="text-center mb-8">
                  <h1 className="text-3xl! md:text-5xl! lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                    Lộ Trình Nghề Nghiệp
                    <br />
                    <span className="text-blue-600">Của Bạn</span>
                  </h1>
                  <p className="text-md md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    Xem lại các lộ trình nghề nghiệp bạn đã tạo hoặc khám phá
                    thêm nhiều cơ hội mới
                  </p>
                </div>

                <UserCareerPath />

                <div className="text-center mt-12">
                  <Button
                    onClick={handleStartQuiz}
                    disabled={starting}
                    size="lg"
                    className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 md:px-12 py-4 md:py-6 rounded-full text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {starting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                        <span className="text-sm md:text-base">Đang khởi tạo...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm md:text-base">Khám phá thêm</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Guide Section */}
            <div
              ref={guideSectionRef}
              className="py-12 md:py-20 bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl my-16 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-20"></div>

              <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                    Hướng Dẫn Tham Gia
                  </h2>
                  <p className="text-base md:text-lg text-blue-600 font-semibold">
                    để có kết quả chính xác nhất
                  </p>
                </div>

                <div className="space-y-6 md:space-y-8">
                  {guides.map((guide, idx) => (
                    <div
                      key={idx}
                      ref={(el) => {
                        guideItemsRef.current[idx] = el;
                      }}
                      className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 group"
                    >
                      <div className="shrink-0">
                        <img
                          src={guide.image}
                          alt={guide.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                          {guide.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          {guide.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed CTA Button at Bottom (hidden when static button is visible) */}
          {!isButtonStatic && (
            <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-transparent via-white to-transparent pb-4 md:pb-6 pt-6 md:pt-8 z-40 mb-22 lg:mb-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                <div ref={ctaButtonRef}>{ButtonComponent}</div>
              </div>
            </div>
          )}
        </div>

        {/* Repeat Dialog */}
        <Dialog open={showRepeatDialog} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">
                Đừng bỏ lỡ cơ hội!
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-600 mt-2">
                Khám phá bản thân - Khơi nguồn tiềm năng nghề nghiệp phù hợp
                với bạn
              </DialogDescription>
            </DialogHeader>

            <div className="bg-blue-50 rounded-lg p-4 my-4">
              <p className="font-semibold text-gray-900 mb-2">📝 Hướng dẫn:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Chọn các đáp án phù hợp nhất với bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Bộ câu hỏi gồm 10 câu, không giới hạn thời gian</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Trả lời trung thực để có kết quả chính xác nhất</span>
                </li>
              </ul>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowRepeatDialog(false);
                  setStarting(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmRepeat}
                className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Bắt đầu ngay
              </Button>
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
