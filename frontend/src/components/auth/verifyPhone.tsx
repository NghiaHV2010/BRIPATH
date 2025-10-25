// import { useState } from "react";
// import {
//   auth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   type ConfirmationResult,
// } from "../../firebase/config";

// export default function VerifyPhone() {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otp, setOtp] = useState("");
//   const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // ✅ Khởi tạo Recaptcha chỉ 1 lần
//   const setUpRecaptcha = () => {
//     if (!(window as any).recaptchaVerifier) {
//       (window as any).recaptchaVerifier = new RecaptchaVerifier(
//         auth,
//         "recaptcha-container",
//         {
//           size: "invisible", // invisible hoặc normal nếu muốn hiển thị captcha
//           callback: (response: any) => {
//             console.log("reCAPTCHA solved:", response);
//           },
//           "expired-callback": () => {
//             console.warn("reCAPTCHA expired. Please refresh.");
//           },
//         }
//       );
//     }
//   };

//   // ✅ Gửi OTP
//   const handleSendOTP = async () => {
//     setMessage("");
//     if (!phoneNumber.startsWith("+")) {
//       setMessage("⚠️ Số điện thoại phải có mã quốc gia, ví dụ: +84901234567");
//       return;
//     }

//     try {
//       setLoading(true);
//       setUpRecaptcha();
//       const appVerifier = (window as any).recaptchaVerifier;
//       const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       setConfirmationResult(confirmation);
//       setMessage("✅ OTP đã được gửi, vui lòng kiểm tra tin nhắn!");
//     } catch (error: any) {
//       console.error("❌ Lỗi gửi OTP:", error);
//       setMessage(`❌ Lỗi gửi OTP: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Xác minh OTP
//   const handleVerifyOTP = async () => {
//     if (!confirmationResult) {
//       setMessage("⚠️ Bạn cần gửi OTP trước khi xác minh!");
//       return;
//     }

//     try {
//       setLoading(true);
//       await confirmationResult.confirm(otp);
//       setMessage("🎉 Xác minh thành công!");
//     } catch (error: any) {
//       console.error("❌ Sai mã OTP:", error);
//       setMessage("❌ Sai mã OTP hoặc mã đã hết hạn.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-3 p-6 max-w-sm mx-auto border rounded-lg shadow-md">
//       <h2 className="text-lg font-semibold text-center">📱 Verify Phone</h2>

//       <input
//         type="tel"
//         value={phoneNumber}
//         onChange={(e) => setPhoneNumber(e.target.value)}
//         placeholder="+84xxxxxxxxx"
//         className="border rounded px-3 py-2 w-full"
//         disabled={loading}
//       />

//       {!confirmationResult ? (
//         <button
//           onClick={handleSendOTP}
//           disabled={loading}
//           className={`py-2 rounded text-white ${
//             loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           {loading ? "Đang gửi..." : "Gửi OTP"}
//         </button>
//       ) : (
//         <>
//           <input
//             type="text"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             placeholder="Nhập mã OTP"
//             className="border rounded px-3 py-2 w-full"
//             disabled={loading}
//           />
//           <button
//             onClick={handleVerifyOTP}
//             disabled={loading}
//             className={`py-2 rounded text-white ${
//               loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {loading ? "Đang xác minh..." : "Xác minh OTP"}
//           </button>
//         </>
//       )}

//       <div id="recaptcha-container"></div>

//       {message && (
//         <p
//           className={`text-sm text-center ${
//             message.startsWith("✅") || message.startsWith("🎉")
//               ? "text-green-600"
//               : "text-red-600"
//           }`}
//         >
//           {message}
//         </p>
//       )}
//     </div>
//   );
// }
