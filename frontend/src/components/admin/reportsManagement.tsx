import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { getAllReports, updateReportStatus } from "../../api/admin_api";
import { AlertTriangle, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";
import { AdminTableSkeleton } from "./AdminTableSkeleton";
import { AdminEmptyState } from "./AdminEmptyState";

interface Report {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatusCounts = async () => {
    try {
      const [allResponse, pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        getAllReports(1),
        getAllReports(1, 'pending'),
        getAllReports(1, 'approved'),
        getAllReports(1, 'rejected')
      ]);

      setStatusCounts({
        all: allResponse.data?.length || 0,
        pending: pendingResponse.data?.length || 0,
        approved: approvedResponse.data?.length || 0,
        rejected: rejectedResponse.data?.length || 0
      });
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const fetchReports = async (statusType: 'pending' | 'approved' | 'rejected' | 'all', page: number = 1) => {
    try {
      setLoading(true);
      const queryStatus = statusType === 'all' ? undefined : statusType;
      const response = await getAllReports(page, queryStatus);
      
      setReports(response.data || []);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  useEffect(() => {
    fetchReports(status, 1);
  }, [status]);

  const handleStatusUpdate = async (reportId: number, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(reportId);
      await updateReportStatus(reportId, newStatus);
      // Refresh the list and counts
      await Promise.all([
        fetchReports(status, currentPage),
        fetchStatusCounts()
      ]);
    } catch (error) {
      console.error("Error updating report status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports(status, page);
  };

  const handleStatusChange = (newStatus: 'pending' | 'approved' | 'rejected' | 'all') => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCount = (statusType: string) => {
    return statusCounts[statusType as keyof typeof statusCounts] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quản lý báo cáo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tabStatus) => (
              <Button
                key={tabStatus}
                variant={status === tabStatus ? "default" : "outline"}
                onClick={() => handleStatusChange(tabStatus)}
                className="capitalize"
              >
                {tabStatus === 'all' && 'Tất cả'}
                {tabStatus === 'pending' && 'Chờ duyệt'}
                {tabStatus === 'approved' && 'Đã duyệt'}
                {tabStatus === 'rejected' && 'Từ chối'}
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount(tabStatus)}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Reports Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Người báo cáo</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                  <TableHead className="whitespace-nowrap">Ngày tạo</TableHead>
                  <TableHead className="whitespace-nowrap">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton columns={6} rows={5} />
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <AdminEmptyState
                        icon={AlertTriangle}
                        title="Chưa có báo cáo nào"
                        description="Khi người dùng gửi báo cáo, chúng sẽ hiển thị tại đây."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {report.users?.avatar_url ? (
                            <img
                              src={report.users.avatar_url}
                              alt={report.users.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{report.users?.username || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {report.title}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 truncate">
                          {report.description || 'Không có mô tả'}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {report.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(report.id, 'approved')}
                                disabled={actionLoading === report.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(report.id, 'rejected')}
                                disabled={actionLoading === report.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          <Dialog open={isModalOpen && selectedReport?.id === report.id} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewReport(report)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5" />
                                  Chi tiết báo cáo
                                </DialogTitle>
                              </DialogHeader>
                              {selectedReport && (
                                <div className="space-y-6">
                                  {/* Reporter Info */}
                                  <div className="flex items-start space-x-4">
                                    {selectedReport.users?.avatar_url ? (
                                      <img
                                        src={selectedReport.users.avatar_url}
                                        alt={selectedReport.users.username}
                                        className="w-16 h-16 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="h-8 w-8 text-white" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="text-xl font-semibold">{selectedReport.users?.username || 'N/A'}</h3>
                                      <div className="flex items-center gap-2 mt-2">
                                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                                        {getStatusBadge(selectedReport.status)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Report Details */}
                                  <div className="space-y-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <AlertTriangle className="h-4 w-4" />
                                          Tiêu đề báo cáo
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-base font-medium">{selectedReport.title}</p>
                                      </CardContent>
                                    </Card>

                                    {selectedReport.description && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Mô tả chi tiết
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {selectedReport.description}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    )}

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Calendar className="h-4 w-4" />
                                          Thông tin thời gian
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm">
                                            Tạo lúc: {new Date(selectedReport.created_at).toLocaleString('vi-VN', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Actions */}
                                  {selectedReport.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={async () => {
                                          await handleStatusUpdate(selectedReport.id, 'approved');
                                          setIsModalOpen(false);
                                        }}
                                        disabled={actionLoading === selectedReport.id}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Duyệt báo cáo
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={async () => {
                                          await handleStatusUpdate(selectedReport.id, 'rejected');
                                          setIsModalOpen(false);
                                        }}
                                        disabled={actionLoading === selectedReport.id}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Từ chối
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

