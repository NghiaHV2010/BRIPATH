import { useEffect, useState } from "react"
import { Calendar, Clock, CreditCard, Briefcase, TrendingUp, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import type { Subscription, SubscriptionResponse } from "@/types/subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import axiosConfig from "@/config/axios.config"

export function UserSubscription() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [openItems, setOpenItems] = useState<string[]>([])

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                setLoading(true)
                const response = await axiosConfig.get<SubscriptionResponse>(
                    `/subscriptions/user`
                )

                if (response.data.success) {
                    setSubscriptions(response.data.data)
                    // Auto-expand the first (most recent) subscription
                    if (response.data.data.length > 0) {
                        setOpenItems([response.data.data[0].id])
                    }
                }
            } catch (err) {
                setError("An error occurred while fetching subscription")
            } finally {
                setLoading(false)
            }
        }

        fetchSubscription()
    }, [])

    const getRemainingDays = (endDate: string) => {
        const end = new Date(endDate)
        const now = new Date()
        const diffTime = end.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    const getStatusBadge = (status: string = "on_going") => {
        const statusConfig = {
            on_going: {
                label: "Active",
                variant: "default" as const,
                translated: "Đang hoạt động",
                icon: CheckCircle2,
                color: "text-green-600"
            },
            over_date: {
                label: "Over Date",
                variant: "secondary" as const,
                translated: "Đã quá hạn",
                icon: XCircle,
                color: "text-gray-600"
            },
            canceled: {
                label: "Canceled",
                variant: "destructive" as const,
                translated: "Đã hủy",
                icon: AlertCircle,
                color: "text-red-600"
            },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.on_going
        const Icon = config.icon

        return (
            <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <Badge variant={config.variant}>{config.translated}</Badge>
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const toggleItem = (itemId: string) => {
        setOpenItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    if (loading) {
        return (
            <div className="max-w-5xl w-full min-h-screen px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-muted-foreground">Đang tải thông tin gói đăng ký...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-5xl w-full min-h-screen px-4 py-8">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg text-red-500">Lỗi: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="max-w-5xl w-full min-h-screen px-4 py-8">
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <p className="text-lg text-muted-foreground">Không tìm thấy gói đăng ký</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-5xl min-h-screen container px-6 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Gói Đăng Ký Của Tôi</h2>
                <p className="text-muted-foreground">Quản lý gói đăng ký của bạn và xem chi tiết sử dụng</p>
            </div>

            <Accordion className="space-y-4">
                {subscriptions.map((subscription) => {
                    const remainingDays = getRemainingDays(subscription.end_date)
                    const totalDays = Math.ceil(
                        (new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    const daysProgress = ((totalDays - remainingDays) / totalDays) * 100
                    const isOpen = openItems.includes(subscription.id)

                    return (
                        <AccordionItem key={subscription.id} value={subscription.id} className="bg-white shadow-sm">
                            <AccordionTrigger
                                isOpen={isOpen}
                                onClick={() => toggleItem(subscription.id)}
                                className="w-full hover:no-underline"
                            >
                                <div className="flex items-center justify-between w-full pr-4 ">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-left">{subscription.plan_name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                {getStatusBadge(subscription.status)}
                                                <span className="text-sm text-muted-foreground">
                                                    {remainingDays} ngày còn lại
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">{formatCurrency(subscription.amount_paid)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent isOpen={isOpen} className="mt-4">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                {getStatusBadge(subscription.status)}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Ngày còn lại</CardTitle>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{remainingDays}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                trên tổng {totalDays} ngày
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Tổng thanh toán</CardTitle>
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{formatCurrency(subscription.amount_paid)}</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Thông tin gói</CardTitle>
                                            <CardDescription>Chi tiết gói đăng ký hiện tại</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Tên gói</p>
                                                <p className="text-xl font-bold">{subscription.plan_name}</p>
                                            </div>

                                            <Separator />

                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</p>
                                                    <p className="text-sm font-semibold">{formatDate(subscription.start_date)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Ngày hết hạn</p>
                                                    <p className="text-sm font-semibold">{formatDate(subscription.end_date)}</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Tiến độ gói đăng ký</p>
                                                    <p className="text-sm font-semibold">{Math.round(daysProgress)}%</p>
                                                </div>
                                                <Progress value={daysProgress} className="h-2" />
                                            </div>

                                            {subscription.is_extended && (
                                                <Badge variant="outline" className="w-fit">
                                                    Gói gia hạn
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Giới hạn đăng việc</CardTitle>
                                            <CardDescription>Theo dõi số lượt đăng việc còn lại</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <p className="text-sm font-medium">Tổng số việc</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold">{subscription.remaining_total_jobs}</p>
                                                        <p className="text-xs text-muted-foreground">trên {subscription.plan_total_jobs_limit}</p>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={((subscription.plan_total_jobs_limit - subscription.remaining_total_jobs) / subscription.plan_total_jobs_limit) * 100}
                                                    className="h-2"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">việc còn lại</p>
                                            </div>

                                            <Separator />

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-orange-600" />
                                                        <p className="text-sm font-medium">Việc gấp</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-orange-600">{subscription.remaining_urgent_jobs}</p>
                                                        <p className="text-xs text-muted-foreground">trên {subscription.plan_urgent_jobs_limit}</p>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={((subscription.plan_urgent_jobs_limit - subscription.remaining_urgent_jobs) / subscription.plan_urgent_jobs_limit) * 100}
                                                    className="h-2"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">việc gấp còn lại</p>
                                            </div>

                                            <Separator />

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                        <p className="text-sm font-medium">Việc chất lượng</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-blue-600">{subscription.remaining_quality_jobs}</p>
                                                        <p className="text-xs text-muted-foreground">trên {subscription.plan_quality_jobs_limit}</p>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={((subscription.plan_quality_jobs_limit - subscription.remaining_quality_jobs) / subscription.plan_quality_jobs_limit) * 100}
                                                    className="h-2"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">việc chất lượng còn lại</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}
