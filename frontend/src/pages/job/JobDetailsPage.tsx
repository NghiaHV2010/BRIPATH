import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Shield } from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useJobStore } from "../../store/job.store";
import {
  JobDetailSkeleton,
  CompanyCard,
  JobHeroCard,
  JobDescriptionCard,
  JobApplicationInstructions,
} from "../../components/job";
import { ApplyJobDialog } from "../../components/job/ApplyJobDialog";
import { LoginDialog } from "../../components/login/LoginDialog";
import { useAuthStore } from "../../store/auth";
import axiosConfig from "../../config/axios.config";

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { selectedJob, isLoading, getJobById, saveJob, unsaveJob, checkIfSaved } = useJobStore();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pendingActionRef = useRef<null | "apply" | "save">(null);
  const [hasViewedJob, setHasViewedJob] = useState(false);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const authUser = useAuthStore((s) => s.authUser);
  const isSaved = !!(selectedJob?.isSaved || (jobId && checkIfSaved(jobId)));

  const navigationState = routerLocation.state as {
    fromCompanyDetail?: boolean;
    companyId?: string;
    previousRoute?: string;
    scrollPosition?: number;
    fromPage?: number;
  } | null;

  useEffect(() => {
    if (jobId) getJobById({ jobId });
  }, [jobId, getJobById]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (jobId && authUser && !hasViewedJob) {
      viewTimerRef.current = setTimeout(async () => {
        try {
          await axiosConfig.post(`/job-view/${jobId}`);
          setHasViewedJob(true);
        } catch (error) {
          console.error("Failed to track job view:", error);
        }
      }, 10000);

      return () => {
        if (viewTimerRef.current) {
          clearTimeout(viewTimerRef.current);
        }
      };
    }
  }, [jobId, authUser, hasViewedJob]);

  useEffect(() => {
    if (authUser && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;

      if (action === "apply") {
        setLoginOpen(false);
        setShowApplyDialog(true);
      } else if (action === "save") {
        setLoginOpen(false);
        if (jobId) {
          (async () => {
            if (isSaved) await unsaveJob(jobId);
            else await saveJob(jobId);
          })();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  useEffect(() => {
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, []);

  if (isLoading || !selectedJob) {
    return (
      <Layout>
        <JobDetailSkeleton />
      </Layout>
    );
  }

  const {
    job_title = "Chưa có tiêu đề",
    salary: salaryArray,
    currency,
    location = "Không xác định",
    experience = "Không yêu cầu",
    description = "",
    benefit = "Không xác định",
    working_time = "Không xác định",
    job_type = "Không xác định",
    job_level = "",
    quantity = 1,
    skill_tags = [],
    education = "",
    start_date,
    end_date,
    created_at,
    updated_at,
    companies,
    jobCategories,
    jobLabels,
  } = selectedJob;

  const salary =
    Array.isArray(salaryArray) && salaryArray.length > 0
      ? `${salaryArray[0]} ${currency || "VND"}`
      : `Thỏa thuận ${currency || "VND"}`;

  const company = companies
    ? {
      id: companies.id,
      name: companies.users?.username || "Công ty",
      avatar_url: companies.users?.avatar_url || "",
      field: companies.fields?.field_name || "Chưa cập nhật ngành nghề",
      address:
        [
          companies.users?.address_street,
          companies.users?.address_ward,
          companies.users?.address_city,
          companies.users?.address_country,
        ]
          .filter(Boolean)
          .join(", ") || location,
      company_type: (companies as any).company_type,
      is_verified: (companies as any).is_verified,
    }
    : null;

  const handleApply = () => {
    if (!authUser) {
      pendingActionRef.current = "apply";
      setLoginOpen(true);
      return;
    }
    setShowApplyDialog(true);
  };

  const handleApplySuccess = async () => {
    if (jobId) {
      await getJobById({ jobId });
    }
  };

  const handleSave = async () => {
    if (!jobId) return;

    if (!authUser) {
      pendingActionRef.current = "save";
      setLoginOpen(true);
      return;
    }

    if (isSaved) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  const handleShare = () => navigator.clipboard.writeText(window.location.href);

  const isApplied = !!(selectedJob.applicants && selectedJob.applicants.length > 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (navigationState?.fromCompanyDetail && navigationState.previousRoute) {
                  navigate(navigationState.previousRoute, {
                    state: {
                      scrollPosition: navigationState.scrollPosition,
                      preserveScroll: true,
                    },
                  });
                } else if (navigationState?.fromPage !== undefined) {
                  navigate("/jobs", {
                    state: {
                      fromPage: navigationState.fromPage,
                      scrollPosition: navigationState.scrollPosition,
                      preserveScroll: true,
                    },
                  });
                } else navigate(-1);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant={isSaved ? "outline" : "outline"}
                size="sm"
                onClick={handleSave}
                className={
                  isSaved ? "bg-white text-red-500 border-red-500 hover:bg-red-50" : ""
                }
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Đã lưu" : "Lưu tin"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <JobHeroCard
              job_title={job_title}
              salary={salary}
              location={location}
              experience={experience}
              quantity={quantity}
              end_date={end_date || undefined}
              jobCategories={jobCategories || undefined}
              jobLabels={jobLabels?.label_name ? jobLabels : undefined}
              isApplied={isApplied}
              isSaved={isSaved}
              applicants={selectedJob.applicants}
              onApply={handleApply}
              onSave={handleSave}
            />

            <JobDescriptionCard
              description={description}
              education={education}
              experience={experience}
              job_level={job_level}
              skill_tags={skill_tags}
              benefit={benefit || undefined}
              working_time={working_time || undefined}
              job_type={job_type}
              start_date={start_date}
              end_date={end_date || undefined}
              created_at={created_at}
              updated_at={updated_at}
            />

            <JobApplicationInstructions />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {company && <CompanyCard company={company} />}

            {/* Safety Tips */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-orange-700 text-sm space-y-2">
                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Bí kíp tìm việc an toàn
                </h3>
                <p>• Tuyệt đối không đưa tiền hoặc tài sản cho bất kỳ ai khi ứng tuyển</p>
                <p>• Kiểm tra kỹ thông tin công ty trước khi nộp hồ sơ</p>
                <p>• Chỉ nộp CV qua hệ thống chính thức của platform</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <img
                src="/src/assets/banner/9.jpg"
                alt="Company banner"
                className="w-full h-auto rounded-2xl object-cover transform transition-transform duration-500 hover:scale-105"
              />
            </Card>
          </div>
        </div>

        {jobId && (
          <ApplyJobDialog
            open={showApplyDialog}
            onOpenChange={setShowApplyDialog}
            jobId={jobId}
            jobTitle={job_title}
            onSuccess={handleApplySuccess}
          />
        )}
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    </Layout>
  );
}
