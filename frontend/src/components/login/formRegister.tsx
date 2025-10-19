import { useState, useEffect } from "react";
// no direct navigation hooks required for blocking; we'll rely on beforeunload + popstate listeners
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import GoogleButton from "../ui/googleButton";
// Verify via email link; no OTP input screen
import { useAuthStore } from "../../store/auth";
import { Eye, EyeOff, Mail } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "react-router";

export default function FormRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "sent">("register");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Cooldown config (3 minutes)
  const VERIFY_COOLDOWN_MS = 3 * 60 * 1000; // 180000 ms
  const VERIFY_COOLDOWN_SECONDS = 180; // 3 * 60
  const ACTIVE_VERIFY_KEY = "verifyEmailActive";

  const {
    registerValidate: doRegisterValidate,
    sendRegisterEmail: doSendRegisterEmail,
    error: storeError,
  } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError("Mật khẩu phải có cả chữ và số");
      return;
    }
    if (password !== confirmPassword) {
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Step 1: Check if account exists with username/email/password
      await doRegisterValidate(username, email, password);

      // Step 2: If validation passes, immediately send verification email
      await doSendRegisterEmail();

      // Set initial cooldown when email is sent
      const cooldownEnd = Date.now() + VERIFY_COOLDOWN_MS; // 3 minutes
      localStorage.setItem(
        `verifyEmailCooldown_${email}`,
        cooldownEnd.toString()
      );
      localStorage.setItem(
        ACTIVE_VERIFY_KEY,
        JSON.stringify({ email, cooldownEnd })
      );
      setStep("sent");
    } catch (error) {
      console.error("Registration failed:", error);

      // Wait a bit for store to update, then get the error
      setTimeout(() => {
        const currentStoreError = storeError;

        if (currentStoreError) {
          setError(currentStoreError);
        } else {
          // Fallback error message
          setError("Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.");
        }
      }, 200);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cooldown on sent step
  useEffect(() => {
    if (step === "sent" && email) {
      const cooldownKey = `verifyEmailCooldown_${email}`;
      const cooldownEnd = localStorage.getItem(cooldownKey);

      if (cooldownEnd) {
        const remaining = Math.max(0, parseInt(cooldownEnd) - Date.now());
        if (remaining > 0) {
          setRemainingSeconds(Math.ceil(remaining / 1000));
          setCanResend(false);
        } else {
          setRemainingSeconds(0);
          setCanResend(true);
          localStorage.removeItem(cooldownKey);
        }
      } else {
        setCanResend(true);
        setRemainingSeconds(0);
      }
    }
  }, [step, email]);

  // Restore existing verification process on mount (user reload)
  useEffect(() => {
    if (step === "register") {
      try {
        const raw = localStorage.getItem(ACTIVE_VERIFY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            email: string;
            cooldownEnd: number;
          };
          const remaining = parsed.cooldownEnd - Date.now();
          if (remaining > 0) {
            if (!email) setEmail(parsed.email);
            setStep("sent");
            setRemainingSeconds(Math.ceil(remaining / 1000));
            setCanResend(false);
          } else {
            // expired -> cleanup
            localStorage.removeItem(ACTIVE_VERIFY_KEY);
            localStorage.removeItem(`verifyEmailCooldown_${parsed.email}`);
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (email) {
              localStorage.removeItem(`verifyEmailCooldown_${email}`);
              // keep ACTIVE_VERIFY_KEY so we still know we are in 'sent' state until success link clicked or user resets
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingSeconds, email]);

  // Block navigation when waiting for email verification
  useEffect(() => {
    if (step !== "sent") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const confirmNav = () => {
      const answer = window.confirm(
        "Tiến trình xác minh email sẽ bị mất nếu rời trang. Bạn có chắc muốn rời?"
      );
      if (!answer) {
        // push user back to current page
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", confirmNav);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", confirmNav);
    };
  }, [step]);

  const handleResend = async () => {
    if (!canResend || !email) return;

    setError("");
    setIsLoading(true);
    try {
      await doSendRegisterEmail();
      // Set new cooldown
      const cooldownEnd = Date.now() + VERIFY_COOLDOWN_MS;
      localStorage.setItem(
        `verifyEmailCooldown_${email}`,
        cooldownEnd.toString()
      );
      localStorage.setItem(
        ACTIVE_VERIFY_KEY,
        JSON.stringify({ email, cooldownEnd })
      );
      setRemainingSeconds(VERIFY_COOLDOWN_SECONDS); // 3 minutes in seconds
      setCanResend(false);
    } catch {
      setError(storeError || "Gửi lại email thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (step === "sent") {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">
              BRIPATH
            </h1>
            <div className="space-y-4 mt-16 animate-slide-up-delay">
              <h2 className="text-5xl font-light leading-tight">
                Kiểm tra hộp thư
                <br />
                <span className="text-purple-200">Nhấp vào liên kết</span>
                <br />
                <span className="text-purple-200">để xác minh</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <DotLottieReact
                    src="../../../public/animations/GkVe3BEgZD.json"
                    autoplay
                    loop={true} // Loop the animation
                    style={{ width: 130, height: 130 }}
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Email xác minh đã được gửi
                </h2>
                <p className="text-gray-600 text-sm">
                  Hãy mở email của bạn và nhấp vào liên kết xác thực. Sau khi
                  xác thực, hệ thống sẽ tự chuyển bạn về trang chủ.
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Button
                  variant={"default"}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-center font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <a
                    href="https://mail.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="size-4 text-white" />
                      <span className="text-white">Mở Gmail</span>
                    </div>
                  </a>
                </Button>

                <Button
                  onClick={handleResend}
                  disabled={!canResend || isLoading}
                  variant={"default"}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
                    canResend && !isLoading
                      ? "bg-gray-600 hover:bg-gray-700 text-white hover:scale-[1.02] hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi...</span>
                    </div>
                  ) : canResend ? (
                    "Gửi lại email"
                  ) : (
                    `Gửi lại sau ${formatTime(remainingSeconds)}`
                  )}
                </Button>
              </div>

              <Link
                to="/login"
                className="mt-4 block text-center text-purple-600 font-medium transition-transform duration-200 hover:scale-105"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Tham gia cùng chúng tôi!
              <br />
              <span className="text-emerald-200">Tạo tài khoản của bạn</span>
              <br />
              <span className="text-emerald-200">và bắt đầu khám phá</span>
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4 animate-bounce-subtle">
                ✨
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Tạo tài khoản của bạn
              </h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Tên tài khoản
                </label>
                <Input
                  type="text"
                  placeholder="Nhập tên tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Địa chỉ Email
                </label>
                <Input
                  type="email"
                  placeholder="ví dụ: example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu (chứa chữ và số)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md pr-10"
                    required
                  />
                  <button
                    tabIndex={-1}
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    title="Mật khẩu phải có cả chữ và số"
                    autoComplete="new-password"
                    className={`h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${
                      confirmPassword &&
                      password &&
                      confirmPassword !== password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    tabIndex={-1}
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1">
                  <li
                    className={`${
                      /^(?=.*\d).{8,}$/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    • Chứa ít nhất 1 kí tự số
                  </li>
                  <li
                    className={`${
                      password && password.length >= 8
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    • Ít nhất 8 ký tự
                  </li>
                  <li
                    className={`${
                      password &&
                      confirmPassword &&
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    • Mật khẩu phải khớp nhau
                  </li>
                </ul>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  "Tiếp theo"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <GoogleButton />

              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <a
                  href="/login"
                  tabIndex={-1}
                  className="text-emerald-600 hover:underline font-medium transition-colors"
                >
                  Đăng nhập
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
