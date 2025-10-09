import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Star, Crown } from "lucide-react";
import { getRevenueStats } from "../../api/admin_api";

// Mock data for revenue analysis
const mockRevenueData = {
  monthlyRevenue: [
    { month: "Jan", revenue: 45000000 },
    { month: "Feb", revenue: 27000000 },
    { month: "Mar", revenue: 30000000 },
    { month: "Apr", revenue: 27000000 },
    { month: "May", revenue: 17000000 },
    { month: "Jun", revenue: 21000000 },
    { month: "Jul", revenue: 35000000 },
    { month: "Aug", revenue: 50000000 },
    { month: "Sep", revenue: 23000000 },
    { month: "Oct", revenue: 17000000 },
    { month: "Nov", revenue: 48000000 },
    { month: "Dec", revenue: 30000000 },
  ],
};

export default function RevenueCharts() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        await getRevenueStats();
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const maxMonthlyRevenue = Math.max(...mockRevenueData.monthlyRevenue.map(d => d.revenue));

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
                
                {/* Package Bars */}
                {[
                  { name: "Trial", count: 45, color: "#10B981" },
                  { name: "Basic", count: 23, color: "#3B82F6" },
                  { name: "VIP", count: 8, color: "#8B5CF6" },
                  { name: "Premium", count: 3, color: "#F59E0B" },
                ].map((pkg, index) => {
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
                
                {/* Line Chart */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E"/>
                    <stop offset="100%" stopColor="#16A34A"/>
                  </linearGradient>
                </defs>
                
                {/* Line Path */}
                <path
                  d="M 80,140 L 140,120 L 200,100 L 260,80 L 320,90 L 380,70 L 440,85"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data Points */}
                {[
                  { day: "Mon", value: 12 },
                  { day: "Tue", value: 15 },
                  { day: "Wed", value: 20 },
                  { day: "Thu", value: 22 },
                  { day: "Fri", value: 18 },
                  { day: "Sat", value: 8 },
                  { day: "Sun", value: 6 },
                ].map((item, index) => {
                  const x = 80 + (index * 60);
                  const y = 190 - (item.value / 25) * 150;
                  
                  return (
                    <g key={item.day}>
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
                        {item.day}
                      </text>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-xs fill-gray-900 font-medium"
                        fontSize="10"
                      >
                        {item.value}M
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng cao nhất</p>
                <p className="text-2xl font-bold text-green-600">Aug</p>
                <p className="text-xs text-gray-500">50M VND</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gói bán chạy</p>
                <p className="text-2xl font-bold text-blue-600">Basic</p>
                <p className="text-xs text-gray-500">23 gói</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng thấp nhất</p>
                <p className="text-2xl font-bold text-orange-600">May</p>
                <p className="text-xs text-gray-500">17M VND</p>
              </div>
              <Crown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
