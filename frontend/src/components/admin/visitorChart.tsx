import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

// Mock data for the chart
const mockData = {
  "7days": [
    { date: "Jun 24", visitors: 2400 },
    { date: "Jun 25", visitors: 1200 },
    { date: "Jun 26", visitors: 1800 },
    { date: "Jun 27", visitors: 3200 },
    { date: "Jun 28", visitors: 1600 },
    { date: "Jun 29", visitors: 1400 },
    { date: "Jun 30", visitors: 2600 },
  ],
  "30days": [
    { date: "Jun 1", visitors: 1800 },
    { date: "Jun 5", visitors: 2200 },
    { date: "Jun 10", visitors: 1600 },
    { date: "Jun 15", visitors: 2800 },
    { date: "Jun 20", visitors: 2400 },
    { date: "Jun 25", visitors: 1200 },
    { date: "Jun 30", visitors: 2600 },
  ],
  "3months": [
    { date: "Apr", visitors: 12000 },
    { date: "May", visitors: 15000 },
    { date: "Jun", visitors: 18000 },
  ]
};

interface VisitorChartProps {
  title?: string;
  subtitle?: string;
}

export default function VisitorChart({ 
  title = "Total Visitors", 
  subtitle = "Total for the last 3 months" 
}: VisitorChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days" | "3months">("7days");
  
  const currentData = mockData[selectedPeriod];
  const maxValue = Math.max(...currentData.map(d => d.visitors));
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

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
