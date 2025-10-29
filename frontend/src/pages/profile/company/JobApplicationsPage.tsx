import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosConfig from "@/config/axios.config";
import { Users, Eye, CheckCircle, XCircle, Clock, Calendar, FileText, Download, Briefcase, Loader2, GalleryHorizontalEnd, List } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ResumeSwipeCard from "@/components/company/ResumeWipeCard";
import { getApplicantsByJobId } from "@/api/company_api";
import type { Applicant, ApplicantSummary } from "@/types/applicant";

interface Job {
    id: string;
    job_title: string;
    salary: number;
    currency: string;
    location: string;
    status: string;
    companies: {
        users: {
            avatar_url: string;
            username: string;
        };
    };
    jobCategories: {
        job_category: string;
    };
    jobLabels: {
        label_name: string;
    };
    _count: {
        applicants: number;
        job_views: number;
        savedJobs: number;
    };
}

export function JobApplicationsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applicants, setApplicants] = useState<Applicant<ApplicantSummary>[]>([]);
    const [counts, setCounts] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"show" | "hide">("hide");

    // Fetch company jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await axiosConfig.get('/my-jobs?page=1');
                if (response.data.success) {
                    setJobs(response.data.data);
                    // Auto-select first job if available
                    if (response.data.data.length > 0) {
                        setSelectedJobId(response.data.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Fetch applicants for selected job
    useEffect(() => {
        const fetchApplicants = async () => {
            if (!selectedJobId) return;

            try {
                setApplicantsLoading(true);
                const response = await getApplicantsByJobId(selectedJobId, activeTab as 'pending' | 'approved' | 'rejected');

                if (!response.success) {
                    setApplicants([]);
                    setCounts({ pending: 0, approved: 0, rejected: 0 });
                    return;
                }
                setApplicants(response.data.applicants);
                setCounts({
                    pending: response.data.total_pending,
                    approved: response.data.total_approved,
                    rejected: response.data.total_rejected,
                });
            } catch (error) {
                console.error('Error fetching applicants:', error);
                setApplicants([]);
                setCounts({ pending: 0, approved: 0, rejected: 0 });
            } finally {
                setApplicantsLoading(false);
            }
        };

        fetchApplicants();
    }, [selectedJobId, activeTab]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                label: "Chờ xử lý",
                variant: "secondary" as const,
                icon: Clock,
                color: "text-yellow-600"
            },
            approved: {
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

    const selectedJob = jobs.find(job => job.id === selectedJobId);

    if (loading) {
        return (
            <div className="max-w-5xl w-full min-h-screen p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-5xl w-full min-h-screen p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">Đơn ứng tuyển</h3>
                    <p className="text-muted-foreground">Quản lý và xem xét các đơn ứng tuyển cho vị trí công việc</p>
                </div>

                {/* Applications Tabs */}
                <div className="">
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "show" | "hide")}>
                        <TabsList className="gap-2">
                            <TabsTrigger value="show">
                                <GalleryHorizontalEnd className="size-6" />
                            </TabsTrigger>
                            <TabsTrigger value="hide">
                                <List className="size-6" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Job Selection */}
            {jobs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Chọn công việc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn một công việc để xem đơn ứng tuyển">
                                    {selectedJob && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{selectedJob.job_title}</span>
                                            <Badge variant="outline">
                                                {selectedJob._count.applicants} ứng viên
                                            </Badge>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{job.job_title}</span>
                                            <Badge variant="outline" className="ml-2">
                                                {job._count.applicants} ứng viên
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {!selectedJobId ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Chọn công việc</h3>
                        <p className="text-muted-foreground">
                            Vui lòng chọn một công việc để xem danh sách ứng viên.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
                                <p className="text-xs text-muted-foreground">Đơn ứng tuyển cần xem xét</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Chấp nhận</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
                                <p className="text-xs text-muted-foreground">Đơn đã được chấp nhận</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
                                <p className="text-xs text-muted-foreground">Đơn đã bị từ chối</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Dialog open={viewMode === "show"} onOpenChange={(open) => setViewMode(open ? "show" : "hide")}>
                        <DialogTitle className="text-base font-medium border-b text-black">
                            Hồ sơ ứng viên
                        </DialogTitle>
                        <DialogContent className="min-w-6xl">
                            <ResumeSwipeCard jobId={selectedJobId} applicantsData={applicants} />
                        </DialogContent>
                    </Dialog>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="pending">Chờ xử lý ({counts.pending})</TabsTrigger>
                            <TabsTrigger value="approved">Chấp nhận ({counts.approved})</TabsTrigger>
                            <TabsTrigger value="rejected">Từ chối ({counts.rejected})</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4">
                            {applicantsLoading ? (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                        <p className="text-muted-foreground">Đang tải danh sách ứng viên...</p>
                                    </CardContent>
                                </Card>
                            ) : applicants.length > 0 ? (
                                applicants.map((application) => (
                                    <Card key={`${application.cv_id}-${application.job_id}`}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={application.cvs.users.avatar_url} />
                                                        <AvatarFallback>
                                                            {application.cvs.fullname.split(" ").map(n => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg">{application.cvs.fullname}</CardTitle>
                                                        <CardDescription>
                                                            Ứng tuyển vị trí: {selectedJob?.job_title}
                                                        </CardDescription>
                                                        {application.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {application.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(application.status)}
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(application.apply_date).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        Kinh nghiệm: {application.cvs._count.experiences} công việc
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {application.cvs._count.projects} dự án
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        Tạo CV: {new Date(application.cvs.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            {application.cvs.primary_skills && application.cvs.primary_skills.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium mb-2">Kỹ năng chính:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {application.cvs.primary_skills.slice(0, 6).map((skill, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {application.cvs.primary_skills.length > 6 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{application.cvs.primary_skills.length - 6} khác
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

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
                                                    Xem chi tiết CV
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Tải CV
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
                                            {activeTab === "pending" && "Chưa có đơn ứng tuyển nào cần xem xét."}
                                            {activeTab === "approved" && "Chưa có đơn ứng tuyển nào được chấp nhận."}
                                            {activeTab === "rejected" && "Chưa có đơn ứng tuyển nào bị từ chối."}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
} export default JobApplicationsPage;