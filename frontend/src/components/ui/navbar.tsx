import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "./button";
import {
  navigateToJobs,
  navigateToCompanies,
  navigateToCareerPath,
} from "../../utils/navigation";
import { useState } from "react";
import {
  LogOut,
  Settings,
  FileText,
  Bookmark,
  Briefcase,
  ChevronDown,
  Menu,
  X,
  Search,
  Building,
  Plus,
  Bell,
  BriefcaseBusiness,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { AvatarFallback } from "./avatar";
import { CompanyMenuItems, UserMenuItems } from "@/constants/profileSidebarItems";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.authUser);
  const logout = useAuthStore((s) => s.logout);
  const isCompany = useAuthStore((s) => s.isCompany);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!authUser;

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
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              BRIPATH
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToJobs(navigate)}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      Việc Làm
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToCompanies(navigate)}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      Công Ty
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToCareerPath(navigate)}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      Lộ trình nghề nghiệp
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigateToCompanies(navigate)}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    >
                      Blog
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {authUser && (
              <div
                className="rounded-full relative hover:bg-gray-100 p-2 cursor-pointer"
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
                <Bell className="size-full text-gray-500 " />
              </div>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors outline-none">
                  {authUser?.avatar_url ? (
                    <img
                      src={authUser.avatar_url}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-md">
                        {authUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {authUser?.username || authUser?.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {authUser?.roles.role_name === "User" ? (
                    UserMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.label}
                        onClick={() => navigate(item.href)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))
                  ) : authUser?.roles.role_name === "Company" ? (
                    CompanyMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.label}
                        onClick={() => navigate(item.href)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))
                  ) : null}
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
                  className="hidden sm:inline-flex"
                >
                  <Link to="/subscriptions">Nhà Tuyển Dụng</Link>
                </Button>
                <Button
                  asChild
                  variant={"default"}
                  className="hidden sm:inline-flex"
                >
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>

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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div className="px-2 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToJobs(navigate);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                Việc Làm
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateToCompanies(navigate);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                Công Ty
              </button>
              <Link
                to="/quiz"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Career Map
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blogs
              </Link>
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {authUser?.avatar_url ? (
                      <img
                        src={authUser.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-md">
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
                    className="w-full mx-3 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Button asChild className="w-full" variant="outline">
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
