import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/auth";
import { useNavigate, useLocation } from "react-router-dom";
import GoogleButton from "../ui/googleButton";
export default function FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const storeError = useAuthStore((s) => s.error);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const navigate = useNavigate();
  const location = useLocation();
  let redirectTo: string | undefined;
  if (
    location.state &&
    typeof location.state === "object" &&
    "redirectTo" in location.state
  ) {
    const val = (location.state as Record<string, unknown>).redirectTo;
    if (typeof val === "string") redirectTo = val;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    setError("");
    try {
      await login?.(email, password);
      setTimeout(() => {
        const currentUser = useAuthStore.getState().authUser;
        if (currentUser?.roles.role_name === "Admin") {
          navigate(redirectTo || "/admin", { replace: true });
        } else {
          navigate(redirectTo || "/", { replace: true });
        }
      }, 500);
    } catch {
      setError(storeError || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    }
  };

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Chào mừng.
              <br />
              <span className="text-blue-200">Bắt đầu hành trình</span>
              <br />
              <span className="text-blue-200">cùng website của chúng tôi!</span>
            </h2>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 animate-bounce-subtle">
                👋
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Đăng nhập vào tài khoản
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Nhập Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <a
                    href="/forgot-password"
                    tabIndex={-1}
                    className="text-sm text-blue-600 hover:underline transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
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

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="default"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  "Đăng nhập ngay"
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
                Chưa có tài khoản?{" "}
                <a
                  href="/register"
                  tabIndex={-1}
                  className="text-blue-600 hover:underline font-medium transition-colors"
                >
                  Đăng ký ngay
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
