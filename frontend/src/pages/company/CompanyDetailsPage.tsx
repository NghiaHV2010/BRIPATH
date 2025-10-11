// Company Details Page - VPBank Inspired Design
import { useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  Building2,
  Award,
  Clock,
  DollarSign,
  Plus,
  Search,
  Calendar,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useCompanyStore } from "../../store/company.store";
import { CompanyDetailSkeleton } from "../../components/company";

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyDetail, isLoading, fetchCompanyDetail } = useCompanyStore();

  // Get navigation state from previous page
  const navigationState = location.state as {
    scrollPosition?: number;
    preserveScroll?: boolean;
  } | null;

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetail(companyId);
    }
  }, [companyId, fetchCompanyDetail]);

  // Restore scroll position when returning from job detail
  useEffect(() => {
    if (
      navigationState?.preserveScroll &&
      typeof navigationState?.scrollPosition === "number"
    ) {
      setTimeout(() => {
        window.scrollTo(0, navigationState.scrollPosition!);
      }, 100);
    }
  }, [navigationState]);

  const handleJobClick = (jobId: string) => {
    // Save current state before navigating to job detail
    const currentState = {
      fromCompanyDetail: true,
      companyId: companyId,
      previousRoute: `/companies/${companyId}`,
      scrollPosition: window.scrollY,
    };
    navigate(`/jobs/${jobId}`, { state: currentState });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/companies/${companyId}`;
    navigator.clipboard.writeText(url);
    // You can add a toast notification here
  };

  if (isLoading || !companyDetail) {
    return (
      <Layout>
        <CompanyDetailSkeleton />
      </Layout>
    );
  }

  const { users, description, employees, jobs, _count } = companyDetail;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation Breadcrumb */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Danh sách Công ty
                </Link>
                <span className="text-slate-400">›</span>
                <span className="text-slate-900 font-medium">
                  {users?.username || "Company"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Theo dõi công ty
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section - Company Banner */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-300 rounded-full blur-2xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-20">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Company Logo */}
              <div className="w-36 h-36 bg-white rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0">
                {users?.avatar_url ? (
                  <img
                    src={users.avatar_url}
                    alt={users.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <Building2 className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <h1 className="text-5xl font-bold leading-tight">
                    {users?.username || "Company Name"}
                  </h1>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500 text-white border-0 px-4 py-2 text-sm font-medium">
                      Pro Company
                    </Badge>
                    <Badge className="bg-cyan-500 text-white border-0 px-4 py-2 text-sm font-medium">
                      ✓ Verified
                    </Badge>
                  </div>
                </div>

                {/* Company Description Preview */}
                {description && (
                  <p className="text-blue-100 text-xl mb-8 max-w-4xl leading-relaxed">
                    {description.split("\n")[0]?.trim() ||
                      description.substring(0, 200) +
                        (description.length > 200 ? "..." : "")}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-blue-100">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <MapPin className="w-6 h-6 text-blue-300" />
                    <div>
                      <div className="text-sm text-blue-200">Địa điểm</div>
                      <div className="font-semibold">
                        {users?.address_city || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Users className="w-6 h-6 text-blue-300" />
                    <div>
                      <div className="text-sm text-blue-200">Quy mô</div>
                      <div className="font-semibold">
                        {employees || "N/A"} nhân viên
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <Briefcase className="w-6 h-6 text-green-300" />
                    <div>
                      <div className="text-sm text-green-200">Tuyển dụng</div>
                      <div className="font-semibold">
                        {jobs?.length || 0} vị trí
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Company Info & Jobs */}
            <div className="lg:col-span-2 space-y-10">
              {/* Company Introduction */}
              <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Giới thiệu công ty
                  </h2>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    {description ? (
                      description
                        .split("\n")
                        .filter((paragraph) => paragraph.trim().length > 0)
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className="text-slate-700 text-lg leading-relaxed"
                          >
                            {paragraph.trim()}
                          </p>
                        ))
                    ) : (
                      <p className="text-slate-700 text-lg leading-relaxed">
                        Chúng tôi là một công ty hàng đầu trong lĩnh vực của
                        mình, luôn tìm kiếm những tài năng xuất sắc để cùng xây
                        dựng tương lai. Với môi trường làm việc năng động và
                        nhiều cơ hội phát triển, chúng tôi cam kết mang đến cho
                        nhân viên những trải nghiệm tốt nhất.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-600 font-medium">
                        Được theo dõi bởi
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {_count?.followedCompanies || 0}+ người
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Listings Section */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Vị trí tuyển dụng
                    <span className="ml-3 text-lg font-normal text-slate-500">
                      ({jobs?.length || 0} vị trí)
                    </span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Tìm công việc, vị trí ứng tuyển..."
                        className="pl-10 pr-4 py-3 w-80 border-slate-200 focus:border-green-300 focus:ring-green-200"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 px-6 py-3">
                      Tìm kiếm
                    </Button>
                  </div>
                </div>

                {/* Job Cards */}
                {jobs && jobs.length > 0 ? (
                  <div className="space-y-6">
                    {jobs.map((job, index) => (
                      <Card
                        key={job.id || index}
                        className="bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md rounded-2xl overflow-hidden group"
                        onClick={() => handleJobClick(job.id)}
                      >
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-6 flex-1">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-8 h-8 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
                                  {job.job_title}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">
                                      {job.location || "Remote"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">
                                      {job.jobCategories?.job_category ||
                                        "Full-time"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">
                                      {job.salary && job.salary.length > 0
                                        ? `${job.salary[0]} ${
                                            job.currency || "VND"
                                          }`
                                        : "Thỏa thuận"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      job.status === "Active"
                                        ? "default"
                                        : "outline"
                                    }
                                    className="bg-green-100 text-green-700 border-0 px-3 py-1"
                                  >
                                    {job.status === "Active"
                                      ? "🟢 Đang tuyển"
                                      : job.status}
                                  </Badge>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Còn 30 ngày để ứng tuyển</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="lg"
                              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 px-6 py-3 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJobClick(job.id);
                              }}
                            >
                              Ứng tuyển ngay
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white shadow-lg border-0 rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Chưa có vị trí tuyển dụng
                      </h3>
                      <p className="text-slate-500">
                        Hiện tại công ty chưa có vị trí tuyển dụng nào. Hãy theo
                        dõi để cập nhật thông tin mới nhất!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar - Contact & Sharing */}
            <div className="space-y-8">
              {/* Contact Information */}
              <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    Thông tin liên hệ
                  </h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {users?.email && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">
                          Email
                        </div>
                        <a
                          href={`mailto:${users.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {users.email}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">
                        Website
                      </div>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.company-website.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-6">Thống kê công ty</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                      <span className="text-blue-100">Người theo dõi</span>
                      <span className="text-xl font-bold">
                        {_count?.followedCompanies || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                      <span className="text-blue-100">Nhân viên</span>
                      <span className="text-xl font-bold">
                        {employees || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                      <span className="text-blue-100">Vị trí tuyển dụng</span>
                      <span className="text-xl font-bold text-green-300">
                        {jobs?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share Company */}
              <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    Chia sẻ công ty
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-sm text-slate-600 mb-4">
                    Sao chép đường dẫn
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={`${window.location.origin}/companies/${companyId}`}
                      readOnly
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-600"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm text-slate-600 mb-4">
                      Chia sẻ qua mạng xã hội
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-3 hover:bg-blue-50"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="#1877F2"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-3 hover:bg-blue-50"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="#1DA1F2"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-3 hover:bg-blue-50"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="#0A66C2"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
