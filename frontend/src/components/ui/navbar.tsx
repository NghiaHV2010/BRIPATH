import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "./button";
import { useEffect, useRef, useState } from "react";
import {
  User as UserIcon,
  LogOut,
  Settings,
  FileText,
  Bookmark,
  Briefcase,
} from "lucide-react";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const navigate = useNavigate();
  // Align with updated store keys: authUser instead of user/isAuthenticated
  const authUser = useAuthStore((s) => s.authUser);
  const logout = useAuthStore((s) => s.logout);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = !!authUser;

  const handleLogout = async () => {
    try {
      await logout?.();
      setOpenMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close on outside click or ESC
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 ${className}`}
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-20 flex items-baseline space-x-50">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-lg font-medium"
              >
                Việc Làm
              </Link>
              <Link
                to="/companies"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-lg font-medium"
              >
                Công Ty
              </Link>
              <Link
                to="/quiz"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-lg font-medium"
              >
                Career Map
              </Link>
              <Link
                to="/quiz"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-lg font-medium"
              >
                Blogs
              </Link>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={openMenu}
                >
                  {authUser?.avatar_url ? (
                    <img
                      src={authUser.avatar_url}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {authUser?.username || authUser?.email?.split("@")[0]}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in"
                    role="menu"
                  >
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" /> Cài đặt
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FileText className="w-4 h-4" /> Quản lí hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/jobs/applied");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Briefcase className="w-4 h-4" /> Việc làm đã ứng tuyển
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/jobs/saved");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <Bookmark className="w-4 h-4" /> Việc làm đã lưu
                    </button>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/subscriptions"
                  className="bg-gray-600 hover:bg-gray-700 text-white hover:text-white px-6 py-2 rounded-md text-sm font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl inline-flex items-center"
                >
                  Nhà Tuyển Dụng
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white px-6 py-2 rounded-md text-sm font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl inline-flex items-center"
                >
                  Đăng nhập / Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/jobs"
              className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Việc Làm
            </Link>
            <Link
              to="/companies"
              className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Công Ty
            </Link>
            <Link
              to="/quiz"
              className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Career Map
            </Link>
            <Link
              to="/quiz"
              className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Blogs
            </Link>

            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    {authUser?.avatar_url ? (
                      <img
                        src={authUser.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {authUser?.username || authUser?.email?.split("@")[0]}
                    </span>
                  </Link>
                  <Button
                    variant="custom"
                    onClick={handleLogout}
                    className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm rounded-md transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/subscriptions"
                    className="block bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Nhà Tuyển Dụng
                  </Link>
                  <Link
                    to="/login"
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Đăng nhập / Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
