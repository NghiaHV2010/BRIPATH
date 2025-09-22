import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ResetPasswordProps {
  onPasswordReset: (newPassword: string) => void;
  email: string;
}

export default function ResetPassword({ onPasswordReset, email }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền vào cả hai trường mật khẩu");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      // Không cần set error ở đây vì đã có real-time validation
      return;
    }
    
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onPasswordReset(newPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Sắp xong rồi!<br />
              <span className="text-green-200">Tạo mật khẩu mới</span><br />
              <span className="text-green-200">bảo mật cho bạn</span>
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 animate-bounce-subtle">
                🔑
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo mật khẩu mới</h2>
              <p className="text-gray-600 text-sm">
                Cho tài khoản: <span className="font-medium">{email}</span><br />
                Nhập mật khẩu mới của bạn bên dưới.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${
                    confirmPassword && newPassword && confirmPassword !== newPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : ''
                  }`}
                  required
                />
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <div className="text-red-500 text-sm animate-shake">
                    Mật khẩu không khớp
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1">
                  <li className={`${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                    • Ít nhất 6 ký tự
                  </li>
                  <li className={`${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-600' : 'text-gray-400'}`}>
                    • Mật khẩu phải khớp nhau
                  </li>
                </ul>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật mật khẩu...</span>
                  </div>
                ) : (
                  "Cập nhật mật khẩu"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Nhớ lại mật khẩu?{' '}
                <a href="/login" className="text-green-600 hover:underline font-medium transition-colors">
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