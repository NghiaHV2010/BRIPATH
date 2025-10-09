import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getRevenueStats, getUserAccessStats, getPaymentStats } from "../../api/admin_api";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  CreditCard,
  Activity
} from "lucide-react";

interface StatsData {
  revenue: any;
  users: any;
  payments: any;
  loading: boolean;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    revenue: null,
    users: null,
    payments: null,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [revenueData, usersData, paymentsData] = await Promise.all([
          getRevenueStats(),
          getUserAccessStats(),
          getPaymentStats()
        ]);

        setStats({
          revenue: revenueData.data,
          users: usersData.data,
          payments: paymentsData.data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">TỔNG DOANH THU</CardTitle>
          <div className="p-2 bg-blue-500 rounded-full">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.revenue?.totalRevenue || 245000000)}
          </div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +20.1% từ tháng trước
          </p>
        </CardContent>
      </Card>

      {/* New Users */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">NGƯỜI DÙNG MỚI</CardTitle>
          <div className="p-2 bg-green-500 rounded-full">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            +{formatNumber(stats.users?.overview?.newUsersThisMonth || 2350)}
          </div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +180.1% từ tháng trước
          </p>
        </CardContent>
      </Card>

      {/* Sales */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">GIAO DỊCH</CardTitle>
          <div className="p-2 bg-yellow-500 rounded-full">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            +{formatNumber(stats.revenue?.totalTransactions || 12234)}
          </div>
          <p className="text-xs text-red-600 flex items-center mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            +19% từ tháng trước
          </p>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">HIỆU SUẤT</CardTitle>
          <div className="p-2 bg-purple-500 rounded-full">
            <Activity className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {stats.users?.overview?.activeUserRate?.toFixed(1) || 49.65}%
          </div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12% từ tháng trước
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
