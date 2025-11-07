"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface CVJobComparisonChartProps {
    cvStats: {
        technical: number;
        communication: number;
        teamwork: number;
        problem_solving: number;
        creativity: number;
        leadership: number;
        summary: string;
    };
    jobStats: {
        technical: number;
        communication: number;
        teamwork: number;
        problem_solving: number;
        creativity: number;
        leadership: number;
        summary: string;
    };
}

const chartConfig = {
    cv: {
        label: "CV ứng viên",
        color: "#8ec5ff",
    },
    job: {
        label: "Yêu cầu công việc",
        color: "#2b7fff",
    },
} satisfies ChartConfig

export function CVJobComparisonChart({ cvStats, jobStats }: CVJobComparisonChartProps) {
    const chartData = [
        {
            skill: "Kỹ thuật",
            cv: cvStats.technical,
            job: jobStats.technical,
        },
        {
            skill: "Giao tiếp",
            cv: cvStats.communication,
            job: jobStats.communication,
        },
        {
            skill: "Làm việc nhóm",
            cv: cvStats.teamwork,
            job: jobStats.teamwork,
        },
        {
            skill: "Giải quyết vấn đề",
            cv: cvStats.problem_solving,
            job: jobStats.problem_solving,
        },
        {
            skill: "Sáng tạo",
            cv: cvStats.creativity,
            job: jobStats.creativity,
        },
        {
            skill: "Lãnh đạo",
            cv: cvStats.leadership,
            job: jobStats.leadership,
        },
    ]


    return (
        <Card>
            <CardContent className="space-y-6">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[400px]"
                >
                    <RadarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            bottom: 10,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarGrid />
                        <Radar
                            dataKey="job"
                            fill="var(--color-job)"
                            fillOpacity={0.3}
                            stroke="var(--color-job)"
                            strokeWidth={2}
                        />
                        <Radar
                            dataKey="cv"
                            fill="var(--color-cv)"
                            fillOpacity={0.6}
                            stroke="var(--color-cv)"
                            strokeWidth={2}
                        />
                        <ChartLegend className="mt-8" content={<ChartLegendContent />} />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}