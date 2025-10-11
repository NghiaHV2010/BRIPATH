import type { ReactNode } from "react";
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
  // Scroll logic moved to App.tsx - only runs on app initial load
  // No need for auto scroll in Layout component

  return (
    <div className={`min-h-screen relative bg-white ${className}`}>
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? "pt-16" : ""} relative`}>
        {children}
        {authUser?.roles.role_name !== "Admin" && <ChatPopup />}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
