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
              <>
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5V3h5v14z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    />
                  </svg>
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Avatar/Profile */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  {user && "avatar" in user && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 hidden sm:block">
                    {user?.username || user?.email?.split("@")[0]}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-600 hidden sm:block"
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
                </Link>

                {/* Logout Button */}
                <Button
                  variant="custom"
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-lg transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
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
                <div className="space-y-3">
                  {/* User Profile Mobile */}
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    {user && "avatar" in user && user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || user?.email?.split("@")[0]}
                    </span>
                  </Link>

                  {/* Notifications Mobile */}
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                      />
                    </svg>
                    Thông báo (3)
                  </button>

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
