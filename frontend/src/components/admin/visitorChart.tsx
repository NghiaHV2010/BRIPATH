import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getUserAccessStats } from "../../api/admin_api";
import { Loader2 } from "lucide-react";

interface VisitorChartProps {
  title?: string;
  subtitle?: string;
}

interface DailyStat {
  date: string;
  users: number;
  fullDate: string;
}

interface MonthlyStat {
  month: string;
  users: number;
  year: number;
  monthNumber: number;
}

export default function VisitorChart({ 
  title = "Total Visitors", 
  subtitle = "Total for the last 3 months" 
}: VisitorChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days" | "3months">("7days");
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getUserAccessStats(30);
        if (response.data) {
          setDailyStats(response.data.dailyStats || []);
          setMonthlyStats(response.data.monthlyStats || []);
        }
      } catch (error) {
        console.error("Error fetching visitor data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getCurrentData = () => {
    if (selectedPeriod === "7days") {
      return dailyStats.map(stat => ({
        date: stat.date.split(',')[0], // Get day name
        visitors: stat.users
      }));
    } else if (selectedPeriod === "30days") {
      // Get last 7 data points from daily stats (if available) or sample from monthly
      if (dailyStats.length >= 7) {
        // Sample every 4-5 days
        const sampled = [];
        const step = Math.ceil(dailyStats.length / 7);
        for (let i = 0; i < dailyStats.length; i += step) {
          sampled.push({
            date: dailyStats[i].date.split(',')[1]?.trim() || dailyStats[i].date,
            visitors: dailyStats[i].users
          });
        }
        return sampled.slice(0, 7);
      }
      return dailyStats.map(stat => ({
        date: stat.date.split(',')[1]?.trim() || stat.date,
        visitors: stat.users
      }));
    } else {
      // 3 months - use last 3 months from monthlyStats
      return monthlyStats.slice(-3).map(stat => ({
        date: stat.month,
        visitors: stat.users
      }));
    }
  };

  const currentData = getCurrentData();
  const maxValue = currentData.length > 0 ? Math.max(...currentData.map(d => d.visitors), 1) : 1;
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentData.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "3months" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("3months")}
              className={`text-xs px-3 py-1 ${
                selectedPeriod === "3months" 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Last 3 months
            </Button>
            <Button
              variant={selectedPeriod === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("30days")}
              className={`text-xs px-3 py-1 ${
                selectedPeriod === "30days" 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Last 30 days
            </Button>
            <Button
              variant={selectedPeriod === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("7days")}
              className={`text-xs px-3 py-1 ${
                selectedPeriod === "7days" 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Last 7 days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-64">
          {/* Chart Area */}
          <div className="absolute inset-0 p-4">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1="0"
                  y1={`${percent}%`}
                  x2="100%"
                  y2={`${percent}%`}
                  stroke="#E5E7EB"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Area Path */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60A5FA"/>
                  <stop offset="100%" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
              
              {/* Area Fill */}
              <path
                d={`M 0,${200 - (currentData[0].visitors / maxValue) * 180} ${currentData.map((item, index) => 
                  `L ${(index / (currentData.length - 1)) * 360},${200 - (item.visitors / maxValue) * 180}`
                ).join(' ')} L ${360},200 L 0,200 Z`}
                fill="url(#areaGradient)"
              />
              
              {/* Line */}
              <path
                d={`M 0,${200 - (currentData[0].visitors / maxValue) * 180} ${currentData.map((item, index) => 
                  `L ${(index / (currentData.length - 1)) * 360},${200 - (item.visitors / maxValue) * 180}`
                ).join(' ')}`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data Points */}
              {currentData.map((item, index) => {
                const x = (index / (currentData.length - 1)) * 360;
                const y = 200 - (item.visitors / maxValue) * 180;
                return (
                  <g key={item.date}>
                    {/* Point circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#60A5FA"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                    
                    {/* Date labels */}
                    <text
                      x={x}
                      y="190"
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                      fontSize="10"
                    >
                      {item.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <div className="text-gray-600">
              Total: <span className="text-gray-900 font-semibold">{formatNumber(currentData.reduce((sum, d) => sum + d.visitors, 0))}</span>
            </div>
            <div className="text-gray-600">
              Avg: <span className="text-gray-900 font-semibold">{formatNumber(Math.round(currentData.reduce((sum, d) => sum + d.visitors, 0) / currentData.length))}</span>
            </div>
            <div className="text-gray-600">
              Peak: <span className="text-gray-900 font-semibold">{formatNumber(maxValue)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
