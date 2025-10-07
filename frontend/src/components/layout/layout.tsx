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
  // Only scroll to top if not disabled
  useEffect(() => {
    if (!disableAutoScroll) {
      window.scrollTo(0, 0);
    }
  });

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-16" : ""}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
