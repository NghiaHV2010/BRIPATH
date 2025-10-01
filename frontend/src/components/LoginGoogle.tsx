import { useState, useCallback } from "react";

// Simple styled button (can be replaced by existing UI Button component if available)
const GOOGLE_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
    className="w-5 h-5"
  >
    <path
      fill="#EA4335"
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 90.7 72 164.6 153.7 164.6 98.2 0 135-70.4 140.8-107.2H248v-85.3h236.9c2.3 12.7 3.1 24.9 3.1 33.7z"
    />
  </svg>
);

const LoginGoogle: React.FC = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const googleUrl = `${baseUrl}/login/google`;

  const handleClick = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    // Full page redirect (simplest). Popup variant can be added later.
    window.location.href = googleUrl;
  }, [googleUrl, isRedirecting]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRedirecting}
      className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {GOOGLE_ICON}
      <span>
        {isRedirecting ? "Đang chuyển tới Google..." : "Đăng nhập với Google"}
      </span>
    </button>
  );
};

export default LoginGoogle;
