import { useState, useEffect } from "react";
import {
  MessageSquareWarning,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getUserReports, type Report } from "@/api/user_api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

type ReportStatus = "pending" | "approved" | "rejected";

// Cấu hình cho từng trạng thái phản ánh
const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    icon: Clock,
    colors: {
      badge: "bg-yellow-100 text-yellow-800",
      box: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
    },
    message: {
      title: "Phản ánh đang chờ xử lý",
      desc: "Vui lòng đợi quản trị viên xem xét phản ánh của bạn.",
    },
    emptyText: "Bạn chưa có phản ánh nào đang chờ xử lý.",
  },
  approved: {
    label: "Chấp nhận",
    icon: CheckCircle,
    colors: {
      badge: "bg-green-100 text-green-800",
      box: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: "text-green-600",
    },
    message: {
      title: "Phản ánh đã được chấp nhận",
      desc: "Cảm ơn bạn đã đóng góp. Phản ánh của bạn đã được xem xét và chấp nhận.",
    },
    emptyText: "Bạn chưa có phản ánh nào được duyệt.",
  },
  rejected: {
    label: "Từ chối",
    icon: XCircle,
    colors: {
      badge: "bg-red-100 text-red-800",
      box: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
    },
    message: {
      title: "Phản ánh đã bị từ chối",
      desc: "Phản ánh của bạn không được chấp nhận. Vui lòng kiểm tra lại nội dung.",
    },
    emptyText: "Bạn chưa có phản ánh nào bị từ chối.",
  },
} as const;

