import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getRevenueStats, getUserAccessStats, getPaymentStats } from "../../api/admin_api";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CreditCard,
  Activity,
} from "lucide-react";
import { AdminCardSkeleton } from "./AdminCardSkeleton";
import { AdminEmptyState } from "./AdminEmptyState";
import { Skeleton } from "../ui/skeleton";

interface StatsData {
  revenue: any;
  users: any;
  payments: any;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [revenueData, usersData, paymentsData] = await Promise.all([
          getRevenueStats(),
          getUserAccessStats(),
          getPaymentStats(),
        ]);

        setStats({
          revenue: revenueData.data,
          users: usersData.data,
          payments: paymentsData.data,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Tổng doanh thu", "Người dùng mới", "Giao dịch", "Hiệu suất"].map((title) => (
          <AdminCardSkeleton key={title} title={title} icon={<Skeleton className="h-4 w-4 rounded-full" />}>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </AdminCardSkeleton>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thống kê tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            icon={Activity}
            title="Không thể tải thống kê"
            description="Vui lòng thử làm mới trang hoặc kiểm tra lại kết nối."
          />
        </CardContent>
      </Card>
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
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between w-full">
            <span>TỔNG DOANH THU</span>
            {lastUpdated && (
              <span className="text-[11px] font-normal text-gray-500">
                {`Cập nhật ${lastUpdated.toLocaleTimeString("vi-VN")}`}
              </span>
            )}
          </CardTitle>
          <div className="p-2 bg-blue-500 rounded-full">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.revenue?.totalRevenue || 0)}
          </div>
          {stats.revenue?.growthRate !== undefined && (
            <p className={`text-xs flex items-center mt-1 ${stats.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.growthRate >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {stats.revenue.growthRate >= 0 ? '+' : ''}{stats.revenue.growthRate.toFixed(1)}% từ tháng trước
            </p>
          )}
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
            +{formatNumber(stats.users?.overview?.newUsersThisMonth || 0)}
          </div>
          {stats.users?.overview?.newUsersGrowthRate !== undefined && (
            <p className={`text-xs flex items-center mt-1 ${stats.users.overview.newUsersGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.users.overview.newUsersGrowthRate >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {stats.users.overview.newUsersGrowthRate >= 0 ? '+' : ''}{stats.users.overview.newUsersGrowthRate.toFixed(1)}% từ tháng trước
            </p>
          )}
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
            +{formatNumber(stats.revenue?.totalTransactions || 0)}
          </div>
          {stats.revenue?.transactionsGrowthRate !== undefined && (
            <p className={`text-xs flex items-center mt-1 ${stats.revenue.transactionsGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.transactionsGrowthRate >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {stats.revenue.transactionsGrowthRate >= 0 ? '+' : ''}{stats.revenue.transactionsGrowthRate.toFixed(1)}% từ tháng trước
            </p>
          )}
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
            {stats.users?.overview?.activeUserRate?.toFixed(1) || 0}%
          </div>
          {stats.users?.overview?.activeUserRateGrowth !== undefined && (
            <p className={`text-xs flex items-center mt-1 ${stats.users.overview.activeUserRateGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.users.overview.activeUserRateGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {stats.users.overview.activeUserRateGrowth >= 0 ? '+' : ''}{stats.users.overview.activeUserRateGrowth.toFixed(1)}% từ tháng trước
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
