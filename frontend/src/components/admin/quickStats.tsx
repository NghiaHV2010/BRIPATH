import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {Activity, Building2, CalendarCheck, Flag, CreditCard, Users, TrendingUp, RefreshCw} from "lucide-react";
import { getDashboardQuickStats } from "../../api/admin_api";
import { AdminCardSkeleton } from "./AdminCardSkeleton";
import { Skeleton } from "../ui/skeleton";

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardQuickStats();
        setStats(response.data);
        setLastUpdated(new Date());
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
      <AdminCardSkeleton
        title="Thống kê nhanh"
        icon={<Activity className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50/60 p-4"
            >
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-6 w-20" />
            </div>
          ))}
        </div>
      </AdminCardSkeleton>
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

  const statItems = [
    {
      label: "Công ty chờ duyệt",
      value: stats.pendingCompanies,
      icon: Building2,
      tone: "text-amber-600",
      pill: "bg-amber-50 text-amber-700",
      hint: "Cần xử lý sớm",
    },
    {
      label: "Sự kiện chờ duyệt",
      value: stats.pendingEvents,
      icon: CalendarCheck,
      tone: "text-amber-600",
      pill: "bg-amber-50 text-amber-700",
      hint: "Đảm bảo lịch diễn ra",
    },
    {
      label: "Báo cáo chờ duyệt",
      value: stats.pendingReports,
      icon: Flag,
      tone: "text-amber-600",
      pill: "bg-amber-50 text-amber-700",
      hint: "Ưu tiên kiểm tra",
    },
    {
      label: "Giao dịch hôm nay",
      value: stats.todayTransactions,
      icon: CreditCard,
      tone: "text-emerald-600",
      pill: "bg-emerald-50 text-emerald-700",
      hint: "Đang xử lý",
    },
    {
      label: "Người dùng mới hôm nay",
      value: stats.todayNewUsers,
      icon: Users,
      tone: "text-blue-600",
      pill: "bg-blue-50 text-blue-700",
      hint: "Tiềm năng mới",
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      tone: "text-purple-600",
      pill: "bg-purple-50 text-purple-700",
      hint: "So với tuần trước",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Thống kê nhanh
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <RefreshCw className="h-3.5 w-3.5" />
              Cập nhật {getTimeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-full ${item.pill} p-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {item.hint}
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-500">{item.label}</p>
                <p className={`mt-1 text-2xl font-semibold tabular-nums ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

