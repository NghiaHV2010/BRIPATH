import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity, Loader2 } from "lucide-react";
import { getDashboardQuickStats } from "../../api/admin_api";

interface QuickStatsData {
  pendingCompanies: number;
  pendingEvents: number;
  pendingReports: number;
  todayTransactions: number;
  todayNewUsers: number;
  conversionRate: number;
}

export default function QuickStats() {
  const [stats, setStats] = useState<QuickStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardQuickStats();
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching quick stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thống kê nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thống kê nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <span className="font-semibold text-yellow-600">{stats.pendingCompanies}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sự kiện chờ duyệt</span>
            <span className="font-semibold text-yellow-600">{stats.pendingEvents}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Báo cáo chờ duyệt</span>
            <span className="font-semibold text-yellow-600">{stats.pendingReports}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Giao dịch hôm nay</span>
            <span className="font-semibold text-green-600">{stats.todayTransactions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Người dùng mới hôm nay</span>
            <span className="font-semibold text-blue-600">{stats.todayNewUsers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
            <span className="font-semibold text-purple-600">{stats.conversionRate.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

