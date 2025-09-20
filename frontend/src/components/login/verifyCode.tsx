import { useState, useRef } from "react";
import { Button } from "../ui/button";

interface VerifyCodeProps {
  onVerify?: (code: string) => void;
  type?: 'registration' | 'password-reset';
  email?: string;
}

export default function VerifyCode({ onVerify, type = 'registration', email }: VerifyCodeProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputs = [
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null)
  ];

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < 5) {
      inputs[idx + 1].current?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some(c => c === "")) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onVerify?.(code.join(""));
    const message = type === 'password-reset' 
      ? "Email verified successfully! You can now reset your password." 
      : "Account verified successfully! Welcome to BRIPATH!";
    alert(message);
  };

  const handleResend = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    const message = type === 'password-reset'
      ? "Password reset code sent!"
      : "Verification code sent!";
    alert(message);
  };

  const getGradientClass = () => {
    return type === 'password-reset' 
      ? 'from-orange-400 via-red-500 to-pink-600'
      : 'from-violet-400 via-purple-500 to-fuchsia-600';
  };

  const getBorderClass = () => {
    return type === 'password-reset' ? 'border-orange-200' : 'border-purple-200';
  };

  const getAccentColorClass = () => {
    return type === 'password-reset' ? 'text-orange-200' : 'text-purple-200';
  };

  const getButtonClass = () => {
    return type === 'password-reset'
      ? 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
      : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700';
  };

  const getLinkClass = () => {
    return type === 'password-reset' ? 'text-orange-600 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700';
  };

  return (
    <div className="min-h-screen flex">
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${getGradientClass()} p-12 flex-col justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              {type === 'password-reset' ? (
                <>
                  Verify your email<br />
                  <span className={getAccentColorClass()}>to reset your</span><br />
                  <span className={getAccentColorClass()}>password</span>
                </>
              ) : (
                <>
                  You're almost in!<br />
                  <span className={getAccentColorClass()}>Just one more step</span><br />
                  <span className={getAccentColorClass()}>to get started</span>
                </>
              )}
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className={`bg-white rounded-2xl shadow-xl border ${getBorderClass()} p-8 transform transition-all duration-300 hover:shadow-2xl`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getButtonClass()} rounded-full mb-6 animate-bounce-subtle`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {type === 'password-reset' ? 'Verify Your Email' : 'Verify Your Email'}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {type === 'password-reset' ? (
                  <>
                    We've sent a 6-digit verification code to {email ? <><strong>{email}</strong><br /></> : 'your email address.'}<br />
                    Enter it below to proceed with password reset.
                  </>
                ) : (
                  <>
                    We've sent a 6-digit verification code to your email address.<br />
                    Please enter it below to complete your registration.
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-3 mb-6">
                {code.map((value, index) => (
                  <input
                    key={index}
                    ref={inputs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 transform focus:scale-110 ${
                      value 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                    value={value}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-shake">{error}</div>
              )}

              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r ${getButtonClass()} text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoading || code.some(c => c === "")}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-3">
                <button 
                  type="button" 
                  onClick={handleResend}
                  className={`${getLinkClass()} text-sm font-medium transition-colors disabled:opacity-50`}
                  disabled={isLoading}
                >
                  Didn't receive the code? Resend
                </button>
                
                <div className="text-xs text-gray-500">
                  {type === 'password-reset' ? (
                    <>
                      Want to change your email address?{' '}
                      <a href="/forgot-password" className={`${getLinkClass()} hover:underline font-medium`}>
                        Go back
                      </a>
                    </>
                  ) : (
                    <>
                      Want to change your email address?{' '}
                      <a href="/register" className={`${getLinkClass()} hover:underline font-medium`}>
                        Go back
                      </a>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}