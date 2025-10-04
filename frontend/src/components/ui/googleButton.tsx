import { useState } from "react";
import { getGoogleLoginUrl } from "../../api/auth_api";
import { openGooglePopup } from "../../utils/googleAuth";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    openGooglePopup(getGoogleLoginUrl(), {
      redirectOnSuccess: "/",
      onSuccess: () => setLoading(false),
      onFail: () => setLoading(false),
    });
  };

  return (
    <Button
      type="button"
      variant="google"
      disabled={loading}
      onClick={handleClick}
      className="w-full"
    >
      <FcGoogle className="w-5 h-5" />
      {loading ? "Đang mở Google..." : "Đăng nhập với Google"}
    </Button>
  );
}
