import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Footer } from "../ui";
import FloatingNavbar from "../ui/floating-navbar";
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

  const hasBgClass = /\bbg-/.test(className);

  // Check if current path is a profile path
  const isProfilePath = location.pathname.startsWith('/profile');

  return (
    <div
      className={`min-h-screen relative ${hasBgClass ? className : `bg-white ${className}`
        }`}
    >
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? "pt-16 pb-24 md:pb-0" : ""} relative`}>
        {children}
        {authUser && authUser?.roles.role_name !== "Admin" && !isProfilePath && <ChatPopup />}
      </main>
      {showFooter && <Footer />}

      {/* Floating Navbar for Mobile and Tablet */}
      {showNavbar && <FloatingNavbar />}
    </div>
  );
}
