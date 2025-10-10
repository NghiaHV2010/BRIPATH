import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { getPaymentStats } from "../../api/admin_api";
import { CreditCard, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

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
      </div>
    );
  }

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
                  {formatNumber(stats?.statusStats.reduce((sum, item) => sum + item.count, 0) || 0)}
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
                  {formatCurrency(stats?.statusStats.reduce((sum, item) => sum + item.revenue, 0) || 0)}
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
                  {formatNumber(stats?.statusStats.find(s => s.status === 'success')?.count || 0)}
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
                    const total = stats?.statusStats.reduce((sum, item) => sum + item.count, 0) || 0;
                    const success = stats?.statusStats.find(s => s.status === 'success')?.count || 0;
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
                <div className="space-y-2">
                  {stats?.statusStats.map((item, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Theo cổng thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.gatewayStats.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.gateway}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(item.count)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Theo phương thức</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.methodStats.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.method}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatNumber(item.count)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(item.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    {stats?.recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Không có giao dịch nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats?.recentTransactions.map((transaction) => (
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
                              minute: '2-digit'
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
