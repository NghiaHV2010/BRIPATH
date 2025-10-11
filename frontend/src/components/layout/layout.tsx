import type { ReactNode } from "react";
import { Navbar, Footer } from "../ui";
import { ChatPopup } from "../chatbot/ChatPopup";

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
  // Scroll logic moved to App.tsx - only runs on app initial load
  // No need for auto scroll in Layout component

  return (
    <div className={`min-h-screen relative bg-white ${className}`}>
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? "pt-16" : ""} relative`}>
        {children}
        <ChatPopup />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
