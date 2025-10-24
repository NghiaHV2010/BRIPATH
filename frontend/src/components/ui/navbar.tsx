"use client";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "./button";
import {
  navigateToJobs,
  navigateToCompanies,
  navigateToCareerPath,
  navigateToSubscription,
  navigateToBlog,
} from "../../utils/navigation";
import { useState } from "react";
import { LogOut, ChevronDown, Menu, X, Bell } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { AvatarFallback } from "./avatar";
import {
  CompanyMenuItems,
  UserMenuItems,
} from "@/constants/profileSidebarItems";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAuthStore((s) => s.authUser);
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!authUser;

  const isRouteActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getNavItemClass = (path: string) => {
    const isActive = isRouteActive(path);

    return `
    group inline-flex h-10 w-max items-center justify-center rounded-md px-3 lg:px-4 py-2 text-sm font-medium 
    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 active:scale-105
    ${
      isActive
        ? "text-blue-700  scale-120 cursor-default hover:!text-blue-700 hover:!scale-115"
        : "text-gray-700 hover:text-blue-700 hover:scale-100"
    }
  `;
  };

  const handleLogout = async () => {
    try {
      await logout?.();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 ${className}`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl sm:text-4xl font-bold">
              BRIPATH
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-3 lg:gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToJobs(navigate)}
                      className={getNavItemClass("/jobs")}
                    >
                      Việc Làm
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToCompanies(navigate)}
                      className={getNavItemClass("/companies")}
                    >
                      Công Ty
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToCareerPath(navigate)}
                      className={getNavItemClass("/quiz")}
                    >
                      Lộ trình nghề nghiệp
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToBlog(navigate)}
                      className={getNavItemClass("/blog")}
                    >
                      Blog
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToSubscription(navigate)}
                      className={getNavItemClass("/subscription")}
                    >
                      Gói dịch vụ
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {authUser && (
              <div
                className="rounded-full relative p-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                onClick={() => navigate("/notifications")}
              >
                {authUser?._count &&
                  authUser?._count?.userNotifications > 0 && (
                    <div className="absolute top-0 right-0 size-4 bg-red-500 rounded-full flex items-center justify-center">
                      <p className="text-xs text-white">
                        {authUser._count.userNotifications}
                      </p>
                    </div>
                  )}
                <Bell className="size-5 text-gray-500" />
              </div>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                  {authUser?.avatar_url ? (
                    <img
                      src={authUser.avatar_url || "/placeholder.svg"}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-md">
                        {authUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    <p className=" line-clamp-1">
                      {authUser?.username || authUser?.email?.split("@")[0]}
                    </p>
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {authUser?.roles.role_name === "User"
                    ? UserMenuItems.map((item) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={() => navigate(item.href)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))
                    : authUser?.roles.role_name === "Company"
                    ? CompanyMenuItems.map((item) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={() => navigate(item.href)}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))
                    : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="hidden sm:inline-flex text-sm bg-transparent"
                >
                  <Link to="/subscriptions">Nhà Tuyển Dụng</Link>
                </Button>
                <Button
                  asChild
                  variant={"default"}
                  className="hidden sm:inline-flex text-sm"
                >
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div className="px-2 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToJobs(navigate);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isRouteActive("/jobs")
                    ? "bg-emerald-100 text-emerald-700 font-semibold scale-105"
                    : "text-gray-600"
                }`}
              >
                Việc Làm
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToCompanies(navigate);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isRouteActive("/companies")
                    ? "bg-emerald-100 text-emerald-700 font-semibold scale-105"
                    : "text-gray-600"
                }`}
              >
                Công Ty
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToCareerPath(navigate);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isRouteActive("/quiz")
                    ? "bg-emerald-100 text-emerald-700 font-semibold scale-105"
                    : "text-gray-600"
                }`}
              >
                Lộ trình nghề nghiệp
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToBlog(navigate);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isRouteActive("/blog")
                    ? "bg-emerald-100 text-emerald-700 font-semibold scale-105"
                    : "text-gray-600"
                }`}
              >
                Blog
              </button>
              {authUser?.roles?.role_name === "Company" && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateToSubscription(navigate);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isRouteActive("/subscription")
                      ? "bg-emerald-100 text-emerald-700 font-semibold scale-105"
                      : "text-gray-600"
                  }`}
                >
                  Gói dịch vụ
                </button>
              )}
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {authUser?.avatar_url ? (
                      <img
                        src={authUser.avatar_url || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-md">
                          {authUser?.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {authUser?.username || authUser?.email?.split("@")[0]}
                    </span>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mx-3 text-red-600 border-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Button
                    asChild
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    <Link
                      to="/subscriptions"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Nhà Tuyển Dụng
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
