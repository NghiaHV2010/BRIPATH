import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Users,
  Briefcase,
  Building2,
  Copy,
  ArrowLeft,
  CircleChevronDown,
  UserRoundCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

import { CompanyDetailSkeleton } from "../../components/company";
import CompanyMap from "@/components/utils/CompanyMap";
import { getCompanyDetails } from "@/api/company_api";
import { useAuthStore } from "../../store/auth";
import { useCompanyStore } from "../../store/company.store";
import { LoginDialog } from "../../components/login/LoginDialog";
import { toast } from "sonner";
import type { CompanyDetail } from "@/types/company";
import { JobCard } from "@/components/job";
import { saveJobApi, unsaveJobApi } from "@/api/job_api";

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [companyDetail, setCompanyDetail] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const {
    followCompany: followCompanyStore,
    unfollowCompany: unfollowCompanyStore,
  } = useCompanyStore();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAuthStore((s) => s.authUser);
  const userId = authUser?.id; // 👈 lấy userId trực tiếp

  // Khôi phục vị trí scroll khi quay lại
  const navigationState = location.state as {
    scrollPosition?: number;
    preserveScroll?: boolean;
  } | null;

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;
      try {
        setIsLoading(true);
        const res = await getCompanyDetails(
          userId ?? "",
          companyId,
          currentPage
        );

        setCompanyDetail(res.data || null);
        setTotalPages(res.totalPages || 1);
        // Initialize follow state from backend response
        setIsFollowed(
          Array.isArray(res.data?.followedCompanies) &&
          res.data.followedCompanies.length > 0
        );
      } catch (err) {
        console.error("Error fetching company details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, currentPage, userId]);

  const handleFollow = async () => {
    if (!authUser) {
      setLoginOpen(true);
      return;
    }

    if (!companyId) return;

    try {
      if (isFollowed) {
        await unfollowCompanyStore(companyId);

        setIsFollowed(false);
      } else {
        await followCompanyStore(companyId);

        setIsFollowed(true);
      }
    } catch (err) {
      console.error("Error following/unfollowing company:", err);
    }
  };

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

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/companies/${companyId}`;
    navigator.clipboard.writeText(url);
  };

  if (isLoading || !companyDetail) {
    return (
      <Layout>
        <CompanyDetailSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Link to="/" className="hover:text-blue-600">
                Danh sách Công ty
              </Link>
              <span className="text-slate-400">›</span>
              <span className="text-slate-900 font-medium">
                {companyDetail.users?.username || "Company"}
              </span>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row gap-8">
            {/* Logo */}
            <div className="relative">
              {companyDetail.is_verified && (
                <CircleChevronDown className="size-8 absolute -top-1 -right-2 text-white bg-cyan-400 rounded-full" />
              )}
              <div className="w-36 h-36 bg-white rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                {companyDetail.users?.avatar_url ? (
                  <img
                    src={companyDetail.users.avatar_url}
                    alt={companyDetail.users.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-slate-200 h-full">
                    <Building2 className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <h1 className="text-5xl font-bold">{companyDetail.users?.username}</h1>
                <div className="flex gap-4 items-center">
                  <Button
                    onClick={handleFollow}
                    className={
                      isFollowed ? "!bg-blue-400" : "!bg-white !text-blue-600"
                    }
                  >
                    {isFollowed ? "Đã theo dõi" : "Theo dõi công ty"}
                  </Button>
                  <span className="flex items-center gap-2 text-sm text-blue-100">
                    <UserRoundCheck className="size-4" />
                    <p>{companyDetail._count?.followedCompanies || 0} Người theo dõi</p>
                  </span>
                </div>
              </div>

              {companyDetail.description && (
                <p className="text-blue-100 text-xl mb-8 max-w-4xl">
                  {companyDetail.description.split("\n")[0]?.trim() ||
                    companyDetail.description.substring(0, 200) +
                    (companyDetail.description.length > 200 ? "..." : "")}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-blue-100">
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                  <MapPin className="w-6 h-6 text-blue-300" />
                  <div>
                    <div className="text-sm text-blue-200">Địa điểm</div>
                    <div className="font-semibold">
                      {companyDetail.users?.address_city || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                  <Users className="w-6 h-6 text-blue-300" />
                  <div>
                    <div className="text-sm text-blue-200">Quy mô</div>
                    <div className="font-semibold">
                      {companyDetail.employees || "N/A"} nhân viên
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                  <Briefcase className="w-6 h-6 text-green-300" />
                  <div>
                    <div className="text-sm text-green-200">Tuyển dụng</div>
                    <div className="font-semibold">
                      {companyDetail._count?.jobs || 0} vị trí
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
            {/* Left: Jobs */}
            <div className="lg:col-span-2 space-y-10">
              <Card className="bg-white shadow-lg rounded-2xl">
                <CardHeader className="bg-blue-50 pb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Giới thiệu công ty
                  </h2>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {companyDetail.description
                    ?.split("\n")
                    .filter((p) => p.trim())
                    .map((p, index) => (
                      <p
                        key={index}
                        className="text-slate-700 text-lg leading-relaxed"
                      >
                        {p.trim()}
                      </p>
                    ))}
                </CardContent>
              </Card>

              {/* Jobs */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Vị trí tuyển dụng
                  <span className="ml-3 text-lg font-normal text-slate-500">
                    ({companyDetail._count?.jobs || 0} vị trí)
                  </span>
                </h2>

                {companyDetail.jobs && companyDetail.jobs.length > 0 ? (
                  <div className="space-y-6">
                    {companyDetail.jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        // onSave={() => handleSaveJob(job.id)}
                        compact={false}
                        isSaved={job.isSaved || false}
                      />
                    ))}

                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1 || isLoading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                        </Button>
                        <span>
                          Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages || isLoading}
                        >
                          Tiếp <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="p-12 text-center text-slate-600">
                    Chưa có vị trí tuyển dụng nào.
                  </Card>
                )}
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-8">
              <Card className="bg-white shadow-lg rounded-2xl">
                <CompanyMap
                  companyName={companyDetail.users?.username || "Company"}
                  lat={10.77611}
                  lng={106.69583}
                />
              </Card>

              <Card className="bg-white shadow-lg rounded-2xl">
                <CardHeader className="bg-blue-50 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    Chia sẻ công ty
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Login Dialog for follow action when unauthenticated */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo={window.location.pathname}
      />
    </Layout>
  );
}
