import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Star, Crown, Loader2 } from "lucide-react";
import { getRevenueStats } from "../../api/admin_api";

interface RevenueData {
  totalRevenue: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
  totalTransactions: number;
  currentMonthTransactions: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    year: number;
    monthNumber: number;
  }>;
  revenueByGateway: Array<{
    gateway: string;
    revenue: number;
    transactions: number;
  }>;
}

export default function RevenueCharts() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRevenueStats();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || "Không có dữ liệu"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Additional Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Package Performance Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Star className="h-5 w-5 text-purple-600" />
              Hiệu suất gói dịch vụ
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Số lượng gói đã bán theo từng loại
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 600 240">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <line
                    key={percent}
                    x1="80"
                    y1={`${percent * 1.8}`}
                    x2="520"
                    y2={`${percent * 1.8}`}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis Labels */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <text
                    key={percent}
                    x="75"
                    y={`${190 - percent * 1.5}`}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                    fontSize="12"
                  >
                    {(percent * 50 / 100).toFixed(0)}
                  </text>
                ))}
                
                {/* Package Bars - Using real data from revenueByGateway */}
                {data.revenueByGateway.map((gateway, index) => {
                  const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];
                  const pkg = {
                    name: gateway.gateway,
                    count: gateway.transactions,
                    color: colors[index % colors.length]
                  };
                  const barWidth = 80;
                  const barSpacing = 120;
                  const startX = 120 + (index * barSpacing);
                  const barHeight = (pkg.count / 50) * 150;
                  const barY = 190 - barHeight;
                  
                  return (
                    <g key={pkg.name}>
                      {/* Bar */}
                      <rect
                        x={startX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={pkg.color}
                        rx="4"
                      />
                      
                      {/* Value Label on Bar */}
                      <text
                        x={startX + barWidth/2}
                        y={barY - 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-900 font-medium"
                        fontSize="11"
                      >
                        {pkg.count}
                      </text>
                      
                      {/* Package Label */}
                      <text
                        x={startX + barWidth/2}
                        y="210"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        fontSize="12"
                      >
                        {pkg.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Revenue Trend */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Xu hướng tuần
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Doanh thu 7 ngày gần đây
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 600 240">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <line
                    key={percent}
                    x1="60"
                    y1={`${percent * 1.8}`}
                    x2="540"
                    y2={`${percent * 1.8}`}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis Labels */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <text
                    key={percent}
                    x="55"
                    y={`${190 - percent * 1.5}`}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                    fontSize="12"
                  >
                    {(percent * 25 / 100).toFixed(0)}M
                  </text>
                ))}
                
                {/* Line Chart - Using real monthly revenue data */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E"/>
                    <stop offset="100%" stopColor="#16A34A"/>
                  </linearGradient>
                </defs>
                
                {/* Line Path - Using last 7 months of data */}
                {data.monthlyRevenue.slice(-7).map((item, index) => {
                  const x = 80 + (index * 60);
                  const y = 190 - (item.revenue / 50000000) * 150; // Scale to max 50M
                  return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                
                {/* Data Points - Using real monthly revenue data */}
                {data.monthlyRevenue.slice(-7).map((item, index) => {
                  const x = 80 + (index * 60);
                  const y = 190 - (item.revenue / 50000000) * 150; // Scale to max 50M
                  
                  return (
                    <g key={item.month}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#22C55E"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y="210"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        fontSize="12"
                      >
                        {item.month}
                      </text>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-xs fill-gray-900 font-medium"
                        fontSize="10"
                      >
                        {(item.revenue / 1000000).toFixed(0)}M
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats - Using real data */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {(data.totalRevenue / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-gray-500">VND</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tăng trưởng</p>
                <p className={`text-2xl font-bold ${data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.growthRate >= 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">so với tháng trước</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giao dịch tháng này</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.currentMonthTransactions}
                </p>
                <p className="text-xs text-gray-500">giao dịch</p>
              </div>
              <Crown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
