import { useState } from "react";
import AdminSidebar from "./adminSidebar";
import AdminHeader from "./adminHeader";
import DashboardStats from "./dashboardStats";
import CompanyManagement from "./companyManagement";
import EventsManagement from "./eventsManagement";
import PaymentsManagement from "./paymentsManagement";
import Analytics from "./analytics";
import UserManagement from "./userManagement";
import RevenueCharts from "./revenueCharts";
import LabelManagement from "./labelManagement";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Settings,
  TrendingUp,
  Activity
} from "lucide-react";
import { PostComposer } from "../ui/PostComposer";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
            case "dashboard":
              return (
                <div className="space-y-6">
                  <DashboardStats />
                  <RevenueCharts />
                  
                  {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Công ty ABC đã được duyệt</p>
                        <p className="text-xs text-gray-500">2 giờ trước</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Giao dịch mới: 500,000 VND</p>
                        <p className="text-xs text-gray-500">4 giờ trước</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sự kiện mới chờ duyệt</p>
                        <p className="text-xs text-gray-500">6 giờ trước</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Người dùng mới đăng ký</p>
                        <p className="text-xs text-gray-500">1 ngày trước</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Thống kê nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Công ty chờ duyệt</span>
                      <span className="font-semibold text-yellow-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sự kiện chờ duyệt</span>
                      <span className="font-semibold text-yellow-600">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Giao dịch hôm nay</span>
                      <span className="font-semibold text-green-600">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Người dùng mới</span>
                      <span className="font-semibold text-blue-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                      <span className="font-semibold text-purple-600">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case "companies":
        return <CompanyManagement />;
      
      case "users":
        return <UserManagement />;
      
      case "events":
        return <EventsManagement />;
      
      case "payments":
        return <PaymentsManagement />;
      
      case "post-composer":
        return (
          <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
              <div>
                <PostComposer userName="Admin" userAvatar="/default-avatar.png" />
              </div>
              <aside className="hidden lg:block space-y-4">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Gợi ý khi đăng</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Thêm ảnh chất lượng (≤ 5MB), định dạng JPG/PNG.</li>
                    <li>• Dùng tiêu đề rõ ràng, nội dung ngắn gọn.</li>
                    <li>• Gắn hashtag phù hợp (#hiring #remote ...).</li>
                  </ul>
                </div>
                <div className="bg-white rounded-2xl shadow border p-4">
                  <h4 className="text-sm font-semibold mb-2">Tài nguyên</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Quy định nội dung cộng đồng</p>
                    <p>Size ảnh khuyến nghị: 1200×628px</p>
                    <p>Mẹo tăng tương tác với hình ảnh</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        );
      
      case "labels":
        return <LabelManagement />;
      
      case "analytics":
        return <Analytics />;
      
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Chức năng cài đặt hệ thống đang được phát triển...</p>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Trang không tìm thấy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Trang bạn đang tìm kiếm không tồn tại.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === "dashboard" && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Tổng quan về hoạt động của hệ thống</p>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
