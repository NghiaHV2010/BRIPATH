import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "./button";
import {
  navigateToJobs,
  navigateToCompanies,
  navigateToCareerPath,
  navigateToSubscription,
  navigateToBlog,
  navigateToEvent,
} from "../../utils/navigation";
import { LogOut, ChevronDown, Bell } from "lucide-react";
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
  const authUser = useAuthStore(s => s.authUser);
  const logout = useAuthStore(s => s.logout);

  const isAuthenticated = !!authUser;

  const isRouteActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getNavItemClass = (path: string) => {
    const isActive = isRouteActive(path);

    return `
    group inline-flex h-10 w-max items-center justify-center rounded-md px-3 lg:px-4 py-2 text-sm font-medium 
    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 active:scale-105
    ${isActive
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
          <div className="shrink-0">
            <Link to="/" className="text-xl font-bold">
              <img
                loading="lazy"
                src="/assets/images/app_logo.png"
                alt="BRIPATH Logo"
                className="h-12"
              />
            </Link>
          </div>

          {/* Navigation Menu - Desktop Only */}
          <div className="hidden lg:flex items-center">
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
                      onClick={() => navigateToEvent(navigate)}
                      className={getNavItemClass("/event")}
                    >
                      Sự kiện
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

          {/* Auth Section - All Screens */}
          <div className="flex items-center gap-2 sm:gap-4">
            {authUser && (
              <div
                className="rounded-full relative p-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 hover:bg-gray-100 transition-colors"
                onClick={() => navigate("/profile/notifications")}
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
                      <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-600 text-white text-md">
                        {authUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    <p className="line-clamp-1">
                      {authUser?.username || authUser?.email?.split("@")[0]}
                    </p>
                  </span>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {authUser?.roles.role_name === "User"
                    ? UserMenuItems.map(item => (
                      <DropdownMenuItem
                        key={item.label}
                        onClick={() => navigate(item.href)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    ))
                    : authUser?.roles.role_name === "Company"
                      ? CompanyMenuItems.map(item => (
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
                  size="sm"
                  className="text-xs sm:text-sm bg-transparent"
                >
                  <Link to="/register">Đăng ký</Link>
                </Button>
                <Button
                  asChild
                  variant={"default"}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
