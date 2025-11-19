import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordApi } from "../../api/user_api";
import { Eye, EyeOff } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function ResetPasswordPage() {
  // Đọc token từ URL
  const params = useParams<{ token?: string }>();
  const rawToken = params.token;
  const navigate = useNavigate();
  // Lưu token vào state để sử dụng cho API, tránh bị mất
  const [token] = useState<string | undefined>(rawToken);

  // Xóa token khỏi URL ngay sau khi load, tăng bảo mật
  useEffect(() => {
    if (rawToken) {
      try {
        // Dùng history.replaceState để thay thế token trong URL
        const newUrl = window.location.pathname.replace(`/${rawToken}`, "");
        // Đảm bảo token được loại bỏ khỏi path, không chạm vào query params
        window.history.replaceState({}, "", newUrl + window.location.search);
      } catch (e) {
        console.warn("Could not replace history state:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regex: Tối thiểu 8 ký tự và có ít nhất 1 chữ số
  const validatePassword = (pw: string) => /^(?=.*\d).{8,}$/.test(pw);

  const hasDigit = validatePassword; // re-use regex
  const hasMinLength = (pw: string) => pw.length >= 8;
  const passwordsMatch = (pw: string, conf: string) =>
    pw && conf && pw === conf;

  const canSubmit = useMemo(() => {
    return (
      !!token && validatePassword(password) && password === confirm && !loading
    );
  }, [token, password, confirm, loading]);

  const handleSubmit = async () => {
    setError(null);
    if (!token) return setError("Token không hợp lệ hoặc đã hết hạn.");
    if (!validatePassword(password))
      return setError("Mật khẩu phải có ít nhất 8 ký tự và 1 chữ số.");
    if (password !== confirm) return setError("Xác nhận mật khẩu không khớp.");

    try {
      setLoading(true);
      // Gửi token và mật khẩu mới đến API
      const res = await resetPasswordApi(token, password);

      // Giả định API trả về { success: true }
      if (res && res.success) {
        setDone(true);
        // redirect handled by effect below
      } else {
        // Xử lý thông báo lỗi từ API
        setError(res?.message || "Đổi mật khẩu thất bại.");
      }
    } catch (err: unknown) {
      // Xử lý lỗi kết nối hoặc lỗi không mong muốn
      let message = "Lỗi kết nối. Vui lòng thử lại.";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI THÀNH CÔNG (Giữ nguyên tông Xanh lá) ---
  const [redirectIn, setRedirectIn] = useState(5);

  useEffect(() => {
    if (!done) return;
    setRedirectIn(5);
    const interval = setInterval(() => {
      setRedirectIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [done, navigate]);

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-200 to-teal-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <DotLottieReact
              src="../../../public/animations/Success Check.json"
              autoplay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Đổi mật khẩu thành công
          </h2>
          <p className="text-gray-600 text-sm">
            Mật khẩu của bạn đã được cập nhật. Tự động chuyển về trang đăng nhập
            trong{" "}
            <span className="font-medium text-emerald-600">{redirectIn}s</span>
            ...
          </p>
        </div>
      </div>
    );
  }

  // --- UI ĐẶT LẠI MẬT KHẨU (2 CỘT) - Tông Đỏ/Cam/Vàng ---
  return (
    <div className="min-h-screen flex">
      {/* ⬅️ LEFT SIDE - Gradient Background (Đỏ/Cam/Vàng) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Bảo mật là trên hết.
              <br />
              <span className="text-yellow-200">Hãy chọn một mật khẩu</span>
              <br />
              <span className="text-yellow-200">
                mạnh và dễ nhớ cho lần đăng nhập tới.
              </span>
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* ➡️ RIGHT SIDE - Content Card */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                🔑
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Đặt lại mật khẩu
              </h2>
              <p className="text-gray-600 text-sm">
                Nhập mật khẩu mới. Token đã được xác minh thành công.
              </p>
            </div>

            {/* Mật khẩu mới */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block font-medium">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md pr-10"
                />
                <button
                  tabIndex={-1}
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ít nhất 8 ký tự và có 1 chữ số.
              </p>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-1 block font-medium">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${
                    confirm && password && confirm !== password
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
              {password && confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">
                  Xác nhận mật khẩu không khớp.
                </p>
              )}
            </div>
            {/* Password requirements */}
            <div className="text-xs text-gray-600 bg-orange-50 p-3 rounded-lg mb-4 border border-orange-200">
              <p className="font-medium mb-1 text-orange-700">
                Yêu cầu mật khẩu:
              </p>
              <ul className="space-y-1">
                <li
                  className={`${
                    hasDigit(password) ? "text-orange-600" : "text-gray-400"
                  }`}
                >
                  • Chứa ít nhất 1 kí tự số
                </li>
                <li
                  className={`${
                    hasMinLength(password) ? "text-orange-600" : "text-gray-400"
                  }`}
                >
                  • Ít nhất 8 ký tự
                </li>
                <li
                  className={`${
                    passwordsMatch(password, confirm)
                      ? "text-orange-600"
                      : "text-gray-400"
                  }`}
                >
                  • Mật khẩu phải khớp nhau
                </li>
              </ul>
            </div>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg mb-4 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Nút Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || loading} // Đảm bảo nút disabled khi loading
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.01] hover:shadow-lg ${
                loading
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white opacity-70 cursor-not-allowed shadow-xl shadow-red-300/50"
                  : !canSubmit
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl shadow-red-300/50"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
