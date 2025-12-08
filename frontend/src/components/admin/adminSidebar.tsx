import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Tags,
  AlertTriangle,
  X
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTitle } from "../ui/sidebar";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onClose }: AdminSidebarProps) {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout?.();
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Người dùng", icon: Users },
    { id: "companies", label: "Công ty", icon: Building2 },
    { id: "events", label: "Sự kiện", icon: Calendar },
    { id: "reports", label: "Báo cáo", icon: AlertTriangle },
    { id: "payments", label: "Thanh toán", icon: CreditCard },
    { id: "post-composer", label: "Đăng bài", icon: LayoutDashboard },
    { id: "labels", label: "Quản lý nhãn", icon: Tags },
    { id: "analytics", label: "Phân tích", icon: BarChart3 },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen) {
        const sidebar = document.getElementById('admin-sidebar');
        const target = e.target as Node;
        if (sidebar && !sidebar.contains(target)) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <SidebarTitle className="text-xl font-bold text-blue-600">
                <img
                  loading="lazy"
                  src="/assets/images/app_logo.png"
                  alt="BRIPATH Logo"
                  className="h-12"
                />
              </SidebarTitle>
              {/* Close button for mobile/tablet */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={`w-full justify-start ${activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {authUser?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {authUser?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Quản trị viên
                </p>
              </div>
            </div>

            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </SidebarMenuButton>
          </div>
        </Sidebar>
      </div>
    </>
  );
}
