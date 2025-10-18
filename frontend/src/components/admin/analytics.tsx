import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getRevenueStats, getUserAccessStats, getPaymentStats } from "../../api/admin_api";
import { 
  Users, 
  DollarSign,
  Activity
} from "lucide-react";

interface AnalyticsData {
  revenue: any;
  users: any;
  payments: any;
  loading: boolean;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    revenue: null,
    users: null,
    payments: null,
    loading: true
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [revenueData, usersData, paymentsData] = await Promise.all([
          getRevenueStats(),
          getUserAccessStats(),
          getPaymentStats(30)
        ]);

        setData({
          revenue: revenueData.data,
          users: usersData.data,
          payments: paymentsData.data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (data.loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Phân tích doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold">{formatCurrency(data.revenue?.totalRevenue || 0)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tháng này</p>
              <p className="text-2xl font-bold">{formatCurrency(data.revenue?.currentMonthRevenue || 0)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tăng trưởng</p>
              <p className={`text-2xl font-bold ${(data.revenue?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.revenue?.growthRate?.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Giao dịch</p>
              <p className="text-2xl font-bold">{formatNumber(data.revenue?.totalTransactions || 0)}</p>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Doanh thu theo tháng (12 tháng gần nhất)</h4>
            <div className="space-y-2">
              {data.revenue?.monthlyRevenue?.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (month.revenue / Math.max(...(data.revenue?.monthlyRevenue?.map((m: any) => m.revenue) || [1]))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold w-24 text-right">{formatCurrency(month.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Gateway */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Doanh thu theo cổng thanh toán</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.revenue?.revenueByGateway?.map((gateway: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{gateway.gateway}</span>
                    <span className="text-sm text-gray-500">{gateway.transactions} giao dịch</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(gateway.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Phân tích người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold">{formatNumber(data.users?.overview?.totalActiveUsers || 0)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Đã đăng nhập</p>
              <p className="text-2xl font-bold">{formatNumber(data.users?.overview?.totalUsersLoggedIn || 0)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hoạt động</p>
              <p className="text-2xl font-bold">{data.users?.overview?.activeUserRate?.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Người dùng mới</p>
              <p className="text-2xl font-bold">{formatNumber(data.users?.overview?.newUsersThisMonth || 0)}</p>
            </div>
          </div>

          {/* Daily User Activity */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Hoạt động người dùng (7 ngày gần nhất)</h4>
            <div className="space-y-2">
              {data.users?.dailyStats?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (day.users / Math.max(...(data.users?.dailyStats?.map((d: any) => d.users) || [1]))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold w-16 text-right">{formatNumber(day.users)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Phân tích thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold">
                {formatNumber(data.payments?.statusStats?.reduce((sum: number, item: any) => sum + item.count, 0) || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold">
                {formatCurrency(data.payments?.statusStats?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ thành công</p>
              <p className="text-2xl font-bold">
                {(() => {
                  const total = data.payments?.statusStats?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
                  const success = data.payments?.statusStats?.find((s: any) => s.status === 'success')?.count || 0;
                  return total > 0 ? ((success / total) * 100).toFixed(1) : 0;
                })()}%
              </p>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Phân tích theo trạng thái</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.payments?.statusStats?.map((status: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{status.status}</span>
                    <span className="text-sm text-gray-500">{formatNumber(status.count)} giao dịch</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(status.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
