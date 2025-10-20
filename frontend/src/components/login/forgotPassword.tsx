import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ForgotPasswordProps {
  onEmailSubmit: (email: string) => void;
}

export default function ForgotPassword({ onEmailSubmit }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email của bạn");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setError("");
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    onEmailSubmit(email);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Quên mật khẩu?
              <br />
              <span className="text-orange-200">Đừng lo lắng!</span>
              <br />
              <span className="text-orange-200">
                Chúng tôi sẽ giúp bạn khôi phục
              </span>
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Quên mật khẩu?
              </h2>
              <p className="text-gray-600 text-sm">
                Nhập địa chỉ email của bạn và chúng tôi xác nhận để đặt lại mật
                khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Địa chỉ Email
                </label>
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  "Xác nhận email"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Nhớ lại mật khẩu?{" "}
                <a
                  href="/login"
                  tabIndex={-1}
                  className="text-orange-600 hover:underline font-medium transition-colors"
                >
                  Quay lại đăng nhập
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
