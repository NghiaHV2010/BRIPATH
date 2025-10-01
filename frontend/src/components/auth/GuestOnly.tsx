import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

interface GuestOnlyProps {
  children: ReactNode;
}

// Blocks access to auth pages for logged-in users
export default function GuestOnly({ children }: GuestOnlyProps) {
  const authUser = useAuthStore((s) => s.authUser);
  const isChecking = useAuthStore((s) => s.isCheckingAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isChecking && authUser) {
      navigate("/", { replace: true });
    }
  }, [authUser, isChecking, navigate]);

  if (authUser) return null; // momentary blank while redirecting
  return <>{children}</>;
}
