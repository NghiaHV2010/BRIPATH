import { useEffect, useState } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../../config/firebase.config"; // ✅ Cập nhật path import
import axiosConfig from "../../config/axios.config";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

// ⚠️ CHÚ Ý: Tôi đã thêm một div nhỏ để hiện thị lỗi nếu có, thay vì dùng alert.
// Tuy nhiên, tôi vẫn giữ alert theo yêu cầu, chỉ thêm state error.
export default function VerifyPhone() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // State để hiển thị lỗi
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false); // State mới

  // ✅ Debug: Log Firebase config
  useEffect(() => {
    // Đoạn code này chỉ chạy khi component mount lần đầu
    console.log("🔧 Firebase Auth initialized:", auth);
    console.log("🔧 Auth domain:", auth.config.authDomain);
    console.log("🔧 API Key:", auth.config.apiKey ? "✅ Exists" : "❌ Missing");
  }, []);

  // ✅ Tạo reCAPTCHA một lần khi component mount
  useEffect(() => {
    const initRecaptcha = () => {
      try {
        // Xóa container cũ nếu có (an toàn khi refresh nhanh)
        const container = document.getElementById("recaptcha-container");
        if (container) {
          container.innerHTML = "";
        }

        if (!window.recaptchaVerifier) {
          console.log("🔧 Initializing reCAPTCHA (Visible)...");
          // ReCAPTCHA chỉ được tạo một lần và hiện ra
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "normal", // Dùng normal (Visible)
              callback: (response: any) => {
                console.log("✅ reCAPTCHA solved automatically:", response);
                // Với size normal, callback này chỉ chạy khi người dùng tick vào
                setIsRecaptchaReady(true);
              },
              "expired-callback": () => {
                console.log("⚠️ reCAPTCHA expired, need to re-verify");
                setIsRecaptchaReady(false);
                setErrorMsg("reCAPTCHA đã hết hạn. Vui lòng tick lại.");
              },
            }
          );

          // Render reCAPTCHA ngay lập tức
          window.recaptchaVerifier.render().then(() => {
            console.log("✅ reCAPTCHA initialized and rendered successfully");
            // Vì nó là size "normal", ta vẫn cần người dùng tick vào, nhưng coi như đã sẵn sàng hiển thị.
            setIsRecaptchaReady(true);
          });
        }
      } catch (error) {
        console.error("❌ reCAPTCHA init error:", error);
        setErrorMsg("Lỗi khởi tạo reCAPTCHA. Kiểm tra Console.");
        setIsRecaptchaReady(false);
      }
    };

    initRecaptcha();

    // Cleanup: Dọn dẹp reCAPTCHA khi component unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          console.log("🧹 Cleaning up reCAPTCHA...");
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
          setIsRecaptchaReady(false);
        } catch (e) {
          console.log("Cleanup error (ignorable):", e);
        }
      }
    };
  }, []);

  const sendOTP = async () => {
    setErrorMsg(""); // Reset lỗi
    if (!phone) {
      alert("Nhập số điện thoại!");
      return;
    }

    // 1. Lấy reCAPTCHA Verifier đã được khởi tạo
    const appVerifier = window.recaptchaVerifier;

    // Trong chế độ "normal", reCAPTCHA đã sẵn sàng hiển thị (isRecaptchaReady=true),
    // nhưng Firebase vẫn cần thấy người dùng đã giải mã CAPTCHA (thông qua token).
    if (!appVerifier || !isRecaptchaReady) {
      const msg =
        "Lỗi hệ thống: reCAPTCHA chưa sẵn sàng. Vui lòng tải lại trang.";
      setErrorMsg(msg);
      alert(msg);
      return;
    }

    // 💡 Với reCAPTCHA VISIBLE, người dùng phải tương tác bằng cách TÍCH CHỌN.
    // Nếu chưa tích chọn (hoặc token hết hạn), Firebase sẽ yêu cầu người dùng xác minh.

    console.log("📱 Starting OTP send process...");
    console.log("📱 Input phone:", phone);

    try {
      setLoading(true);

      // 2. Format số điện thoại (Quan trọng!)
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+84${phone.startsWith("0") ? phone.slice(1) : phone}`;

      console.log("📞 Formatted phone:", formattedPhone);
      console.log("📞 Calling signInWithPhoneNumber...");

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      console.log("✅ signInWithPhoneNumber result:", result);
      setConfirmationResult(result);
      alert("📩 OTP đã được gửi! (Kiểm tra CAPTCHA nếu chưa gửi)");
    } catch (error: any) {
      console.error("❌ Full error object:", error);

      let errorText =
        "Lỗi gửi OTP. Vui lòng kiểm tra Console (F12) để biết chi tiết. ";

      switch (error.code) {
        case "auth/invalid-app-credential":
          errorText =
            "❌ Lỗi cấu hình Domain hoặc API Key! Vui lòng kiểm tra lại: \n" +
            "1. Authorized domains (Firebase Console).\n" +
            "2. Identity Toolkit API (Google Cloud Console/API Key).";
          break;
        case "auth/captcha-check-failed":
          errorText =
            "❌ Xác minh reCAPTCHA thất bại. Vui lòng TÍCH CHỌN ô I'm not a robot!";
          break;
        case "auth/invalid-phone-number":
          errorText =
            "❌ Số điện thoại không hợp lệ! Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx";
          break;
        case "auth/too-many-requests":
          errorText = "❌ Quá nhiều yêu cầu. Thử lại sau vài phút!";
          break;
        default:
          errorText += `Code: ${error.code} | Message: ${error.message}`;
      }

      setErrorMsg(errorText);
      alert(errorText); // Dùng alert theo yêu cầu ban đầu
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setErrorMsg(""); // Reset lỗi
    if (!confirmationResult) {
      alert("Gửi OTP trước!");
      return;
    }
    if (!otp) {
      alert("Nhập mã OTP!");
      return;
    }

    console.log("🔐 Verifying OTP:", otp);

    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log("✅ OTP verified, user:", user);

      // Gửi token cho backend để xác minh
      const res = await axiosConfig.post("/verify-sms", { token: idToken });

      if (res.data.success) {
        alert("✅ Xác minh thành công!");
        // Reset form
        setPhone("");
        setOtp("");
        setConfirmationResult(null);
      } else {
        alert("❌ Xác minh thất bại!");
      }
    } catch (error: any) {
      console.error("❌ Verification error:", error);

      let errorText =
        "Lỗi xác minh. Vui lòng kiểm tra Console (F12) để biết chi tiết. ";

      switch (error.code) {
        case "auth/invalid-verification-code":
          errorText = "❌ Mã OTP không đúng!";
          break;
        case "auth/code-expired":
          errorText = "❌ Mã OTP đã hết hạn!";
          break;
        default:
          errorText += error.message;
      }

      setErrorMsg(errorText);
      alert(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white shadow-xl rounded-xl">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        Xác thực số điện thoại
      </h2>

      <div className="mb-4">
        <small className="text-sm text-gray-500 block text-center">
          Mở Console (F12) để xem debug logs. Vui lòng **TÍCH CHỌN** reCAPTCHA
          bên dưới!
        </small>
        {errorMsg && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm whitespace-pre-wrap">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Đây là nơi reCAPTCHA Visible sẽ được attach */}
      <div id="recaptcha-container" className="mb-4 flex justify-center"></div>

      <input
        type="text"
        placeholder="Ví dụ: 0334327096"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={loading || !!confirmationResult}
        className="mb-4 p-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
      />
      <button
        onClick={sendOTP}
        disabled={loading || !!confirmationResult || !isRecaptchaReady}
        className={`p-3 w-full rounded-lg font-semibold transition duration-150 ease-in-out ${
          loading || !!confirmationResult || !isRecaptchaReady
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
        }`}
      >
        {loading ? "Đang gửi..." : "Gửi OTP"}
      </button>

      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={loading}
            className="mt-4 p-3 w-full border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
          />
          <button
            onClick={verifyOTP}
            disabled={loading}
            className={`p-3 w-full rounded-lg font-semibold transition duration-150 ease-in-out mt-2 ${
              loading
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 shadow-md"
            }`}
          >
            {loading ? "Đang xác minh..." : "Xác minh OTP"}
          </button>
        </>
      )}
    </div>
  );
}
