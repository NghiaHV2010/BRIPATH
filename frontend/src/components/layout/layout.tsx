import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Footer } from "../ui";
import { ChatPopup } from "../chatbot/ChatPopup";
import { useAuthStore } from "@/store";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({
  children,
  showNavbar = true,
  showFooter = true,
  className = "",
}: LayoutProps) {
  const authUser = useAuthStore((s) => s.authUser);
  const location = useLocation();
  // Scroll logic moved to App.tsx - only runs on app initial load
  // No need for auto scroll in Layout component

  const hasBgClass = /\bbg-/.test(className);

  // Check if current path is a profile path
  const isProfilePath = location.pathname.startsWith('/profile');

  return (
    <div
      className={`min-h-screen relative ${hasBgClass ? className : `bg-white ${className}`
        }`}
    >
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? "pt-16" : ""} relative`}>
        {children}
        {authUser && authUser?.roles.role_name !== "Admin" && !isProfilePath && <ChatPopup />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
