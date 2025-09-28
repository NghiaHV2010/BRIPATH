import { useState } from "react";
import ForgotPassword from "../../components/login/forgotPassword";
import { Button } from "../../components/ui/button";

type Step = 'forgot' | 'sent' | 'success';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('forgot');
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    // Backend will send the reset link via email and handle redirect after click
    setCurrentStep('sent');
  };

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đổi mật khẩu thành công!</h2>
          <p className="text-gray-600 mb-6">
            Mật khẩu của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">
              🎉 Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây nữa...
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-pink-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã gửi email đặt lại mật khẩu</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến {email || 'email của bạn'}. Vui lòng kiểm tra hộp thư và nhấp vào liên kết để tiếp tục.
          </p>
          <Button
            onClick={() => (window.location.href = '/login')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {currentStep === 'forgot' && (
        <ForgotPassword onEmailSubmit={handleEmailSubmit} />
      )}
    </div>
  );
}