import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { getPaymentStats } from "../../api/admin_api";
import { CreditCard, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
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
      username: string;
      email: string;
    };
  }>;
}

export default function PaymentsManagement() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30);

  const fetchPaymentStats = async (days: number) => {
    try {
      setLoading(true);
      const response = await getPaymentStats(days);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStats(period);
  }, [period]);

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
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Cổng thanh toán</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AdminTableSkeleton columns={6} rows={5} />
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
                        <span className="text-sm">{item.method}</span>
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
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Cổng thanh toán</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
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
                            <div>
                              <p className="font-medium">{transaction.user.username}</p>
                              <p className="text-sm text-gray-500">{transaction.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{transaction.payment_gateway}</TableCell>
                          <TableCell>{transaction.payment_method}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