// Component hiển thị badge trạng thái
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status.toLowerCase() as ReportStatus];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <Badge className={`${config.colors.badge} hover:${config.colors.badge}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Component hiển thị thông báo trạng thái
const StatusMessage = ({ status }: { status: ReportStatus }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`${config.colors.box} border rounded-lg p-3 flex items-start gap-2`}
    >
      <Icon className={`w-5 h-5 ${config.colors.icon} mt-0.5 shrink-0`} />
      <div className={`text-sm ${config.colors.text}`}>
        <p className="font-medium">{config.message.title}</p>
        <p className="opacity-90">{config.message.desc}</p>
      </div>
    </div>
  );
};

// Component hiển thị trạng thái rỗng
const EmptyState = ({ status }: { status: ReportStatus }) => (
  <div className="text-center py-12">
    <div className="mb-6 flex justify-center">
      <DotLottieReact
        src="/animations/Bouncy Fail.json"
        loop
        autoplay
        className="w-32 h-32"
      />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Không có phản ánh
    </h3>
    <p className="text-gray-600">{STATUS_CONFIG[status].emptyText}</p>
  </div>
);

// Component hiển thị card phản ánh
const ReportCard = ({ report }: { report: Report }) => {
  const createdDate = report.created_at ? new Date(report.created_at) : null;
  const updatedDate = report.updated_at ? new Date(report.updated_at) : null;
  const isValidCreatedDate = createdDate && !isNaN(createdDate.getTime());
  const isValidUpdatedDate = updatedDate && !isNaN(updatedDate.getTime());
  const hasUpdated =
    isValidUpdatedDate &&
    isValidCreatedDate &&
    updatedDate.getTime() !== createdDate.getTime();

  return (
    <Card className="border hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {/* Tiêu đề và badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-emerald-600" />
                {report.title}
              </h3>
              {isValidCreatedDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Gửi lúc:{" "}
                  {format(createdDate, "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              )}
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Nội dung phản ánh */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Thông báo trạng thái */}
          <StatusMessage status={report.status.toLowerCase() as ReportStatus} />

          {/* Thời gian cập nhật */}
          {hasUpdated && (
            <p className="text-xs text-gray-400 text-right">
              Cập nhật:{" "}
              {format(updatedDate, "dd/MM/yyyy HH:mm", { locale: vi })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportStatus>("pending");
  const [reports, setReports] = useState<Record<ReportStatus, Report[]>>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState<Record<ReportStatus, boolean>>({
    pending: true,
    approved: true,
    rejected: true,
  });
  const [currentPage, setCurrentPage] = useState<Record<ReportStatus, number>>({
    pending: 1,
    approved: 1,
    rejected: 1,
  });
  const [totalPages, setTotalPages] = useState<Record<ReportStatus, number>>({
    pending: 1,
    approved: 1,
    rejected: 1,
  });

  const loadReports = async (status: ReportStatus, page?: number) => {
    try {
      setIsLoading(prev => ({ ...prev, [status]: true }));
      const pageToLoad = page || currentPage[status];
      const response = await getUserReports(pageToLoad);

      const filteredReports = response.data.filter(
        (report: Report) => report.status.toLowerCase() === status
      );

      setReports(prev => ({ ...prev, [status]: filteredReports }));
      setTotalPages(prev => ({ ...prev, [status]: response.totalPages }));
    } catch (error) {
      console.error(`Error loading ${status} reports:`, error);
      toast.error("Không thể tải danh sách phản ánh");
    } finally {
      setIsLoading(prev => ({ ...prev, [status]: false }));
    }
  };

  // Load tất cả reports khi component mount
  useEffect(() => {
    (["pending", "approved", "rejected"] as ReportStatus[]).forEach(status => {
      loadReports(status);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load lại khi chuyển trang
  useEffect(() => {
    if (currentPage[activeTab] > 1) {
      loadReports(activeTab, currentPage[activeTab]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleTabChange = (value: string) =>
    setActiveTab(value as ReportStatus);

  const handlePageChange = (status: ReportStatus, newPage: number) => {
    setCurrentPage(prev => ({ ...prev, [status]: newPage }));
    loadReports(status, newPage);
  };

  // Render danh sách phản ánh với phân trang
  const renderReportList = (status: ReportStatus) => {
    const currentReports = reports[status];
    const loading = isLoading[status];
    const currentPageNum = currentPage[status];
    const totalPagesNum = totalPages[status];

    // Đang tải
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      );
    }

    // Không có dữ liệu
    if (currentReports.length === 0) {
      return <EmptyState status={status} />;
    }

    return (
      <>
        <div className="space-y-4">
          {currentReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {/* Phân trang */}
        {totalPagesNum > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              {/* Nút Previous */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPageNum > 1 &&
                    handlePageChange(status, currentPageNum - 1)
                  }
                  className={
                    currentPageNum === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Trang đầu + ellipsis */}
              {currentPageNum > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(status, 1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPageNum > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Các trang xung quanh trang hiện tại */}
              {Array.from({ length: totalPagesNum }, (_, i) => i + 1)
                .filter(page => {
                  const isNearCurrent = Math.abs(page - currentPageNum) <= 1;
                  const isFirstPages = currentPageNum <= 2 && page <= 3;
                  const isLastPages =
                    currentPageNum >= totalPagesNum - 1 &&
                    page >= totalPagesNum - 2;
                  return isNearCurrent || isFirstPages || isLastPages;
                })
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(status, page)}
                      isActive={currentPageNum === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Ellipsis + trang cuối */}
              {currentPageNum < totalPagesNum - 2 && (
                <>
                  {currentPageNum < totalPagesNum - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(status, totalPagesNum)}
                      className="cursor-pointer"
                    >
                      {totalPagesNum}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              {/* Nút Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPageNum < totalPagesNum &&
                    handlePageChange(status, currentPageNum + 1)
                  }
                  className={
                    currentPageNum === totalPagesNum
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
    );
  };

  const getTabCount = (status: ReportStatus) => reports[status].length;

  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-4 sm:p-6">
      <CardTitle className="text-2xl font-bold text-gray-900 py-10 flex items-center gap-2">
        <MessageSquareWarning className="w-6 h-6" />
        Theo dõi phản ánh
      </CardTitle>
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các phản ánh bạn đã gửi
          </p>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map(status => {
                const count = getTabCount(status);
                return (
                  <TabsTrigger key={status} value={status} className="relative">
                    {STATUS_CONFIG[status].label} {count > 0 && `(${count})`}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map(status => (
              <TabsContent key={status} value={status}>
                {renderReportList(status)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
