import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "./button";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="ml-12 flex items-baseline space-x-6">
              <Link
                to="/jobs"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Việc Làm
              </Link>
              <Link
                to="/companies"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Công Ty
              </Link>
              <Link
                to="/quiz"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Career Map
              </Link>
              <Link
                to="/quiz"
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Blogs
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 text-sm">
                  Xin chào, {user?.username || user?.email}
                </span>
                <Button
                  variant="custom"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Đăng xuất
                </Button>
              </>
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
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <span className="text-sm text-gray-700">
                      Xin chào, {user?.username || user?.email}
                    </span>
                  </div>
                  <Button
                    variant="custom"
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
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
