import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

interface CompanyRouteProps {
    children: React.ReactNode;
}

export default function CompanyRoute({ children }: CompanyRouteProps) {
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
        } else if (!isChecking && authUser && authUser.roles.role_name !== 'Company') {
            // Redirect non-company users to their profile
            navigate("/profile", {
                replace: true,
            });
        }
    }, [authUser, isChecking, navigate, location]);

    // Don't render if not a company user
    if (!authUser || authUser.roles.role_name !== 'Company') return null;

    return <>{children}</>;
}