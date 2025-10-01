import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyRegisterEmail } from "../../api/auth_api";
import { useAuthStore } from "../../store/auth";

export default function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState("");
  const [redirectIn, setRedirectIn] = useState(5);
  const { checkAuth } = useAuthStore();
  const hasExecutedRef = useRef(false);
  // No redirect timeout needed now

  useEffect(() => {
    // Dùng ref để đảm bảo verify chỉ chạy một lần (tránh rerender do checkAuth làm effect chạy lại)
    if (hasExecutedRef.current) return; // đã chạy rồi
    hasExecutedRef.current = true;

    const verifyEmail = async () => {
      console.log("🔍 Raw URL:", window.location.href);
      console.log("🎯 Token from useParams:", token);
      console.log("📏 Token length:", token?.length);

      if (!token) {
        console.error("❌ No token found in URL params");
        setStatus("error");
        setError("Token không hợp lệ");
        return;
      }

      try {
        console.log("🚀 Starting verification...");
        const result = await verifyRegisterEmail(token);
        console.log("✅ Verification result:", result);
        await checkAuth();
        setStatus("success");
      } catch (error) {
        // Nếu đã vào success trước đó thì bỏ qua lỗi lần 2 (token có thể đã bị consume)
        setStatus((prev) => {
          if (prev === "success") return prev; // giữ success
          console.error("❌ Verification error:", error);
          setError(
            "Xác minh thất bại. Token có thể đã hết hạn hoặc không hợp lệ."
          );
          return "error";
        });
      }
    };
    void verifyEmail();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Countdown effect when success
  useEffect(() => {
    if (status !== "success") return;
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
  }, [status, navigate]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Đang xác minh email...
          </h2>
          <p className="text-gray-600">
            Vui lòng đợi trong khi chúng tôi xác minh địa chỉ email của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Xác minh thành công
          </h2>
          <p className="text-gray-600 text-sm">
            Tài khoản đã kích hoạt. Tự động chuyển về trang đăng nhập trong{" "}
            <span className="font-medium">{redirectIn}s</span>...
          </p>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Xác minh thất bại
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            Vui lòng thử đăng ký lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp
            diễn.
          </p>
        </div>
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
        >
          Thử đăng ký lại
        </button>
      </div>
    </div>
  );
}
