import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Briefcase,
  Clock,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  BookOpen,
  Trophy,
  Shield,
  Tag,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useJobStore } from "../../store/job.store";
import { JobDetailSkeleton, CompanyCard } from "../../components/job";
import { ApplyJobDialog } from "../../components/job/ApplyJobDialog";
import { LoginDialog } from "../../components/login/LoginDialog";
import { useAuthStore } from "../../store/auth";
import axiosConfig from "../../config/axios.config";

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const {
    selectedJob,
    isLoading,
    getJobById,
    saveJob,
    unsaveJob,
    checkIfSaved,
  } = useJobStore();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pendingActionRef = useRef<null | "apply" | "save">(null);
  const [hasViewedJob, setHasViewedJob] = useState(false);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const authUser = useAuthStore((s) => s.authUser);

  // Safe isSaved
  const isSaved = !!(selectedJob?.isSaved || (jobId && checkIfSaved(jobId)));

  // Get navigation state from previous page
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

  // Track job view after 10 seconds
  useEffect(() => {
    if (jobId && authUser && !hasViewedJob) {
      viewTimerRef.current = setTimeout(async () => {
        try {
          await axiosConfig.post(`/job-view/${jobId}`);
          setHasViewedJob(true);
        } catch (error) {
          console.error("Failed to track job view:", error);
        }
      }, 10000); // 10 seconds

      // Cleanup timer on component unmount or dependencies change
      return () => {
        if (viewTimerRef.current) {
          clearTimeout(viewTimerRef.current);
        }
      };
    }
  }, [jobId, authUser, hasViewedJob]);

  // Resume pending action after successful login
  useEffect(() => {
    if (authUser && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;

      if (action === "apply") {
        setLoginOpen(false);
        setShowApplyDialog(true);
      } else if (action === "save") {
        setLoginOpen(false);
        // trigger save flow
        if (jobId) {
          // fire and forget
          (async () => {
            if (isSaved) await unsaveJob(jobId);
            else await saveJob(jobId);
          })();
        }
      }
    }
    // Only watch authUser
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Cleanup timer on unmount
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

  // Destructure safely with defaults
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
      address: [
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

  const formatJobType = (type: string) => {
    switch (type) {
      case "remote":
        return "Làm việc từ xa";
      case "part_time":
        return "Bán thời gian";
      case "full_time":
        return "Toàn thời gian";
      case "others":
        return "Khác";
      default:
        return type;
    }
  };

  const formatEducation = (edu: string) => {
    switch (edu) {
      case "bachelor":
        return "Cử nhân";
      case "master":
        return "Thạc sĩ";
      case "phd":
        return "Tiến sĩ";
      case "highschool_graduate":
        return "Tốt nghiệp THPT";
      case "others":
        return "Khác";
      default:
        return edu || "Không yêu cầu";
    }
  };

  const formatDeadline = () => {
    if (!end_date) return "Không giới hạn";
    return new Date(end_date).toLocaleDateString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApply = () => {
    // If user is not logged in, open login dialog instead of apply dialog
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

    // Require login for saving jobs
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (
                  navigationState?.fromCompanyDetail &&
                  navigationState.previousRoute
                ) {
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
                  isSaved
                    ? "bg-white text-red-500 border-red-500 hover:bg-red-50"
                    : ""
                }
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
                />
                {isSaved ? "Đã lưu" : "Lưu tin"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Hero */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {job_title}
                  </h2>

                  {/* Job Category and Label */}
                  <div className="flex flex-wrap gap-2">
                    {jobCategories && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Tag className="w-3 h-3 mr-1" />
                        {jobCategories.job_category}
                      </Badge>
                    )}
                    {jobLabels && (
                      <Badge
                        variant="secondary"
                        className={
                          jobLabels.label_name === "Việc gấp"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : jobLabels.label_name === "Việc Hot"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-green-100 text-green-700 border-green-200"
                        }
                      >
                        {jobLabels.label_name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">Mức lương</div>
                      <div className="font-semibold">{salary}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-sm text-gray-500">Địa điểm</div>
                      <div className="font-semibold">{location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-sm text-gray-500">Kinh nghiệm</div>
                      <div className="font-semibold">{experience}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">Số lượng</div>
                      <div className="font-semibold">{quantity} người</div>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                {end_date && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Hạn nộp hồ sơ: {formatDeadline()}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {selectedJob.applicants &&
                    selectedJob.applicants.length > 0 ? (
                    <div className="relative group flex-1">
                      <Button
                        disabled
                        className="w-full bg-emerald-600 text-white cursor-not-allowed opacity-80 hover:bg-emerald-700"
                      >
                        ✓ Đã ứng tuyển
                      </Button>
                      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block z-50">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        {selectedJob.applicants.map(
                          (
                            a: { apply_date: string; description?: string },
                            idx: number
                          ) => {
                            const applyDate = new Date(a.apply_date);
                            const date = applyDate.toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            });
                            const time = applyDate.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            return (
                              <div
                                key={idx}
                                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 min-w-[280px] border border-gray-200 hover:border-gray-300"
                              >
                                {/* Header with date/time info */}
                                <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">
                                      <span className="text-gray-500">
                                        Ngày ứng tuyển:
                                      </span>{" "}
                                      <strong className="text-gray-900 font-semibold">
                                        {date}
                                      </strong>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">
                                      <span className="text-gray-500">
                                        Thời gian:
                                      </span>{" "}
                                      <strong className="text-gray-900 font-semibold">
                                        {time}
                                      </strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Cover letter section */}
                                {a.description && (
                                  <div className="pt-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                      Cover letter:
                                    </div>
                                    <div className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                      {a.description}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleApply}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Ứng tuyển ngay
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className={isSaved ? "border-red-500 text-red-500" : ""}
                  >
                    <Heart
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Chi tiết tin tuyển dụng
                </h2>

                {description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Mô tả công việc
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Yêu cầu ứng viên
                  </h3>
                  <div className="space-y-3">
                    {education && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Học vấn:{" "}
                        </span>
                        <span>{formatEducation(education)}</span>
                      </div>
                    )}
                    {experience && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Kinh nghiệm:{" "}
                        </span>
                        <span>{experience}</span>
                      </div>
                    )}
                    {job_level && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Cấp bậc:{" "}
                        </span>
                        <span>{job_level}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {skill_tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Kỹ năng cần có
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skill_tags.map((skill, i) => (
                          <Badge key={i} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Benefits */}
                {benefit && benefit !== "Không xác định" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Quyền lợi
                      </h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {benefit}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Working Conditions */}
                {(working_time || job_type) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Thời gian làm việc
                      </h3>
                      <div className="space-y-2">
                        {working_time && working_time !== "Không xác định" && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Giờ làm việc:{" "}
                            </span>
                            <span>{working_time}</span>
                          </div>
                        )}
                        {job_type && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Hình thức:{" "}
                            </span>
                            <span>{formatJobType(job_type)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Job Timeline */}
                {(start_date || end_date || created_at || updated_at) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Thông tin tuyển dụng
                      </h3>
                      <div className="space-y-2">
                        {start_date && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Ngày bắt đầu:{" "}
                            </span>
                            <span>{formatDate(start_date)}</span>
                          </div>
                        )}
                        {end_date && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Hạn nộp hồ sơ:{" "}
                            </span>
                            <span>{formatDate(end_date)}</span>
                          </div>
                        )}
                        {created_at && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Ngày đăng tin:{" "}
                            </span>
                            <span>{formatDateTime(created_at)}</span>
                          </div>
                        )}
                        {updated_at && created_at !== updated_at && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Cập nhật cuối:{" "}
                            </span>
                            <span>{formatDateTime(updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Application Instructions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Cách thức ứng tuyển
                </h2>
                <div className="space-y-3 text-gray-700 text-sm">
                  <p>
                    • Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{" "}
                    <strong>Ứng tuyển ngay</strong>
                  </p>
                  <p>
                    • Hồ sơ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng và
                    bạn sẽ nhận được thông báo qua email
                  </p>
                  <p>
                    • Nếu phù hợp, nhà tuyển dụng sẽ liên hệ với bạn qua thông
                    tin liên lạc mà bạn đã cung cấp
                  </p>
                </div>
              </CardContent>
            </Card>
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
                <p>
                  • Tuyệt đối không đưa tiền hoặc tài sản cho bất kỳ ai khi ứng
                  tuyển
                </p>
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

            {/* Add company*/}
            {/* Add job*/}
          </div>
        </div>

        {/* Apply Job Dialog */}
        {jobId && (
          <ApplyJobDialog
            open={showApplyDialog}
            onOpenChange={setShowApplyDialog}
            jobId={jobId}
            jobTitle={job_title}
            onSuccess={handleApplySuccess}
          />
        )}
        {/* Login Dialog shown when unauthenticated users try to apply or save */}
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    </Layout>
  );
}
