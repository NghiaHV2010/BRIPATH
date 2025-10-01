import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosConfig from "../../config/axios.config";
import { useAuthStore } from "../../store/auth";

/**
 * Popup-based Google OAuth button.
 * - Opens /login/google in centered popup
 * - Polls until popup closes or callback path detected
 * - Calls checkAuth() to sync Zustand user from cookies
 * - Falls back to full redirect if popup blocked
 */
export default function GoogleLoginPopup() {
  const [loading, setLoading] = useState(false);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = useCallback(() => {
    if (loading) return;
    setLoading(true);

    // Derive base URL robustly: ensure it includes /api once
    let raw = axiosConfig.defaults.baseURL || "";
    if (!raw) {
      // Fallback to current origin + /api
      raw = `${window.location.origin}/api`;
    }
    // Remove trailing slash
    raw = raw.replace(/\/$/, "");
    // Guarantee /api present (avoid double /api)
    if (!/\/api$/.test(raw)) {
      raw = `${raw}/api`;
    }
    const oauthUrl = `${raw}/login/google`;

    // Centered popup size
    const w = 520;
    const h = 620;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;

    const popup = window.open(
      oauthUrl,
      "google_oauth_popup",
      `width=${w},height=${h},left=${left},top=${top},resizable=no,toolbar=no,menubar=no,location=no,status=no`
    );

    if (!popup) {
      // Popup blocked → fallback full redirect
      window.location.href = oauthUrl;
      return;
    }

    const start = Date.now();
    const timeoutMs = 60_000; // 1 minute

    const poll = setInterval(async () => {
      try {
        if (popup.closed) {
          clearInterval(poll);
          setLoading(false);
          await finalize();
          return;
        }

        // Detect callback path (backend returns JSON; still okay to close early)
        if (popup.location.pathname.includes("/api/login/google/callback")) {
          popup.close();
          clearInterval(poll);
          setLoading(false);
          await finalize();
          return;
        }
      } catch {
        // Ignore cross-origin access until it returns to same origin
      }

      if (Date.now() - start > timeoutMs) {
        clearInterval(poll);
        try {
          popup.close();
        } catch {
          /* ignore close errors */
        }
        setLoading(false);
      }
    }, 700);

    async function finalize() {
      try {
        await checkAuth();
        // redirect if a redirectTo was stored in location.state
        const st = location.state as Record<string, unknown> | null;
        const redirectTo =
          st && typeof st.redirectTo === "string" ? st.redirectTo : "/";
        navigate(redirectTo, { replace: true });
      } catch {
        // swallow errors; user remains unauth
      }
    }
  }, [loading, checkAuth, navigate, location.state]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60 py-2.5 text-sm font-medium transition-colors"
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="h-5 w-5"
        loading="lazy"
      />
      {loading ? "Đang mở Google..." : "Đăng nhập với Google"}
    </button>
  );
}
