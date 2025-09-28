import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navbar, Footer } from "../ui";

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
  // Always scroll to top when this component mounts or updates
  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-16" : ""}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
