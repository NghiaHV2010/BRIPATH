import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosConfig from "@/config/axios.config";
import { Users, Eye, CheckCircle, XCircle, Clock, Calendar, FileText, Briefcase, Loader2, GalleryHorizontalEnd, List, ChevronDown, Award, Code, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ResumeSwipeCard from "@/components/company/ResumeWipeCard";
import { getApplicantsByJobId, updateApplicantStatus, getAllApplicantsByJobId, filterSuitableApplicants, getAllSuitableApplicants, type SuitableApplicant } from "@/api/company_api";
import type { Applicant, ApplicantSummary } from "@/types/applicant";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Sparkles, Network } from "lucide-react";

interface JobSummary {
    id: string;
    job_title: string;
    quantity: number;
    end_date: string;
    jobCategories?: {
        job_category?: string;
    };
    jobLabels?: {
        label_name?: string | null;
    };
    _count: {
        applicants: number;
    };
}

interface JobsResponse {
    success: boolean;
    data: JobSummary[];
    totalPages: number;
}

export function JobApplicationsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [applicants, setApplicants] = useState<Applicant<ApplicantSummary>[]>([]);
    const [counts, setCounts] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"show" | "hide">("hide");
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant<ApplicantSummary> | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    // Reject all dialog states
    const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);
    const [rejectingAll, setRejectingAll] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    // Suitable applicants states
    const [loadingSuitable, setLoadingSuitable] = useState(false);
    const [loadingAllSuitable, setLoadingAllSuitable] = useState(false);
    const [suitableApplicants, setSuitableApplicants] = useState<SuitableApplicant[]>([]);
    const [showSuitableDialog, setShowSuitableDialog] = useState(false);
    const [suitableType, setSuitableType] = useState<'internal' | 'external'>('internal');

    // Get label badge styling
    const getLabelBadgeStyle = (labelName: string | null) => {
        if (!labelName) return null;

        if (labelName.toLowerCase().includes('gấp')) {
            return { className: "bg-red-50 rounded-md text-red-400 border-red-400 hover:bg-red-100", label: labelName };
        }
        if (labelName.toLowerCase().includes('chất')) {
            return { className: "bg-blue-500 text-white hover:bg-blue-600", label: labelName };
        }
        return { className: "bg-gray-500 text-white hover:bg-gray-600", label: labelName };
    };

    // Fetch company jobs with pagination
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await axiosConfig.get<JobsResponse>(`/my-jobs-summary?page=1`);
                if (response.data.success) {
                    setJobs(response.data.data);
                    setTotalPages(response.data.totalPages);
                    setCurrentPage(1);

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

    // Load more jobs
    const handleLoadMore = async () => {
        if (currentPage >= totalPages || loadingMore) return;

        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const response = await axiosConfig.get<JobsResponse>(`/my-jobs-summary?page=${nextPage}`);

            if (response.data.success) {
                setJobs(prevJobs => [...prevJobs, ...response.data.data]);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Error loading more jobs:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Fetch applicants for selected job
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

    useEffect(() => {
        fetchApplicants();
    }, [selectedJobId, activeTab]);

    const handleApprove = async (cvId: number) => {
        try {
            const result = await updateApplicantStatus([{
                applicant_id: cvId,
                job_id: selectedJobId,
                feedback: '',
                status: 'approved'
            }]);

            toast.success(`Đã chấp nhận ${result.data.count} ứng viên`);
            fetchApplicants();
        } catch (error) {
            toast.error('Lỗi khi chấp nhận ứng viên');
        }
    };

    const handleReject = async (cvId: number) => {
        try {
            const result = await updateApplicantStatus([{
                applicant_id: cvId,
                job_id: selectedJobId,
                feedback: '',
                status: 'rejected'
            }]);

            toast.success(`Đã từ chối ${result.data.count} ứng viên`);
            fetchApplicants();
        } catch (error) {
            toast.error('Lỗi khi từ chối ứng viên');
        }
    };

    const handleViewDetails = (applicant: Applicant<ApplicantSummary>) => {
        setSelectedApplicant(applicant);
        setViewMode("show");
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                label: "Chờ xử lý",
                variant: "secondary" as const,
                icon: Clock,
                color: "text-yellow-600 bg-yellow-50"
            },
            approved: {
                label: "Chấp nhận",
                variant: "default" as const,
                icon: CheckCircle,
                color: "text-green-600 bg-green-50"
            },
            rejected: {
                label: "Từ chối",
                variant: "destructive" as const,
                icon: XCircle,
                color: "text-red-600 bg-red-50"
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color}`}>
                <Icon className={`h-4 w-4`} />
                <span className="text-sm font-medium">{config.label}</span>
            </div>
        );
    };

    // Download all applicants CV data as Excel
    const handleDownloadAllApplicantsExcel = async () => {
        if (!selectedJobId) {
            toast.error('Vui lòng chọn công việc');
            return;
        }

        // Only allow download for pending and approved
        if (activeTab !== 'pending' && activeTab !== 'approved') {
            toast.error('Chỉ có thể xuất dữ liệu cho trạng thái "Chờ xử lý" hoặc "Đã chấp nhận"');
            return;
        }

        try {
            setDownloadingExcel(true);
            toast.info('Đang tải dữ liệu ứng viên...', {
                description: 'Vui lòng đợi trong giây lát'
            });

            // Fetch all applicants from API
            const response = await getAllApplicantsByJobId(
                selectedJobId,
                activeTab as 'pending' | 'approved'
            );

            if (!response.success || response.data.applicants.length === 0) {
                toast.info('Không có dữ liệu để xuất');
                return;
            }

            const allApplicants = response.data.applicants;
            const jobTitle = response.data.job_title;

            // Prepare data for Excel - Main sheet with basic info
            const mainData = allApplicants.map((app, index) => {
                const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';

                return {
                    'STT': index + 1,
                    'Họ và tên': app.cvs.fullname || 'N/A',
                    'Tuổi': app.cvs.age || 'N/A',
                    'Giới tính': app.cvs.gender || 'N/A',
                    'Email': app.cvs.email || 'N/A',
                    'Số điện thoại': app.cvs.phone || 'N/A',
                    'Địa chỉ': app.cvs.address || 'N/A',
                    'Vị trí ứng tuyển': jobTitle,
                    'Vị trí mong muốn': app.cvs.apply_job || 'N/A',
                    'Mục tiêu nghề nghiệp': app.cvs.career_goal || 'N/A',
                    'Kỹ năng chính': app.cvs.primary_skills?.join(', ') || 'N/A',
                    'Kỹ năng mềm': app.cvs.soft_skills?.join(', ') || 'N/A',
                    'Sở thích': app.cvs.hobbies || 'N/A',
                    'Số kinh nghiệm': app.cvs.experiences?.length || 0,
                    'Số dự án': app.cvs.projects?.length || 0,
                    'Số chứng chỉ': app.cvs.certificates?.length || 0,
                    'Số giải thưởng': app.cvs.awards?.length || 0,
                    'Số ngôn ngữ': app.cvs.languages?.length || 0,
                    'Giới thiệu': app.cvs.introduction || 'N/A',
                    'Mô tả ứng tuyển': app.description || 'N/A',
                    'Trạng thái': activeTab === 'pending' ? 'Chờ xử lý' : 'Đã chấp nhận',
                    'Ngày ứng tuyển': formatDate(app.apply_date),
                    'Ngày xét duyệt': formatDate(app.verified_date),
                    'Phản hồi': app.feedback || 'N/A',
                    'Thông tin khác': app.cvs.others || 'N/A'
                };
            });

            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Main sheet
            const mainSheet = XLSX.utils.json_to_sheet(mainData);
            XLSX.utils.book_append_sheet(workbook, mainSheet, 'Thông tin chung');

            // Experience sheet
            const experienceData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.experiences?.forEach((exp) => {
                    experienceData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Công ty': exp.company_name || 'N/A',
                        'Vị trí': exp.title || 'N/A',
                        'Mô tả': exp.description || 'N/A',
                        'Từ ngày': exp.start_date ? new Date(exp.start_date).toLocaleDateString('vi-VN') : 'N/A',
                        'Đến ngày': exp.end_date ? new Date(exp.end_date).toLocaleDateString('vi-VN') : 'Hiện tại'
                    });
                });
            });
            if (experienceData.length > 0) {
                const expSheet = XLSX.utils.json_to_sheet(experienceData);
                XLSX.utils.book_append_sheet(workbook, expSheet, 'Kinh nghiệm');
            }

            // Projects sheet
            const projectData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.projects?.forEach((proj) => {
                    projectData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Tên dự án': proj.title || 'N/A',
                        'Mô tả': proj.description || 'N/A',
                        'Từ ngày': proj.start_date ? new Date(proj.start_date).toLocaleDateString('vi-VN') : 'N/A',
                        'Đến ngày': proj.end_date ? new Date(proj.end_date).toLocaleDateString('vi-VN') : 'N/A'
                    });
                });
            });
            if (projectData.length > 0) {
                const projSheet = XLSX.utils.json_to_sheet(projectData);
                XLSX.utils.book_append_sheet(workbook, projSheet, 'Dự án');
            }

            // Education sheet
            const educationData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.educations?.forEach((edu) => {
                    educationData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Trường': edu.school || 'N/A',
                        'Bằng cấp': edu.graduated_type || 'N/A',
                        'GPA': edu.gpa || 'N/A',
                        'Từ ngày': edu.start_date ? new Date(edu.start_date).toLocaleDateString('vi-VN') : 'N/A',
                        'Đến ngày': edu.end_date ? new Date(edu.end_date).toLocaleDateString('vi-VN') : 'N/A'
                    });
                });
            });
            if (educationData.length > 0) {
                const eduSheet = XLSX.utils.json_to_sheet(educationData);
                XLSX.utils.book_append_sheet(workbook, eduSheet, 'Học vấn');
            }

            // Certificates sheet
            const certificateData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.certificates?.forEach((cert) => {
                    certificateData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Tên chứng chỉ': cert.title || 'N/A',
                        'Mô tả': cert.description || 'N/A',
                        'Link': cert.link || 'N/A',
                        'Ngày cấp': cert.start_date ? new Date(cert.start_date).toLocaleDateString('vi-VN') : 'N/A',
                        'Ngày hết hạn': cert.end_date ? new Date(cert.end_date).toLocaleDateString('vi-VN') : 'Không có'
                    });
                });
            });
            if (certificateData.length > 0) {
                const certSheet = XLSX.utils.json_to_sheet(certificateData);
                XLSX.utils.book_append_sheet(workbook, certSheet, 'Chứng chỉ');
            }

            // Awards sheet
            const awardData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.awards?.forEach((award) => {
                    awardData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Tên giải thưởng': award.title || 'N/A',
                        'Mô tả': award.description || 'N/A',
                        'Từ ngày': award.start_date ? new Date(award.start_date).toLocaleDateString('vi-VN') : 'N/A',
                        'Đến ngày': award.end_date ? new Date(award.end_date).toLocaleDateString('vi-VN') : 'N/A'
                    });
                });
            });
            if (awardData.length > 0) {
                const awardSheet = XLSX.utils.json_to_sheet(awardData);
                XLSX.utils.book_append_sheet(workbook, awardSheet, 'Giải thưởng');
            }

            // Languages sheet
            const languageData: any[] = [];
            allApplicants.forEach((app, idx) => {
                app.cvs.languages?.forEach((lang) => {
                    languageData.push({
                        'STT': idx + 1,
                        'Họ tên': app.cvs.fullname,
                        'Ngôn ngữ': lang.name || 'N/A',
                        'Trình độ': lang.level || 'N/A',
                        'Chứng chỉ': lang.certificate || 'N/A'
                    });
                });
            });
            if (languageData.length > 0) {
                const langSheet = XLSX.utils.json_to_sheet(languageData);
                XLSX.utils.book_append_sheet(workbook, langSheet, 'Ngôn ngữ');
            }

            // Set column widths for main sheet
            const columnWidths = [
                { wch: 5 },   // STT
                { wch: 25 },  // Họ và tên
                { wch: 8 },   // Tuổi
                { wch: 10 },  // Giới tính
                { wch: 30 },  // Email
                { wch: 15 },  // SĐT
                { wch: 40 },  // Địa chỉ
                { wch: 30 },  // Vị trí ứng tuyển
                { wch: 30 },  // Vị trí mong muốn
                { wch: 50 },  // Mục tiêu
                { wch: 60 },  // Kỹ năng chính
                { wch: 60 },  // Kỹ năng mềm
                { wch: 30 },  // Sở thích
                { wch: 12 },  // Số kinh nghiệm
                { wch: 10 },  // Số dự án
                { wch: 12 },  // Số chứng chỉ
                { wch: 12 },  // Số giải thưởng
                { wch: 12 },  // Số ngôn ngữ
                { wch: 50 },  // Giới thiệu
                { wch: 50 },  // Mô tả ứng tuyển
                { wch: 15 },  // Trạng thái
                { wch: 15 },  // Ngày ứng tuyển
                { wch: 15 },  // Ngày xét duyệt
                { wch: 50 },  // Phản hồi
                { wch: 50 }   // Thông tin khác
            ];
            mainSheet['!cols'] = columnWidths;

            // Style header rows for all sheets
            [mainSheet].forEach(sheet => {
                const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const address = XLSX.utils.encode_col(C) + "1";
                    if (!sheet[address]) continue;
                    sheet[address].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4472C4" } },
                        alignment: { horizontal: "center", vertical: "center" }
                    };
                }
            });

            // Generate file name
            const statusName = activeTab === 'pending' ? 'cho_xu_ly' : 'da_chap_nhan';
            const sanitizedJobTitle = jobTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
            const fileName = `CV_Ung_vien_${sanitizedJobTitle}_${statusName}_${new Date().getTime()}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, fileName);

            toast.success(`Đã xuất ${allApplicants.length} hồ sơ ứng viên ra file Excel`, {
                description: `File: ${fileName}`
            });
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Lỗi khi xuất file Excel', {
                description: 'Vui lòng thử lại sau'
            });
        } finally {
            setDownloadingExcel(false);
        }
    };

    // Reject all pending applicants
    const handleRejectAllConfirm = async () => {
        try {
            setRejectingAll(true);

            const pendingApplicants = applicants
                .filter(a => a.status === 'pending')
                .map(a => ({
                    applicant_id: a.cv_id,
                    job_id: selectedJobId,
                    feedback: 'Đơn ứng tuyển đã bị từ chối hàng loạt',
                    status: 'rejected' as const
                }));

            if (pendingApplicants.length === 0) {
                toast.info('Không có ứng viên nào đang chờ xử lý');
                setShowRejectAllDialog(false);
                return;
            }

            const result = await updateApplicantStatus(pendingApplicants);

            if (result.success) {
                toast.success(`Đã từ chối ${result.data.count} ứng viên`, {
                    description: 'Tất cả ứng viên đang chờ xử lý đã được chuyển sang trạng thái từ chối'
                });
                await fetchApplicants();
            }
        } catch (error) {
            toast.error('Lỗi khi từ chối ứng viên', {
                description: 'Vui lòng thử lại sau'
            });
        } finally {
            setRejectingAll(false);
            setShowRejectAllDialog(false);
        }
    };

    // Handle filter suitable applicants (internal - from pending applicants)
    const handleFilterSuitableApplicants = async () => {
        if (!selectedJobId) {
            toast.error('Vui lòng chọn công việc');
            return;
        }

        try {
            setLoadingSuitable(true);
            toast.info('Đang tìm kiếm ứng viên phù hợp...', {
                description: 'AI đang phân tích và sắp xếp ứng viên'
            });

            const response = await filterSuitableApplicants(selectedJobId);

            if (response.success && response.data.length > 0) {
                setSuitableApplicants(response.data);
                setSuitableType('internal');
                setShowSuitableDialog(true);
                toast.success(`Đã tìm thấy ${response.data.length} ứng viên phù hợp`, {
                    description: 'Danh sách được sắp xếp theo độ phù hợp giảm dần'
                });
            } else {
                toast.info('Không tìm thấy ứng viên phù hợp', {
                    description: 'Không có ứng viên đang chờ phù hợp với công việc này'
                });
            }
        } catch (error: any) {
            console.error('Error filtering suitable applicants:', error);
            if (error.response?.status === 403) {
                toast.error('Tính năng này không có trong gói của bạn', {
                    description: 'Vui lòng nâng cấp gói để sử dụng tính năng AI matching'
                });
            } else {
                toast.error('Lỗi khi tìm kiếm ứng viên phù hợp', {
                    description: 'Vui lòng thử lại sau'
                });
            }
        } finally {
            setLoadingSuitable(false);
        }
    };

    // Handle get all suitable applicants (external - from all CVs)
    const handleGetAllSuitableApplicants = async () => {
        if (!selectedJobId) {
            toast.error('Vui lòng chọn công việc');
            return;
        }

        try {
            setLoadingAllSuitable(true);
            toast.info('Đang tìm kiếm ứng viên tiềm năng...', {
                description: 'AI đang quét toàn bộ cơ sở dữ liệu CV'
            });

            const response = await getAllSuitableApplicants(selectedJobId);

            if (response.success && response.data.length > 0) {
                setSuitableApplicants(response.data);
                setSuitableType('external');
                setShowSuitableDialog(true);
                toast.success(`Đã tìm thấy ${response.data.length} ứng viên tiềm năng`, {
                    description: 'Đây là những ứng viên chưa ứng tuyển nhưng phù hợp với công việc'
                });
            } else {
                toast.info('Không tìm thấy ứng viên tiềm năng', {
                    description: 'Không có ứng viên nào khác phù hợp với công việc này'
                });
            }
        } catch (error: any) {
            console.error('Error getting all suitable applicants:', error);
            if (error.response?.status === 403) {
                toast.error('Tính năng này không có trong gói của bạn', {
                    description: 'Vui lòng nâng cấp gói để sử dụng tính năng AI networking'
                });
            } else {
                toast.error('Lỗi khi tìm kiếm ứng viên tiềm năng', {
                    description: 'Vui lòng thử lại sau'
                });
            }
        } finally {
            setLoadingAllSuitable(false);
        }
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">Đơn ứng tuyển</h3>
                    <p className="text-muted-foreground">Quản lý và xem xét các đơn ứng tuyển cho vị trí công việc</p>
                </div>

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
                        <CardDescription>
                            Hiển thị {jobs.length} công việc đang hoạt động
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                            <SelectTrigger className="w-full h-fit! min-h-16 p-0 border! border-slate-300!">
                                <SelectValue placeholder="Chọn một công việc để xem đơn ứng tuyển" className="w-full">
                                    {selectedJob && (
                                        <div className="flex items-center justify-start w-full sm:min-w-[600px] px-3 py-2">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className="font-medium line-clamp-1">{selectedJob.job_title}</span>
                                                    {selectedJob?.jobLabels?.label_name && (() => {
                                                        const labelStyle = getLabelBadgeStyle(selectedJob.jobLabels.label_name);
                                                        return labelStyle ? (
                                                            <Badge className={`${labelStyle.className} text-xs`}>
                                                                {labelStyle.label}
                                                            </Badge>
                                                        ) : null;
                                                    })()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs border-none font-normal p-0 text-slate-500">
                                                        {selectedJob?.jobCategories?.job_category || "Chưa phân loại"}
                                                    </Badge>
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                        {selectedJob._count.applicants} ứng viên
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {selectedJob.quantity} vị trí
                                                    </Badge>
                                                    {selectedJob.end_date && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-4 opacity-0 lg:opacity-100 ">
                                                            {new Date(selectedJob.end_date).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                <div className="max-h-[400px] overflow-y-auto overscroll-x-none w-full max-w-[940px] space-y-2">
                                    {jobs.map((job) => (
                                        <SelectItem
                                            key={job.id}
                                            value={job.id}
                                            className="cursor-pointer hover:shadow-sm border-b w-full p-0"
                                        >
                                            <div className="flex items-center justify-between w-full py-2 px-3 sm:min-w-[600px]">
                                                <div className="flex flex-col items-start gap-1.5 flex-1">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <span className="font-medium">{job.job_title}</span>
                                                        {job?.jobLabels?.label_name && (() => {
                                                            const labelStyle = getLabelBadgeStyle(job.jobLabels.label_name);
                                                            return labelStyle ? (
                                                                <Badge className={`${labelStyle.className} text-xs`}>
                                                                    {labelStyle.label}
                                                                </Badge>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="text-xs border-none font-normal p-0 text-slate-500">
                                                            {job?.jobCategories?.job_category || "Chưa phân loại"}
                                                        </Badge>
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                            {job._count.applicants} ứng viên
                                                        </Badge>
                                                        <Badge variant="outline" className="border-none font-normal text-slate-500">
                                                            {job.quantity} vị trí
                                                        </Badge>
                                                        {job.end_date && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-4 opacity-0 lg:opacity-100 ">
                                                                {new Date(job.end_date).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}

                                    {currentPage < totalPages && (
                                        <div className="p-2 border-t sticky bottom-0 bg-white">
                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Đang tải...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        Xem thêm ({totalPages - currentPage} trang)
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
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
                    <div className="space-y-4">
                        {/* AI Matching Buttons */}
                        <Card className="bg-linear-to-r from-purple-50 to-blue-50 border-purple-200">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    Tính năng AI Matching
                                </CardTitle>
                                <CardDescription>
                                    Sử dụng AI để tìm ứng viên phù hợp nhất với công việc
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button
                                        onClick={handleFilterSuitableApplicants}
                                        disabled={loadingSuitable || counts.pending === 0}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        {loadingSuitable ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang phân tích...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Lọc ứng viên đang chờ ({counts.pending})
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleGetAllSuitableApplicants}
                                        disabled={loadingAllSuitable}
                                        variant="outline"
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                        {loadingAllSuitable ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang tìm kiếm...
                                            </>
                                        ) : (
                                            <>
                                                <Network className="h-4 w-4 mr-2" />
                                                Tìm ứng viên tiềm năng
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Suitable Applicants Dialog */}
                    <Dialog open={showSuitableDialog} onOpenChange={setShowSuitableDialog}>
                        <DialogContent className="min-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogTitle className="flex items-center gap-2">
                                {suitableType === 'internal' ? (
                                    <>
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        Ứng viên phù hợp nhất ({suitableApplicants.length})
                                    </>
                                ) : (
                                    <>
                                        <Network className="h-5 w-5 text-blue-600" />
                                        Ứng viên tiềm năng ({suitableApplicants.length})
                                    </>
                                )}
                            </DialogTitle>

                            <div className="space-y-3">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        {suitableType === 'internal'
                                            ? '💡 Danh sách ứng viên đang chờ xử lý được sắp xếp theo độ phù hợp với công việc (điểm cao nhất: 100%)'
                                            : '🔍 Danh sách ứng viên tiềm năng chưa ứng tuyển nhưng có hồ sơ phù hợp với công việc này'
                                        }
                                    </p>
                                </div>

                                {suitableApplicants.map((applicant, index) => (
                                    <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <Badge
                                                            className={`${applicant.score >= 0.8 ? 'bg-green-500' :
                                                                applicant.score >= 0.6 ? 'bg-blue-500' :
                                                                    applicant.score >= 0.4 ? 'bg-yellow-500' :
                                                                        'bg-gray-500'
                                                                } text-white font-bold px-2 py-1`}
                                                        >
                                                            #{index + 1}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground mt-1">
                                                            {(applicant.score * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                                                        <AvatarImage src={applicant.users.avatar_url} />
                                                        <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                                                            {applicant.fullname.split(" ").map(n => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">
                                                                {applicant.fullname}
                                                            </h3>
                                                            <p className="text-sm text-primary font-medium">
                                                                {applicant.apply_job || 'N/A'}
                                                            </p>
                                                        </div>
                                                        {suitableType === 'internal' && applicant.status && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {applicant.status === 'pending' ? 'Chờ xử lý' : applicant.status}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-2">
                                                        <div className="flex items-center gap-1 bg-blue-50 p-1.5 rounded text-xs">
                                                            <Briefcase className="h-3 w-3 text-blue-600" />
                                                            <span className="font-semibold text-blue-600">
                                                                {applicant._count.experiences}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-purple-50 p-1.5 rounded text-xs">
                                                            <FileText className="h-3 w-3 text-purple-600" />
                                                            <span className="font-semibold text-purple-600">
                                                                {applicant._count.projects}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-green-50 p-1.5 rounded text-xs">
                                                            <Award className="h-3 w-3 text-green-600" />
                                                            <span className="font-semibold text-green-600">
                                                                {applicant._count.certificates}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-orange-50 p-1.5 rounded text-xs">
                                                            <Code className="h-3 w-3 text-orange-600" />
                                                            <span className="font-semibold text-orange-600">
                                                                {applicant.primary_skills?.length || 0}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {applicant.primary_skills && applicant.primary_skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {applicant.primary_skills.slice(0, 5).map((skill, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                            {applicant.primary_skills.length > 5 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{applicant.primary_skills.length - 5}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}

                                                    {suitableType === 'internal' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                // Navigate to applicant details
                                                                const applicantData = applicants.find(a => a.cv_id === applicant.id);
                                                                if (applicantData) {
                                                                    handleViewDetails(applicantData);
                                                                    setShowSuitableDialog(false);
                                                                }
                                                            }}
                                                            className="w-full"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Xem chi tiết
                                                        </Button>
                                                    )}

                                                    {suitableType === 'external' && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1"
                                                                onClick={() => {
                                                                    // TODO: Navigate to CV preview
                                                                    toast.info('Tính năng đang phát triển');
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Xem CV
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                                onClick={() => {
                                                                    // TODO: Send invitation
                                                                    toast.info('Tính năng đang phát triển');
                                                                }}
                                                            >
                                                                <Network className="h-4 w-4 mr-1" />
                                                                Mời ứng tuyển
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Dialogs */}
                    <AlertDialog open={showRejectAllDialog} onOpenChange={setShowRejectAllDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Xác nhận từ chối tất cả
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                    <p>
                                        Bạn có chắc chắn muốn từ chối <span className="font-bold text-red-600">{counts.pending}</span> ứng viên đang chờ xử lý?
                                    </p>
                                    <p className="text-sm">Hành động này sẽ:</p>
                                    <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                        <li>Chuyển tất cả ứng viên sang trạng thái "Đã từ chối"</li>
                                        <li>Gửi thông báo đến tất cả ứng viên</li>
                                        <li>Không thể hoàn tác sau khi thực hiện</li>
                                    </ul>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={rejectingAll}>Hủy bỏ</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRejectAllConfirm}
                                    disabled={rejectingAll}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {rejectingAll ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Từ chối tất cả
                                        </>
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Dialog open={viewMode === "show"} onOpenChange={(open) => {
                        setViewMode(open ? "show" : "hide");
                        if (!open) setSelectedApplicant(null);
                    }}>
                        <DialogTitle className="text-base font-medium border-b text-black">
                            <div className="flex justify-between items-center">
                                Hồ sơ ứng viên
                                <div className="flex gap-2">
                                    {activeTab === 'pending' && counts.pending > 0 && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setViewMode("hide");
                                                setShowRejectAllDialog(true);
                                            }}
                                            disabled={rejectingAll}
                                            className="bg-red-600 hover:bg-red-700 hover:scale-none cursor-pointer"
                                        >
                                            {rejectingAll ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Từ chối tất cả
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {(activeTab === 'pending' || activeTab === 'approved') && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleDownloadAllApplicantsExcel}
                                            disabled={downloadingExcel}
                                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                        >
                                            {downloadingExcel ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    Đang xuất...
                                                </>
                                            ) : (
                                                <>
                                                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                                                    Xuất Excel
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </DialogTitle>
                        <DialogContent className="min-w-6xl">
                            <ResumeSwipeCard
                                jobId={selectedJobId}
                                applicantsData={selectedApplicant ? [selectedApplicant] : applicants}
                                initialStatus={activeTab as 'pending' | 'approved' | 'rejected'}
                                onClose={() => {
                                    setViewMode("hide");
                                    setSelectedApplicant(null);
                                    fetchApplicants();
                                }}
                            />
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
                                    <Card key={`${application.cv_id}-${application.job_id}`} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-16 w-16 border-2 border-primary/10">
                                                    <AvatarImage src={application.cvs.users.avatar_url} />
                                                    <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                                                        {application.cvs.fullname.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                                {application.cvs.fullname}
                                                            </h3>
                                                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                                                <Briefcase className="h-4 w-4" />
                                                                {selectedJob?.job_title}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {getStatusBadge(application.status)}
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(application.apply_date).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {application.description && (
                                                        <p className="text-sm text-gray-600 bg-muted/50 p-3 rounded-lg">
                                                            {application.description}
                                                        </p>
                                                    )}

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                                                            <Briefcase className="h-4 w-4 text-blue-600" />
                                                            <div>
                                                                <p className="text-xs text-gray-600">Kinh nghiệm</p>
                                                                <p className="text-sm font-semibold text-blue-600">
                                                                    {application.cvs._count.experiences}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                                                            <FileText className="h-4 w-4 text-purple-600" />
                                                            <div>
                                                                <p className="text-xs text-gray-600">Dự án</p>
                                                                <p className="text-sm font-semibold text-purple-600">
                                                                    {application.cvs._count.projects}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                                                            <Award className="h-4 w-4 text-green-600" />
                                                            <div>
                                                                <p className="text-xs text-gray-600">Chứng chỉ</p>
                                                                <p className="text-sm font-semibold text-green-600">
                                                                    {application.cvs._count.certificates}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                                                            <Code className="h-4 w-4 text-orange-600" />
                                                            <div>
                                                                <p className="text-xs text-gray-600">Kỹ năng</p>
                                                                <p className="text-sm font-semibold text-orange-600">
                                                                    {application.cvs.primary_skills?.length || 0}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {application.cvs.primary_skills && application.cvs.primary_skills.length > 0 && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                                <Award className="h-4 w-4" />
                                                                Kỹ năng nổi bật
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {application.cvs.primary_skills.slice(0, 5).map((skill, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs font-normal">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                                {application.cvs.primary_skills.length > 5 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{application.cvs.primary_skills.length - 5}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewDetails(application)}
                                                            className="flex-1 sm:flex-none"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Chi tiết
                                                        </Button>

                                                        {application.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                                                                    onClick={() => handleApprove(application.cv_id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Chấp nhận
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                                                                    onClick={() => handleReject(application.cv_id)}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Từ chối
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
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
}

export default JobApplicationsPage;