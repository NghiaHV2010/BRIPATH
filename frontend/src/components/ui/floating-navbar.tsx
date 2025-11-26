"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Briefcase,
    Building2,
    Calendar,
    Map,
    BookOpen,
    CreditCard,
    LogOut,
    User,
    Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
    navigateToJobs,
    navigateToCompanies,
    navigateToCareerPath,
    navigateToSubscription,
    navigateToBlog,
    navigateToEvent,
} from "@/utils/navigation";
import { AvatarFallback } from "./avatar";
import {
    CompanyMenuItems,
    UserMenuItems,
} from "@/constants/profileSidebarItems";

export default function FloatingNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const authUser = useAuthStore((s) => s.authUser);
    const logout = useAuthStore((s) => s.logout);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isAuthenticated = !!authUser;

    const isRouteActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await logout?.();
            navigate("/login");
            setProfileOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navigationItems = [
        {
            label: "Việc Làm",
            icon: Briefcase,
            onClick: () => navigateToJobs(navigate),
            path: "/jobs",
        },
        {
            label: "Công Ty",
            icon: Building2,
            onClick: () => navigateToCompanies(navigate),
            path: "/companies",
        },
        {
            label: "Sự kiện",
            icon: Calendar,
            onClick: () => navigateToEvent(navigate),
            path: "/event",
        },
        {
            label: "Lộ trình nghề nghiệp",
            icon: Map,
            onClick: () => navigateToCareerPath(navigate),
            path: "/quiz",
        },
        {
            label: "Blog",
            icon: BookOpen,
            onClick: () => navigateToBlog(navigate),
            path: "/blog",
        },
        {
            label: "Gói dịch vụ",
            icon: CreditCard,
            onClick: () => navigateToSubscription(navigate),
            path: "/subscription",
        },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
            <nav className="flex items-center justify-center space-x-1 sm:space-x-4 rounded-full border bg-white/95 backdrop-blur-md p-2 shadow-lg">
                {/* Jobs Button */}
                <Button
                    variant={isRouteActive("/jobs") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToJobs(navigate)}
                >
                    <Briefcase className="h-5 w-5" />
                    <span className="sr-only">Việc làm</span>
                </Button>

                {/* Companies Button */}
                <Button
                    variant={isRouteActive("/companies") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToCompanies(navigate)}
                >
                    <Building2 className="h-5 w-5" />
                    <span className="sr-only">Công ty</span>
                </Button>

                {/* Events Button */}
                <Button
                    variant={isRouteActive("/event") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToEvent(navigate)}
                >
                    <Calendar className="h-5 w-5" />
                    <span className="sr-only">Sự kiện</span>
                </Button>

                {/* Center - Profile Avatar (if authenticated) or Menu Button (if not) */}
                {isAuthenticated ? (
                    <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                size="icon"
                                className="rounded-full bg-white/50  text-white p-1 border! border-gray-300!"
                            >
                                {authUser?.avatar_url ? (
                                    <img
                                        src={authUser.avatar_url}
                                        alt="Avatar"
                                        className="size-full rounded-full object-contain"
                                    />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                                <span className="sr-only">Tài khoản</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 z-100">
                            <SheetHeader className="p-6 border-b bg-linear-to-br from-blue-50 to-blue-100">
                                <SheetTitle className="text-left text-xl font-bold">Tài khoản</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(85vh-80px)]">
                                <div className="px-6 py-4">
                                    {/* User Profile Section */}
                                    <div className="mb-6 pb-6 border-b">
                                        <div className="flex items-center gap-3 mb-4">
                                            {authUser?.avatar_url ? (
                                                <img
                                                    src={authUser.avatar_url}
                                                    alt="Avatar"
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                    <AvatarFallback className="text-white text-lg font-semibold">
                                                        {authUser?.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {authUser?.username || authUser?.email?.split("@")[0]}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {authUser?.roles?.role_name}
                                                </p>
                                            </div>
                                            {/* Notification Badge */}
                                            <div
                                                className="rounded-full relative p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => {
                                                    navigate("/profile/notifications");
                                                    setProfileOpen(false);
                                                }}
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
                                        </div>

                                        {/* Profile Menu Items */}
                                        <div className="space-y-1">
                                            {authUser?.roles.role_name === "User"
                                                ? UserMenuItems.map((item) => (
                                                    <button
                                                        key={item.label}
                                                        onClick={() => {
                                                            navigate(item.href);
                                                            setProfileOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-blue-50 transition-colors"
                                                    >
                                                        <span className="text-blue-600">{item.icon}</span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {item.label}
                                                        </span>
                                                    </button>
                                                ))
                                                : authUser?.roles.role_name === "Company"
                                                    ? CompanyMenuItems.map((item) => (
                                                        <button
                                                            key={item.label}
                                                            onClick={() => {
                                                                navigate(item.href);
                                                                setProfileOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-blue-50 transition-colors"
                                                        >
                                                            <span className="text-blue-600">{item.icon}</span>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {item.label}
                                                            </span>
                                                        </button>
                                                    ))
                                                    : null}
                                        </div>
                                    </div>

                                    {/* Logout Button */}
                                    <div className="pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={handleLogout}
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                size="icon"
                                className="rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                            >
                                <Plus className="h-6 w-6" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
                            <SheetHeader className="p-6 border-b bg-linear-to-br from-emerald-50 to-teal-50">
                                <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(85vh-80px)]">
                                <div className="px-6 py-4">
                                    {/* Navigation Items */}
                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                                            Khám phá
                                        </h3>
                                        {navigationItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = isRouteActive(item.path);
                                            return (
                                                <button
                                                    key={item.label}
                                                    onClick={() => {
                                                        item.onClick();
                                                        setMenuOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive
                                                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Auth Actions */}
                                    <div className="space-y-2 pt-4 border-t">
                                        <Button
                                            className="w-full bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                            onClick={() => {
                                                navigate("/register");
                                                setMenuOpen(false);
                                            }}
                                        >
                                            Đăng ký
                                        </Button>
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => {
                                                navigate("/login");
                                                setMenuOpen(false);
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                )}

                {/* Quiz/Career Path Button */}
                <Button
                    variant={isRouteActive("/quiz") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToCareerPath(navigate)}
                >
                    <Map className="h-5 w-5" />
                    <span className="sr-only">Lộ trình nghề nghiệp</span>
                </Button>

                {/* Blog Button */}
                <Button
                    variant={isRouteActive("/blog") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToBlog(navigate)}
                >
                    <BookOpen className="h-5 w-5" />
                    <span className="sr-only">Blog</span>
                </Button>

                {/* Subscription Button */}
                <Button
                    variant={isRouteActive("/subscription") ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full shadow-none"
                    onClick={() => navigateToSubscription(navigate)}
                >
                    <CreditCard className="h-5 w-5" />
                    <span className="sr-only">Gói dịch vụ</span>
                </Button>
            </nav>
        </div>
    );
}