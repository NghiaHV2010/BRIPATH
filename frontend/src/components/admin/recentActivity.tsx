import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {TrendingUp, CheckCircle2, AlertTriangle, UserPlus, Building2, FileWarning, RefreshCw} from "lucide-react";
import { getRecentActivities } from "../../api/admin_api";
import { AdminCardSkeleton } from "./AdminCardSkeleton";
import { Skeleton } from "../ui/skeleton";

interface Activity {
  type: string;
  message: string;
  time: string;
  color: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getRecentActivities();
        setActivities(response.data || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  type ActivityMeta = { icon: LucideIcon; badge: string; badgeClass: string };

  const activityMeta: Record<string, ActivityMeta> = {
    success: {
      icon: CheckCircle2,
      badge: "Hoàn tất",
      badgeClass: "bg-emerald-50 text-emerald-700",
    },
    warning: {
      icon: AlertTriangle,
      badge: "Cảnh báo",
      badgeClass: "bg-amber-50 text-amber-700",
    },
    user: {
      icon: UserPlus,
      badge: "Người dùng",
      badgeClass: "bg-blue-50 text-blue-700",
    },
    company: {
      icon: Building2,
      badge: "Doanh nghiệp",
      badgeClass: "bg-slate-50 text-slate-700",
    },
    report: {
      icon: FileWarning,
      badge: "Báo cáo",
      badgeClass: "bg-purple-50 text-purple-700",
    },
  };

  const getActivityMeta = (type: string) => {
    return activityMeta[type] || {
      icon: TrendingUp,
      badge: "Hệ thống",
      badgeClass: "bg-gray-100 text-gray-600",
    };
  };

  if (loading) {
    return (
      <AdminCardSkeleton
        title="Hoạt động gần đây"
        icon={<TrendingUp className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </AdminCardSkeleton>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hoạt động gần đây
          </span>
          {lastUpdated && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Cập nhật {getTimeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <TrendingUp className="h-6 w-6 mb-2 text-gray-400" />
            <p>Hiện chưa có hoạt động nào gần đây</p>
            <p className="text-sm text-gray-400">Hệ thống sẽ tự động cập nhật khi có thay đổi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const meta = getActivityMeta(activity.type);
              const Icon = meta.icon;
              return (
                <div
                  key={`${activity.time}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                >
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm`}>
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    {index !== activities.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-gradient-to-b from-gray-200 to-transparent" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.badgeClass}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getTimeAgo(activity.time)}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-400 uppercase tracking-wide">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                  <span className={`mt-1 h-2 w-2 rounded-full ${getColorClass(activity.color)}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

