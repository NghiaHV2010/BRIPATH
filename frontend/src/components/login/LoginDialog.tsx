import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import GoogleButton from "../ui/googleButton";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
}

export function LoginDialog({
  open,
  onOpenChange,
  redirectTo,
}: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore(s => s.login);
  const storeError = useAuthStore(s => s.error);
  const isProcessing = useAuthStore(s => s.isProcessing);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    setError("");

    try {
      await login?.(email, password);
      setTimeout(() => {
        const currentUser = useAuthStore.getState().authUser;
        console.log("Current user after login:", currentUser);

        onOpenChange(false);
        resetForm();

        if (currentUser?.roles.role_name === "Admin") {
          console.log("Redirecting to admin dashboard");
          navigate(redirectTo || "/admin", { replace: true });
        } else {
          console.log("Redirecting to target or homepage");
          navigate(redirectTo || "/", { replace: true });
        }
      }, 500);
    } catch {
      setError(storeError || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex flex-col items-center mb-2">
            <DialogTitle className="text-2xl">Đăng nhập nhanh</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Đăng nhập để tiếp tục và trải nghiệm đầy đủ tính năng
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-11 mt-1.5"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <a
                href="/forgot-password"
                tabIndex={-1}
                className="text-xs text-blue-600 hover:underline"
                onClick={() => onOpenChange(false)}
              >
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <GoogleButton />

          <div className="text-center text-sm text-gray-600 pt-2">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              tabIndex={-1}
              className="text-blue-600 hover:underline font-medium"
              onClick={() => onOpenChange(false)}
            >
              Đăng ký ngay
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
