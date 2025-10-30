import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, TrendingUp, Calendar, Clock, BarChart3, Activity } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";
import axiosConfig from "@/config/axios.config";

interface JobStatsData {
    jobStats?: {
        technical: number;
        communication: number;
        teamwork: number;
        problem_solving: number;
        creativity: number;
        leadership: number;
        summary: string;
    };
    totalViews: number;
    last7DaysViews?: Array<{
        view_date: string;
        view_count: number;
        formatted_date: string;
    }>;
    last4WeeksViews?: Array<{
        week_start: string;
        week_end: string;
        week_number: number;
        view_count: number;
    }>;
    last6MonthsViews?: Array<{
        month_start: string;
        month_number: number;
        month_name: string;
        view_count: number;
    }>;
    hourlyDistribution?: Array<{
        hour_of_day: number;
        view_count: number;
    }>;
    weeklyDayDistribution?: Array<{
        day_of_week: number;
        day_name: string;
        view_count: number;
    }>;
}

interface JobStatsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string;
    jobTitle: string;
}

export function JobStatsModal({ open, onOpenChange, jobId, jobTitle }: JobStatsModalProps) {
    const [data, setData] = useState<JobStatsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("skills");

    // Utility function to convert UTC hour to Vietnam timezone hour (UTC+7)
    const convertToVietnamHour = (utcHour: number) => {
        const vietnamHour = (utcHour + 7) % 24;
        return vietnamHour;
    };

    // Utility function to format Vietnam hour display in 12-hour format
    const formatVietnamHour = (hour: number) => {
        if (hour === 0) return '12:00 SA';
        if (hour < 12) return `${hour}:00 SA`;
        if (hour === 12) return '12:00 CH';
        return `${hour - 12}:00 CH`;
    };

    // Utility function to format Vietnam hour for display (24-hour format)
    const formatVietnam24Hour = (hour: number) => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    useEffect(() => {
        if (open && jobId) {
            fetchJobStats();
        }
    }, [open, jobId]);

    const fetchJobStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosConfig.get(`/job-stats/${jobId}`);

            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch job statistics");
            console.error("Error fetching job stats:", err);
        } finally {
            setLoading(false);
        }
    };

    // Transform job stats for radar chart
    const radarData = data?.jobStats ? [
        { skill: "Technical", value: data.jobStats.technical, fullMark: 100, label: "Kỹ thuật" },
        { skill: "Communication", value: data.jobStats.communication, fullMark: 100, label: "Giao tiếp" },
        { skill: "Teamwork", value: data.jobStats.teamwork, fullMark: 100, label: "Làm việc nhóm" },
        { skill: "Problem Solving", value: data.jobStats.problem_solving, fullMark: 100, label: "Giải quyết vấn đề" },
        { skill: "Creativity", value: data.jobStats.creativity, fullMark: 100, label: "Sáng tạo" },
        { skill: "Leadership", value: data.jobStats.leadership, fullMark: 100, label: "Lãnh đạo" },
    ] : [];

    // Calculate highest score skill
    const highestSkill = radarData.length > 0 ?
        radarData.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;

    // Transform daily views for line chart
    const dailyViewsData = data?.last7DaysViews?.map(item => ({
        date: new Date(item.view_date).toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric'
        }),
        views: item.view_count,
        fullDate: item.formatted_date,
    })).reverse() || [];

    // Transform weekly views for line chart
    const weeklyViewsData = data?.last4WeeksViews?.map(item => ({
        week: `Week ${item.week_number}`,
        views: item.view_count,
        period: `${new Date(item.week_start).toLocaleDateString('vi-VN')} - ${new Date(item.week_end).toLocaleDateString('vi-VN')}`,
    })).reverse() || [];

    // Transform monthly views for line chart
    const monthlyViewsData = data?.last6MonthsViews?.map(item => ({
        month: item.month_name.trim(),
        views: item.view_count,
    })).reverse() || [];

    // Transform hourly distribution for line chart (convert to Vietnam timezone)
    const hourlyData = data?.hourlyDistribution?.map(item => {
        const vietnamHour = convertToVietnamHour(item.hour_of_day);
        return {
            hour: formatVietnam24Hour(vietnamHour),
            hourNum: vietnamHour,
            views: item.view_count,
            label: `${vietnamHour}h`,
            vietnameseLabel: formatVietnamHour(vietnamHour),
            displayHour: vietnamHour,
        };
    }).sort((a, b) => a.hourNum - b.hourNum) || [];

    // Transform weekly day distribution for line chart
    const weeklyDayData = data?.weeklyDayDistribution?.map(item => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayIndex = dayOrder.indexOf(item.day_name.trim());
        return {
            day: item.day_name.trim(),
            dayIndex: dayIndex !== -1 ? dayIndex : 0,
            views: item.view_count,
            label: item.day_name.trim().substring(0, 3), // Short day name
        };
    }).sort((a, b) => a.dayIndex - b.dayIndex) || [];

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Job Statistics - {jobTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading statistics...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:min-w-5xl h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Job Statistics - {jobTitle}
                    </DialogTitle>
                </DialogHeader>

                {error ? (
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">{error}</div>
                        <Button onClick={fetchJobStats} variant="outline">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Total Views</p>
                                            <p className="text-2xl font-bold text-gray-900">{data?.totalViews || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Avg Daily Views (7d)</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {dailyViewsData.length > 0
                                                    ? Math.round(dailyViewsData.reduce((acc, item) => acc + item.views, 0) / dailyViewsData.length)
                                                    : 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Giờ cao điểm</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {hourlyData.length > 0
                                                    ? hourlyData.reduce((max, item) => item.views > max.views ? item : max).vietnameseLabel
                                                    : "N/A"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                                <TabsTrigger value="trends">View Trends</TabsTrigger>
                                <TabsTrigger value="patterns">View Patterns</TabsTrigger>
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                            </TabsList>

                            {/* Skills Analysis Tab */}
                            <TabsContent value="skills" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5" />
                                            Skills Requirement Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {data?.jobStats ? (
                                            <div className="space-y-4">
                                                {/* Highest Score Display */}
                                                {highestSkill && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-blue-900">Kỹ năng nổi bật nhất</h4>
                                                                <p className="text-blue-700">{highestSkill.label}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-blue-600">{highestSkill.value}%</div>
                                                                <div className="text-sm text-blue-500">điểm số</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Radar Chart */}
                                                <div className="h-96">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart data={radarData}>
                                                            <PolarGrid gridType="polygon" />
                                                            <PolarAngleAxis
                                                                tick={{ fontSize: 12 }}
                                                                dataKey="label"
                                                            />
                                                            <PolarRadiusAxis
                                                                tick={{ fontSize: 10 }}
                                                                domain={[0, 100]}
                                                                angle={90}
                                                                tickCount={6}
                                                            />
                                                            <Radar
                                                                name="Kỹ năng"
                                                                dataKey="value"
                                                                stroke="#3b82f6"
                                                                fill="#3b82f6"
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                            />
                                                            <Tooltip
                                                                content={({ payload }) => {
                                                                    if (payload && payload.length > 0) {
                                                                        const data = payload[0].payload;
                                                                        return (
                                                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                                <p className="font-medium text-gray-900">{data.label}</p>
                                                                                <p className="text-blue-600">Điểm số: {data.value}%</p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                No skills analysis data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* View Trends Tab */}
                            <TabsContent value="trends" className="space-y-4">
                                {/* Daily Views */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Daily Views (Last 7 Days)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dailyViewsData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 12 }}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 12 }}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip
                                                        content={({ payload, label }) => {
                                                            if (payload && payload.length > 0) {
                                                                return (
                                                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                        <p className="font-medium text-gray-900">Ngày: {label}</p>
                                                                        <p className="text-blue-600">Lượt xem: {payload[0].value}</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="views"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                                                        activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Weekly Views */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Weekly Views (Last 4 Weeks)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={weeklyViewsData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        content={({ payload, label }) => {
                                                            if (payload && payload.length > 0) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                        <p className="font-medium text-gray-900">{label}</p>
                                                                        <p className="text-green-600">Lượt xem: {payload[0].value}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">{data.period}</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="views"
                                                        stroke="#10b981"
                                                        strokeWidth={3}
                                                        dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Monthly Views */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Views (Last 6 Months)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={monthlyViewsData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        content={({ payload, label }) => {
                                                            if (payload && payload.length > 0) {
                                                                return (
                                                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                        <p className="font-medium text-gray-900">{label}</p>
                                                                        <p className="text-amber-600">Lượt xem: {payload[0].value}</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="views"
                                                        stroke="#f59e0b"
                                                        strokeWidth={3}
                                                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* View Patterns Tab */}
                            <TabsContent value="patterns" className="space-y-4">
                                {/* Hourly Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Phân bố lượt xem theo giờ (Giờ Việt Nam)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={hourlyData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                    <XAxis
                                                        dataKey="vietnameseLabel"
                                                        tick={{ fontSize: 10 }}
                                                        interval={0}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                    />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        content={({ payload }) => {
                                                            if (payload && payload.length > 0) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                        <p className="font-medium text-gray-900">{data.vietnameseLabel}</p>
                                                                        <p className="text-purple-600">Lượt xem: {payload[0].value}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Giờ Việt Nam (UTC+7)</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="views"
                                                        stroke="#8b5cf6"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                                        activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Weekly Day Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Day of Week Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={weeklyDayData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                    <XAxis
                                                        dataKey="label"
                                                        tick={{ fontSize: 12 }}
                                                        interval={0}
                                                    />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        content={({ payload }) => {
                                                            if (payload && payload.length > 0) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                        <p className="font-medium text-gray-900">Thứ: {data.day}</p>
                                                                        <p className="text-cyan-600">Lượt xem: {payload[0].value}</p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="views"
                                                        stroke="#06b6d4"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                                                        activeDot={{ r: 7, stroke: '#06b6d4', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Summary Tab */}
                            <TabsContent value="summary" className="space-y-4">
                                {data?.jobStats?.summary && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>AI Analysis Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="prose prose-gray max-w-none">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {data.jobStats.summary}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Skills Breakdown */}
                                {data?.jobStats && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Skills Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {radarData.map((skill) => (
                                                    <div key={skill.skill} className="text-center">
                                                        <div className="mb-2">
                                                            <div className={`text-2xl font-bold ${skill.value >= 80 ? 'text-green-600' :
                                                                skill.value >= 60 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`}>
                                                                {skill.value}%
                                                            </div>
                                                            <div className="text-sm text-gray-600">{skill.skill}</div>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${skill.value >= 80 ? 'bg-green-600' :
                                                                    skill.value >= 60 ? 'bg-yellow-600' :
                                                                        'bg-red-600'
                                                                    }`}
                                                                style={{ width: `${skill.value}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}