import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navbar, Footer } from "../ui";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
  disableAutoScroll?: boolean;
}

export default function Layout({
  children,
  showNavbar = true,
  showFooter = true,
  className = "",
  disableAutoScroll = false,
}: LayoutProps) {
  // Scroll logic moved to App.tsx - only runs on app initial load
  // No need for auto scroll in Layout component

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-16" : ""}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
