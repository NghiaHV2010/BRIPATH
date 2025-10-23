import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Mail,
    Phone,
    FileText,
    Download
} from "lucide-react";

export function JobApplicationsPage() {
    const [activeTab, setActiveTab] = useState("all");

    const applications = [
        {
            id: "1",
            candidateName: "Nguyễn Văn An",
            email: "an.nguyen@email.com",
            phone: "0123456789",
            position: "Frontend Developer",
            appliedDate: "2024-10-20",
            status: "pending",
            avatar: "",
            experience: "3 năm",
            cvUrl: "#"
        },
        {
            id: "2",
            candidateName: "Trần Thị Bình",
            email: "binh.tran@email.com",
            phone: "0987654321",
            position: "Backend Developer",
            appliedDate: "2024-10-18",
            status: "reviewed",
            avatar: "",
            experience: "5 năm",
            cvUrl: "#"
        },
        {
            id: "3",
            candidateName: "Lê Minh Cường",
            email: "cuong.le@email.com",
            phone: "0369258147",
            position: "Full Stack Developer",
            appliedDate: "2024-10-15",
            status: "accepted",
            avatar: "",
            experience: "4 năm",
            cvUrl: "#"
        },
        {
            id: "4",
            candidateName: "Phạm Thị Dung",
            email: "dung.pham@email.com",
            phone: "0789123456",
            position: "UI/UX Designer",
            appliedDate: "2024-10-12",
            status: "rejected",
            avatar: "",
            experience: "2 năm",
            cvUrl: "#"
        }
    ];

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                label: "Chờ xử lý",
                variant: "secondary" as const,
                icon: Clock,
                color: "text-yellow-600"
            },
            reviewed: {
                label: "Đã xem",
                variant: "default" as const,
                icon: Eye,
                color: "text-blue-600"
            },
            accepted: {
                label: "Chấp nhận",
                variant: "default" as const,
                icon: CheckCircle,
                color: "text-green-600"
            },
            rejected: {
                label: "Từ chối",
                variant: "destructive" as const,
                icon: XCircle,
                color: "text-red-600"
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <Badge variant={config.variant}>{config.label}</Badge>
            </div>
        );
    };

    const filteredApplications = applications.filter(app => {
        if (activeTab === "all") return true;
        return app.status === activeTab;
    });

    const getApplicationCounts = () => {
        return {
            all: applications.length,
            pending: applications.filter(app => app.status === "pending").length,
            reviewed: applications.filter(app => app.status === "reviewed").length,
            accepted: applications.filter(app => app.status === "accepted").length,
            rejected: applications.filter(app => app.status === "rejected").length,
        };
    };

    const counts = getApplicationCounts();

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Đơn ứng tuyển</h1>
                <p className="text-muted-foreground">Quản lý và xem xét các đơn ứng tuyển cho vị trí công việc</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng đơn</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{counts.all}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chấp nhận</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{counts.accepted}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Tất cả ({counts.all})</TabsTrigger>
                    <TabsTrigger value="pending">Chờ xử lý ({counts.pending})</TabsTrigger>
                    <TabsTrigger value="reviewed">Đã xem ({counts.reviewed})</TabsTrigger>
                    <TabsTrigger value="accepted">Chấp nhận ({counts.accepted})</TabsTrigger>
                    <TabsTrigger value="rejected">Từ chối ({counts.rejected})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((application) => (
                            <Card key={application.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={application.avatar} />
                                                <AvatarFallback>
                                                    {application.candidateName.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{application.candidateName}</CardTitle>
                                                <CardDescription>Ứng tuyển vị trí: {application.position}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(application.status)}
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(application.appliedDate).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{application.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{application.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Kinh nghiệm: {application.experience}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                                                <Download className="h-3 w-3 mr-1" />
                                                Tải CV
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {application.status === "pending" && (
                                            <>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Chấp nhận
                                                </Button>
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Từ chối
                                                </Button>
                                            </>
                                        )}
                                        <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Không có đơn ứng tuyển</h3>
                                <p className="text-muted-foreground">
                                    {activeTab === "all"
                                        ? "Chưa có đơn ứng tuyển nào được gửi đến."
                                        : `Không có đơn ứng tuyển nào ở trạng thái này.`}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}