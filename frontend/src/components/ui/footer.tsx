import { Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo và thông tin chính */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold text-blue-600">BRIPATH</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Nền tảng định hướng nghề nghiệp thông minh với AI
            </p>
            <div className="flex space-x-4 items-center">
              <a href="https://www.facebook.com/profile.php?id=61581492766243" target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors bg-[#565ef2] rounded-full flex items-center justify-center p-1">
                <Facebook className="size-4 text-white" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cột BRIPATH */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">BRIPATH</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Về BRIPATH
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/career-guide" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Chỉ dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Trợ giúp
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột Ứng viên */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ứng viên</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/career-test" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Việc làm phù hợp
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Tạo hồ sơ
                </Link>
              </li>
              <li>
                <Link to="/career-map" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Career Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột Nhà tuyển dụng */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Nhà tuyển dụng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/employer-register" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Đăng tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/employer-search" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Đăng ký nhà tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/employer-guide" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Hướng dẫn dành sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} BRIPATH. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                Chính sách Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}