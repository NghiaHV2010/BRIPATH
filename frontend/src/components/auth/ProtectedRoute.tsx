import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authUser = useAuthStore((s) => s.authUser);
  const isChecking = useAuthStore((s) => s.isCheckingAuth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isChecking && !authUser) {
      navigate("/", {
        replace: true,
        state: { redirectTo: location.pathname + location.search },
      });
    }
  }, [authUser, isChecking, navigate, location]);

  if (!authUser) return null;
  return <>{children}</>;
}
