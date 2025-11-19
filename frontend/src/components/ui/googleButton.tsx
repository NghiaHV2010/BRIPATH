import { Button } from "@/components/ui/button";
import { getGoogleLoginUrl } from "@/utils/googleAuth";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function GoogleButton() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if redirected from Google OAuth with success
    const loginSuccess = searchParams.get('login');

    if (loginSuccess === 'success') {
      toast.success("Đăng nhập Google thành công!");
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const handleClick = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <Button
      type="button"
      variant="google"
      onClick={handleClick}
      className="w-full"
    >
      <FcGoogle className="w-5 h-5" />
      Đăng nhập với Google
    </Button>
  );
}
