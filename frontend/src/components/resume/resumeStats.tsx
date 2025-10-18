import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card"
import type { ChartConfig } from "../ui/chart"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart"
import { fetchCVStats } from "@/api"
import type { CVStats } from "@/types/resume"


interface CVStatsRadarChartProps {
    cvId: number
}

const chartConfig = {
    score: {
        label: "Score",
        color: "hsl(217, 91%, 60%)", // Blue color
    },
} satisfies ChartConfig

export function CVStatsRadarChart({ cvId }: CVStatsRadarChartProps) {
    const [statsData, setStatsData] = useState<CVStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                const response = await fetchCVStats(cvId);

                if (!response) {
                    throw new Error('Failed to fetch CV stats')
                }

                setStatsData(response)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [cvId])

    if (loading) {
        return (
            <Card>
                <CardHeader className="items-center">
                    <CardTitle>Thống kê hồ sơ</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                    <div className="flex items-center justify-center h-[250px]">
                        Đang tải...
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !statsData) {
        return (
            <Card>
                <CardHeader className="items-center">
                    <CardTitle>Thống kê hồ sơ</CardTitle>
                </CardHeader>
                <CardContent className="pb-0">
                    <div className="flex items-center justify-center h-[250px] text-red-500">
                        {error || 'Không có dữ liệu'}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const chartData = [
        { skill: "Kỹ thuật", score: statsData.technical },
        { skill: "Giao tiếp", score: statsData.communication },
        { skill: "Làm việc nhóm", score: statsData.teamwork },
        { skill: "Giải quyết vấn đề", score: statsData.problem_solving },
        { skill: "Sáng tạo", score: statsData.creativity },
        { skill: "Lãnh đạo", score: statsData.leadership },
    ]

    const averageScore = Math.round(
        chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length
    )

    const highestSkill = chartData.reduce((max, item) =>
        item.score > max.score ? item : max
    )

    return (
        <Card>
            <CardHeader className="items-center">
                <CardTitle>Thống kê hồ sơ</CardTitle>
                <CardDescription>
                    Đánh giá kỹ năng trên 6 lĩnh vực chính
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto max-h-[400px] min-h-[250px] min-w-[250px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarGrid />
                        <Radar
                            dataKey="score"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{
                                r: 4,
                                fill: "#1d4ed8",
                                strokeWidth: 2,
                                stroke: "#ffffff",
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Điểm cao nhất: {highestSkill.skill} ({highestSkill.score}/100) <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    Điểm trung bình: {averageScore}/100
                </div>
                {statsData.summary && (
                    <div className="text-muted-foreground text-xs mt-2 text-center">
                        {statsData.summary}
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
