import axiosConfig from "../config/axios.config";

interface GoogleUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface WatchGooglePopupOptions {
  intervalMs?: number;
  onSuccess?: (user: GoogleUser) => void;
  onFail?: () => void;
  redirectOnSuccess?: string;
}

// Open popup and poll /check until authenticated (status 200 with user data)
export function openGooglePopup(url: string, opts: WatchGooglePopupOptions = {}) {
  const { intervalMs = 800, onSuccess, onFail, redirectOnSuccess = "/" } = opts;

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const popup = window.open(
    url,
    "google_oauth",
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    // fallback full redirect
    window.location.href = url;
    return { stop: () => void 0 };
  }

  const callbackPathHint = "/api/login/google/callback"; // substring to detect callback

  const timer = setInterval(async () => {
    // Try to hide JSON body quickly (same-origin only); wrap in try to avoid cross-origin errors mid-flow
    try {
      if (popup.location && popup.location.href.includes(callbackPathHint)) {
        // Replace visible JSON with minimal blank UI while we finish polling cookies
        if (popup.document && popup.document.body && popup.document.body.childElementCount > 0) {
          popup.document.body.style.visibility = "hidden";
        }
      }
    } catch {
      // ignore cross-origin access before it reaches our domain
    }
    try {
      const res = await axiosConfig.get(`/check`, { withCredentials: true });
  const user: GoogleUser | undefined = res?.data?.data;
      if (user?.id) {
        if (!popup.closed) popup.close();
        clearInterval(timer);
        onSuccess?.(user);
        if (redirectOnSuccess) window.location.href = redirectOnSuccess;
        return;
      }
    } catch {
      // swallow until authenticated
    }

    if (popup.closed) {
      clearInterval(timer);
      onFail?.();
    }
  }, intervalMs);

  return {
    stop: () => clearInterval(timer)
  };
}
