import { Button } from "@/components/ui/button";
import { getGoogleLoginUrl } from "@/utils/googleAuth";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
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
