import { Bell, Menu } from "lucide-react";
import { Button } from "../ui/button";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile/Tablet menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bảng điều khiển quản trị
            </h2>
            <p className="text-sm text-gray-500">
              Chào mừng trở lại, quản trị viên
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
