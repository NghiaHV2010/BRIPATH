
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import GoogleButton from "./googleButton";
import VerifyCode from "./verifyCode";

export default function FormRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<'register' | 'email' | 'verify'>('register');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      // Không cần set error ở đây vì đã có real-time validation
      return;
    }
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    setStep('email');
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    setStep('verify');
  };

  if (step === 'verify') {
    return <VerifyCode onVerify={() => {}} />;
  }

  if (step === 'email') {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Gradient Background */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
            <div className="space-y-4 mt-16 animate-slide-up-delay">
              <h2 className="text-5xl font-light leading-tight">
                Sắp hoàn tất!<br />
                <span className="text-purple-200">Xác minh email của bạn</span><br />
                <span className="text-purple-200">để hoàn tất đăng ký</span>
              </h2>
            </div>
          </div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
        </div>

        {/* Right Side - Email Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4 animate-bounce-subtle">
                  📧
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Nhập địa chỉ email</h2>
                <p className="text-gray-600 text-sm">Chúng tôi sẽ gửi mã xác minh để xác minh tài khoản của bạn</p>
              </div>

              <form onSubmit={handleEmail} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
                  <Input
                    type="email"
                    placeholder="ví dụ: example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center animate-shake">{error}</div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi mã...</span>
                    </div>
                  ) : (
                    "Gửi mã xác minh"
                  )}
                </Button>
              </form>
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
              Tham gia cùng chúng tôi!<br />
              <span className="text-emerald-200">Tạo tài khoản của bạn</span><br />
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo tài khoản của bạn</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tên tài khoản</label>
                <Input
                  type="text"
                  placeholder="Nhập tên tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <Input
                  type="password"
                  placeholder="Tạo mật khẩu mạnh"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${
                    confirmPassword && password && confirmPassword !== password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : ''
                  }`}
                  required
                />
                {confirmPassword && password && confirmPassword !== password && (
                  <div className="text-red-500 text-sm animate-shake">
                    Mật khẩu không khớp
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1">
                  <li className={`${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                    • Ít nhất 6 ký tự
                  </li>
                  <li className={`${password && confirmPassword && password === confirmPassword ? 'text-green-600' : 'text-gray-400'}`}>
                    • Mật khẩu phải khớp nhau
                  </li>
                </ul>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">{error}</div>
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
                  <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <GoogleButton onSuccess={() => alert("Google register success!")} />

              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/login" className="text-emerald-600 hover:underline font-medium transition-colors">
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
