import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyRegisterEmail } from '../../api/auth_api';

export default function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Token không hợp lệ');
        return;
      }

      try {
        await verifyRegisterEmail(token);
        setStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch {
        setStatus('error');
        setError('Xác minh thất bại. Token có thể đã hết hạn hoặc không hợp lệ.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang xác minh email...</h2>
          <p className="text-gray-600">
            Vui lòng đợi trong khi chúng tôi xác minh địa chỉ email của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác minh thành công!</h2>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">
              🎉 Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây nữa...
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-red-500 to-pink-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          ❌
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác minh thất bại</h2>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            Vui lòng thử đăng ký lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
          </p>
        </div>
        <button 
          onClick={() => navigate('/register')}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
        >
          Thử đăng ký lại
        </button>
      </div>
    </div>
  );
}