// import { DotLottieReact } from "@lottiefiles/dotlottie-react";
// import React, { useState, useEffect } from "react";
// import { Button } from "../ui/button";

// // Khai báo Prop Types
// interface EmailVerifyWaitingProps {
//   email: string;
//   onResend: () => Promise<void>; // Hàm gửi lại email, trả về Promise
//   onOpenEmail: () => void;
//   initialCountdown: number; // Ví dụ: 180 (3 phút)
// }

// // Hàm format thời gian (MM:SS)
// const formatTime = (seconds: number) => {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins.toString().padStart(2, "0")}:${secs
//     .toString()
//     .padStart(2, "0")}`;
// };

// export default function EmailVerifyWaiting({
//   email,
//   onResend,
//   onOpenEmail,
//   initialCountdown,
// }: EmailVerifyWaitingProps) {
//   const [countdown, setCountdown] = useState(initialCountdown);
//   const [canResend, setCanResend] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // --- LOGIC ĐẾM NGƯỢC ---
//   useEffect(() => {
//     // Kích hoạt nút Gửi lại ngay nếu bộ đếm ban đầu là 0
//     if (initialCountdown === 0) {
//       setCanResend(true);
//       return;
//     }

//     // Nếu countdown đã về 0, kích hoạt nút gửi lại và dừng timer
//     if (countdown === 0) {
//       setCanResend(true);
//       return;
//     }

//     // Thiết lập timer mỗi giây
//     const timer = setInterval(() => {
//       setCountdown((prev) => prev - 1);
//     }, 1000);

//     // Dọn dẹp timer
//     return () => clearInterval(timer);
//   }, [countdown, initialCountdown]);

//   // --- LOGIC XỬ LÝ GỬI LẠI EMAIL ---
//   const handleResendClick = async () => {
//     if (loading || !canResend) return;

//     setLoading(true);
//     try {
//       await onResend(); // Gọi hàm gửi lại từ component cha

//       // Khởi tạo lại bộ đếm sau khi gửi thành công
//       setCountdown(initialCountdown);
//       setCanResend(false); // Vô hiệu hóa nút trong khi chờ
//     } catch (error) {
//       console.error("Lỗi khi gửi lại email:", error);
//       // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* ⬅️ LEFT SIDE - Gradient Background (Tông Đỏ/Cam) */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-12 flex-col justify-center relative overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative z-10 text-white animate-fade-in">
//           <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
//           <div className="space-y-4 mt-16 animate-slide-up-delay">
//             <h2 className="text-5xl font-light leading-tight">
//               Email đã được gửi!
//               <br />
//               <span className="text-orange-200">Hãy kiểm tra hộp thư</span>
//               <br />
//               <span className="text-orange-200">
//                 và hoàn tất bước xác thực.
//               </span>
//             </h2>
//           </div>
//         </div>
//         <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
//         <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
//       </div>

//       {/* ➡️ RIGHT SIDE - Content Card */}
//       <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
//         <div className="w-full max-w-md animate-fade-in-right">
//           <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 transform transition-all duration-300 hover:shadow-2xl text-center">
//             <div className="flex justify-center mb-4">
//               <DotLottieReact
//                 src="../../../public/animations/Email Send.json"
//                 autoplay
//                 loop={true}
//                 // Giảm kích thước để phù hợp hơn với card
//                 style={{ width: 120, height: 120 }}
//               />
//             </div>

//             <h2 className="text-2xl font-bold text-gray-800 mb-3">
//               Đã gửi email xác thực
//             </h2>
//             <p className="text-gray-600 text-sm mb-4">
//               Vui lòng mở email{" "}
//               <span className="font-medium text-gray-800">
//                 {email || "của bạn"}
//               </span>{" "}
//               và nhấp vào liên kết xác thực.
//             </p>

//             {/* Khu vực Đồng hồ đếm ngược */}
//             <div className="text-center mb-4">
//               <div className="text-sm text-gray-500">Hết hạn trong</div>
//               <div
//                 className={`text-2xl font-bold ${
//                   countdown <= 30
//                     ? "text-red-500 animate-pulse"
//                     : "text-gray-800"
//                 }`}
//               >
//                 {formatTime(countdown)}
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 onClick={onOpenEmail}
//                 className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white"
//               >
//                 Mở email
//               </Button>

//               <Button
//                 onClick={handleResendClick}
//                 disabled={!canResend || loading}
//                 className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
//                   !canResend || loading
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
//                     : "bg-gray-600 hover:bg-gray-700 text-white"
//                 }`}
//               >
//                 {loading
//                   ? "Đang gửi..."
//                   : canResend
//                   ? "Gửi lại mail"
//                   : `Gửi lại sau ${formatTime(countdown)}`}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/login/EmailVerifyWaiting.tsx

import { Button } from "../ui/button"; // Giả định đường dẫn
import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // Giả định import

interface EmailVerificationWaitingProps {
  email: string;
  countdown: number;
  canResend: boolean;
  loading: boolean;
  onResend: () => Promise<void>;
  onOpenEmail: () => void;
  formatTime: (seconds: number) => string;
}

export default function EmailVerifyWaiting({
  email,
  countdown,
  canResend,
  loading,
  onResend,
  onOpenEmail,
  formatTime,
}: EmailVerificationWaitingProps) {
  return (
    <div className="min-h-screen flex">
      {/* ⬅️ LEFT SIDE - Gradient Background (Tông Đỏ/Cam) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-slide-up">BRIPATH</h1>
          <div className="space-y-4 mt-16 animate-slide-up-delay">
            <h2 className="text-5xl font-light leading-tight">
              Email đã được gửi!
              <br />
              <span className="text-orange-200">Hãy kiểm tra hộp thư</span>
              <br />
              <span className="text-orange-200">
                và hoàn tất bước xác thực.
              </span>
            </h2>
          </div>
        </div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-lg animate-float-delay"></div>
      </div>

      {/* ➡️ RIGHT SIDE - Content Card */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-right">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 transform transition-all duration-300 hover:shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <DotLottieReact
                src="../../../public/animations/Loading.json"
                autoplay
                loop={true}
                style={{ width: 140, height: 140 }}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Đã gửi email xác thực
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Vui lòng mở email{" "}
              <span className="font-medium text-gray-800">
                {email || "của bạn"}
              </span>{" "}
              và nhấp vào liên kết xác thực.
            </p>
           

            <div className="flex gap-3">
              <Button
                onClick={onOpenEmail}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white"
              >
                Mở Gmail
              </Button>

              <Button
                onClick={onResend} // Dùng hàm handleResend từ props
                disabled={!canResend || loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
                  !canResend || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {loading
                  ? "Đang gửi..."
                  : canResend
                  ? "Gửi lại mail"
                  : // Hiển thị thời gian chờ còn lại
                    `Gửi lại sau ${formatTime(countdown)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
