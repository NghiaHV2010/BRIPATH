import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { getPaymentStats } from "../../api/admin_api";
import { CreditCard, DollarSign, TrendingUp, Users, Calendar, Eye, Building2, User as UserIcon, Award } from "lucide-react";
import { AdminCardSkeleton } from "./AdminCardSkeleton";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminTableSkeleton } from "./AdminTableSkeleton";
import { Skeleton } from "../ui/skeleton";

interface PaymentStats {
  period: string;
  statusStats: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  gatewayStats: Array<{
    gateway: string;
    count: number;
    revenue: number;
  }>;
  methodStats: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    currency: string;
    payment_gateway: string;
    payment_method: string;
    status: string;
    created_at: string;
    user: {
      avatar_url?: string;
      username: string;
      email: string;
      roles?: {
        role_name: string;
      };
    };
    subscription?: {
      status: string;
      end_date: string;
      membershipPlans: {
        plan_name: string;
      };
    };
  }>;
  recentTransactionsPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PaymentsManagement() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30);
  const [transactionsPage, setTransactionsPage] = useState<number>(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 20;

  const fetchPaymentStats = async (days: number, page: number = 1) => {
    try {
      setLoading(true);
      const response = await getPaymentStats(days, page, pageSize);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset về trang 1 khi đổi kỳ thống kê
  useEffect(() => {
    setTransactionsPage(1);
  }, [period]);

  // Gọi API mỗi khi kỳ hoặc trang thay đổi
  useEffect(() => {
    fetchPaymentStats(period, transactionsPage);
  }, [period, transactionsPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Thành công</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Thất bại</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case 'on_going':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đang hoạt động</Badge>;
      case 'over_date':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Đã hết hạn</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return '';

    const roleLabels: Record<string, string> = {
      'Company': 'Doanh nghiệp',
      'User': 'Ứng viên',
      'Admin': 'Quản trị viên',
    };

    return roleLabels[roleName] || roleName;
  };

  const getRoleBadge = (roleName?: string) => {
    if (!roleName) return null;

    const roleColors: Record<string, string> = {
      'Company': 'bg-blue-100 text-blue-800',
      'User': 'bg-gray-100 text-gray-800',
      'Admin': 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge variant="outline" className={roleColors[roleName] || 'bg-gray-100 text-gray-800'}>
        {getRoleLabel(roleName)}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'e_wallet': 'Ví điện tử',
      'bank_card': 'Thẻ ngân hàng',
      'credit_card': 'Thẻ tín dụng',
      'debit_card': 'Thẻ ghi nợ',
      'bank_transfer': 'Chuyển khoản',
    };
    return labels[method] || method;
  };

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminCardSkeleton
          title="Quản lý thanh toán"
          icon={<CreditCard className="h-5 w-5" />}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </AdminCardSkeleton>

        <AdminCardSkeleton
          title="Giao dịch gần đây"
          icon={<Calendar className="h-5 w-5" />}
        >
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Gói dịch vụ</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Cổng thanh toán</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AdminTableSkeleton columns={8} rows={5} />
              </TableBody>
            </Table>
          </div>
        </AdminCardSkeleton>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Quản lý thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminEmptyState
            icon={CreditCard}
            title="Không thể tải dữ liệu thanh toán"
            description="Vui lòng thử lại sau ít phút."
          />
        </CardContent>
      </Card>
    );
  }

  const statusStats = stats.statusStats || [];
  const gatewayStats = stats.gatewayStats || [];
  const methodStats = stats.methodStats || [];
  const recentTransactions = stats.recentTransactions || [];
  const recentPagination = stats.recentTransactionsPagination || {
    page: transactionsPage,
    limit: pageSize,
    total: recentTransactions.length,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Quản lý thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            {[7, 30, 90, 365].map((days) => (
              <Button
                key={days}
                variant={period === days ? "default" : "outline"}
                onClick={() => setPeriod(days)}
              >
                {days} ngày
              </Button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(statusStats.reduce((sum, item) => sum + item.count, 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trong {period} ngày qua
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(statusStats.reduce((sum, item) => sum + item.revenue, 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trong {period} ngày qua
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giao dịch thành công</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(statusStats.find(s => s.status === 'success')?.count || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats?.statusStats.find(s => s.status === 'success')?.revenue || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const total = statusStats.reduce((sum, item) => sum + item.count, 0) || 0;
                    const success = statusStats.find(s => s.status === 'success')?.count || 0;
                    return total > 0 ? ((success / total) * 100).toFixed(1) : 0;
                  })()}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Giao dịch thành công
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Theo trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                {statusStats.length ? (
                  <div className="space-y-2">
                    {statusStats.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                          <span className="text-sm capitalize">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(item.count)}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={TrendingUp}
                    title="Chưa có dữ liệu trạng thái"
                    description="Các giao dịch sẽ hiển thị tại đây khi có dữ liệu."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Theo cổng thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                {gatewayStats.length ? (
                  <div className="space-y-2">
                    {gatewayStats.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.gateway}</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(item.count)}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={CreditCard}
                    title="Chưa có dữ liệu cổng thanh toán"
                    description="Khi có giao dịch, thống kê sẽ xuất hiện tại đây."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Theo phương thức</CardTitle>
              </CardHeader>
              <CardContent>
                {methodStats.length ? (
                  <div className="space-y-2">
                    {methodStats.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{getPaymentMethodLabel(item.method)}</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatNumber(item.count)}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={DollarSign}
                    title="Chưa có dữ liệu phương thức"
                    description="Các phương thức thanh toán sẽ hiển thị khi phát sinh giao dịch."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Giao dịch gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead className="whitespace-nowrap">Gói dịch vụ</TableHead>
                      <TableHead className="whitespace-nowrap">Số tiền</TableHead>
                      <TableHead className="whitespace-nowrap">Cổng thanh toán</TableHead>
                      <TableHead className="whitespace-nowrap">Phương thức</TableHead>
                      <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                      <TableHead className="whitespace-nowrap">Thời gian</TableHead>
                      <TableHead className="whitespace-nowrap">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <AdminEmptyState
                            icon={Calendar}
                            title="Chưa có giao dịch gần đây"
                            description="Những giao dịch mới nhất sẽ hiển thị ở đây."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {transaction.user.avatar_url ? (
                                <img
                                  loading="lazy"
                                  src={transaction.user.avatar_url}
                                  alt={transaction.user.username}
                                  className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                  {transaction.user.roles?.role_name === 'Company' ? (
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{transaction.user.username}</p>
                                <p className="text-sm text-gray-500 truncate">{transaction.user.email}</p>
                                {transaction.user.roles && (
                                  <div className="mt-1">
                                    {getRoleBadge(transaction.user.roles.role_name)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {transaction.subscription ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="font-medium">
                                  {transaction.subscription.membershipPlans.plan_name}
                                </Badge>
                                <div className="text-xs text-gray-500 italic">
                                  Hết hạn: {new Date(transaction.subscription.end_date).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline">{transaction.payment_gateway}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getPaymentMethodLabel(transaction.payment_method)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {recentTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 text-sm text-gray-600">
                  <div>
                    Hiển thị{" "}
                    <span className="font-semibold">
                      {(recentPagination.page - 1) * recentPagination.limit + 1}-
                      {Math.min(recentPagination.page * recentPagination.limit, recentPagination.total)}
                    </span>{" "}
                    trên tổng số{" "}
                    <span className="font-semibold">{recentPagination.total}</span> giao dịch
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={recentPagination.page <= 1 || loading}
                      onClick={() => setTransactionsPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Trang trước
                    </Button>
                    <span>
                      Trang{" "}
                      <span className="font-semibold">{recentPagination.page}</span>/
                      <span className="font-semibold">{recentPagination.totalPages}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        recentPagination.page >= recentPagination.totalPages || loading
                      }
                      onClick={() =>
                        setTransactionsPage((prev) =>
                          Math.min(prev + 1, recentPagination.totalPages || prev + 1)
                        )
                      }
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Chi tiết giao dịch
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết về giao dịch thanh toán
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction ID & Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-500">Mã giao dịch</p>
                  <p className="font-mono text-sm mt-1">{selectedTransaction.id}</p>
                </div>
                {getStatusBadge(selectedTransaction.status)}
              </div>

              {/* User Info & Subscription */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Thông tin người dùng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedTransaction.user.avatar_url && (
                      <div className="flex justify-center">
                        <img
                          loading="lazy"
                          src={selectedTransaction.user.avatar_url}
                          alt={selectedTransaction.user.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Tên</p>
                      <p className="text-sm font-medium">{selectedTransaction.user.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm">{selectedTransaction.user.email}</p>
                    </div>
                    {selectedTransaction.user.roles && (
                      <div>
                        <p className="text-xs text-gray-500">Vai trò</p>
                        <div className="mt-1">
                          {getRoleBadge(selectedTransaction.user.roles.role_name)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subscription Info */}
                {selectedTransaction.subscription && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Thông tin gói dịch vụ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Tên gói</p>
                        <Badge variant="outline" className="mt-1 font-medium">
                          {selectedTransaction.subscription.membershipPlans.plan_name}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trạng thái gói</p>
                        <div className="mt-1">
                          {getSubscriptionStatusBadge(selectedTransaction.subscription.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ngày hết hạn</p>
                        <p className="text-sm mt-1">
                          {new Date(selectedTransaction.subscription.end_date).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Số tiền</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đơn vị tiền tệ</p>
                    <p className="text-sm mt-1">{selectedTransaction.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cổng thanh toán</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedTransaction.payment_gateway}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phương thức</p>
                    <p className="text-sm mt-1">
                      {getPaymentMethodLabel(selectedTransaction.payment_method)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thời gian giao dịch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {new Date(selectedTransaction.created_at).toLocaleString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
