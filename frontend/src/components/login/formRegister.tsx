
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import GoogleButton from "./googleButton";
// Verify via email link; no OTP input screen
import { useAuthStore } from "../../store/auth";

export default function FormRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<'register' | 'sent'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const { registerValidate: doRegisterValidate, sendRegisterEmail: doSendRegisterEmail, error: storeError } = useAuthStore();

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
      // Không cần set error ở đây vì đã có real-time validation
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
      const cooldownEnd = Date.now() + 5 * 60 * 1000; // 5 minutes
      localStorage.setItem(`verifyEmailCooldown_${email}`, cooldownEnd.toString());
      setStep('sent');
    } catch {
      setError(storeError || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cooldown on sent step
  useEffect(() => {
    if (step === 'sent' && email) {
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

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (email) {
              localStorage.removeItem(`verifyEmailCooldown_${email}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [remainingSeconds, email]);

  const handleResend = async () => {
    if (!canResend || !email) return;
    
    setError("");
    setIsLoading(true);
    try {
      await doSendRegisterEmail();
      // Set new cooldown
      const cooldownEnd = Date.now() + 5 * 60 * 1000;
      localStorage.setItem(`verifyEmailCooldown_${email}`, cooldownEnd.toString());
      setRemainingSeconds(300); // 5 minutes in seconds
      setCanResend(false);
    } catch {
      setError(storeError || 'Gửi lại email thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'sent') {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
            <div className="space-y-4 mt-16 animate-slide-up-delay">
              <h2 className="text-5xl font-light leading-tight">
                Kiểm tra hộp thư<br />
                <span className="text-purple-200">Nhấp vào liên kết</span><br />
                <span className="text-purple-200">để xác minh</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md animate-fade-in-right">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-200 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">📧</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Email xác minh đã được gửi</h2>
                <p className="text-gray-600 text-sm">Hãy mở email của bạn và nhấp vào liên kết xác thực. Sau khi xác thực, hệ thống sẽ tự chuyển bạn về trang chủ.</p>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <a 
                  href="https://mail.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-center font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>📧</span>
                    <span>Mở Gmail</span>
                  </div>
                </a>

                <Button
                  onClick={handleResend}
                  disabled={!canResend || isLoading}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
                    canResend && !isLoading
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang gửi...</span>
                    </div>
                  ) : canResend ? (
                    'Gửi lại email'
                  ) : (
                    `Gửi lại sau ${formatTime(remainingSeconds)}`
                  )}
                </Button>
              </div>

              <a href="/login" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg text-center font-medium transition mt-4">
                Quay lại đăng nhập
              </a>
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

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu (chứa chữ và số)</label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu (chữ và số)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  title="Mật khẩu phải có cả chữ và số"
                  autoComplete="new-password"
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
                  title="Mật khẩu phải có cả chữ và số"
                  autoComplete="new-password"
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
                  <li className={`${/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    • Chứa ít nhất 1 chữ và 1 số
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

              <GoogleButton />

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
