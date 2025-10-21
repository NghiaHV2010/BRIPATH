import { useEffect, useState } from "react";
import ForgotPassword from "../../components/login/forgotPassword"; // Import component mới
import { Button } from "../../components/ui/button";
import { forgotPasswordApi, sendResetOtpApi } from "../../api/user_api"; // Giữ nguyên API imports
import EmailVerifyWaiting from "@/components/login/emailVerifyWaiting";

type Step = "forgot" | "readyToSend" | "waiting" | "success";

const RESEND_TIMEOUT = 60;

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  // Helper function: format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Step 1: submit email -> call forgotPasswordApi only
  const handleEmailSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    setLoading(true);
    try {
      await forgotPasswordApi(submittedEmail);
      setCurrentStep("readyToSend");
    } catch (err) {
      let message = "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!";
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") message = e.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: user clicks to send verification email (Initial send)
  const handleSendVerification = async () => {
    setLoading(true);
    try {
      // Ensure server has stored the email (re-save) before triggering send
      if (email) await forgotPasswordApi(email);
      await sendResetOtpApi();
      setCurrentStep("waiting");
      // Cập nhật state để kích hoạt timer và vô hiệu hóa nút
      setCanResend(false);
      setCountdown(RESEND_TIMEOUT);
    } catch (err) {
      let message = "Không thể gửi email xác thực. Vui lòng thử lại.";
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") message = e.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Resend logic (passed as prop to EmailVerifyWaiting)
  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      // Re-save email server-side (in case cookie expired) then trigger resend
      if (email) await forgotPasswordApi(email);
      await sendResetOtpApi();
      // Đặt lại timer sau khi gửi thành công
      setCanResend(false);
      setCountdown(RESEND_TIMEOUT);
    } catch (err) {
      let message = "Không thể gửi lại mail. Vui lòng thử lại.";
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") message = e.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Timer logic (Đã tối ưu hóa)
  useEffect(() => {
    if (currentStep !== "waiting") return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCanResend(true); // Kích hoạt nút
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    // Cleanup: Cần chạy lại useEffect khi currentStep thay đổi
    return () => clearInterval(interval);
  }, [currentStep, countdown]); // Thêm countdown vào dependency để timer chạy

  // helper to open common webmail providers (Gmail default)
  const handleOpenEmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  // Step 3: waiting for verification link click
  if (currentStep === "waiting") {
    // Sử dụng component riêng
    return (
      <EmailVerifyWaiting
        email={email}
        countdown={countdown}
        canResend={canResend}
        loading={loading}
        onResend={handleResend}
        onOpenEmail={handleOpenEmail}
        formatTime={formatTime}
      />
    );
  }

  // Step 2: show button to send verification email
  if (currentStep === "readyToSend") {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Gradient Background (Giống hệt ForgotPassword) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">
              BRIPATH
            </h1>
            <div className="space-y-4 mt-16 animate-slide-up-delay">
              <h2 className="text-5xl font-light leading-tight">
                Sẵn sàng gửi email!
                <br />
                <span className="text-orange-200">Xác nhận lần cuối</span>
                <br />
                <span className="text-orange-200">
                  để tiến hành đặt lại mật khẩu.
                </span>
              </h2>
            </div>
          </div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
        </div>

        {/* Right Side - Ready to Send Form (Giống style ForgotPassword) */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
              {/* Nội dung bên trong của ReadyToSend */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Xác nhận email thành công
                </h2>
                <p className="text-gray-600 mb-6">
                  Sẵn sàng gửi liên kết xác thực mật khẩu đến{" "}
                  <span className="font-semibold text-gray-700">
                    {email || "email của bạn"}
                  </span>
                  .
                </p>
              </div>

              <Button
                onClick={handleSendVerification}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  "Gửi email xác thực"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: display email input form
  return (
    <div>
      {currentStep === "forgot" && (
        <ForgotPassword onEmailSubmit={handleEmailSubmit} />
      )}
    </div>
  );
}
