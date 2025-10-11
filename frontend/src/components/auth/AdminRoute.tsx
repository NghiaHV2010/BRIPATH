import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const authUser = useAuthStore((s) => s.authUser);
  const isChecking = useAuthStore((s) => s.isCheckingAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChecking && !authUser) {
      navigate("/login", {
        replace: true,
        state: { redirectTo: "/admin" },
      });
    } else if (!isChecking && authUser && authUser.roles.role_name !== "Admin") {
      // Check if user is Admin
      navigate("/", { replace: true });
    }
  }, [authUser, isChecking, navigate]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang kiểm tra quyền...</span>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!authUser || authUser.role !== "Admin") {
    return null;
  }

  return <>{children}</>;
}
