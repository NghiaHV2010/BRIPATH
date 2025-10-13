import { ActivityHistory } from "@/components/activity/ActivityHistory";
import Layout from "../../components/layout/layout";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cài đặt tài khoản
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Trang này đang được xây dựng. Bạn có thể bổ sung form cập nhật
              email, số điện thoại, bảo mật sau.
            </p>
            <div className="border-t pt-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Gợi ý mở rộng
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Đổi mật khẩu</li>
                <li>Bật xác thực 2 bước (2FA)</li>
                <li>Cấu hình thông báo email</li>
                <li>Quản lý phiên đăng nhập</li>
              </ul>
            </div>
          </div>
          <ActivityHistory />
        </div>
      </div>
    </Layout>
  );
}
