import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Briefcase,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  Building2,
  Calendar,
  DollarSign,
  BookOpen,
  Trophy,
  Shield,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useJobStore } from "../../store/job.store";
import { JobDetailSkeleton } from "../../components/job";

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
  const [isApplied, setIsApplied] = useState(false);
  const isSaved = selectedJob?.isSaved || checkIfSaved(jobId || "");

  // Get navigation state from previous page (company detail or jobs page)
  const navigationState = routerLocation.state as {
    fromCompanyDetail?: boolean;
    companyId?: string;
    previousRoute?: string;
    scrollPosition?: number;
    fromPage?: number;
  } | null;

  useEffect(() => {
    if (jobId) {
      getJobById({ jobId });
    }
  }, [jobId, getJobById]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading || !selectedJob) {
    return (
      <Layout>
        <JobDetailSkeleton />
      </Layout>
    );
  }

  const {
    job_title,
    salary,
    currency,
    location,
    experience,
    description,
    benefit,
    working_time,
    job_type,
    job_level,
    quantity,
    skill_tags,
    education,
    start_date,
    end_date,
    companies,
  } = selectedJob;

  const formatSalary = () => {
    if (!salary || salary.length === 0) return "Thỏa thuận";
    return `${salary[0]} ${currency || "VND"}`;
  };

  const formatDeadline = () => {
    if (!end_date) return "Không giới hạn";
    return new Date(end_date).toLocaleDateString("vi-VN");
  };

  const handleApply = () => {
    // TODO: Implement apply job logic
    setIsApplied(true);
  };

  const handleSave = async () => {
    if (!jobId) return;

    if (isSaved) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (
                    navigationState?.fromCompanyDetail &&
                    navigationState.previousRoute
                  ) {
                    // Navigate back to company detail page and restore scroll position
                    navigate(navigationState.previousRoute, {
                      state: {
                        scrollPosition: navigationState.scrollPosition,
                        preserveScroll: true,
                      },
                    });
                  } else if (navigationState?.fromPage !== undefined) {
                    // Navigate back to jobs page with state
                    navigate("/jobs", {
                      state: {
                        fromPage: navigationState.fromPage,
                        scrollPosition: navigationState.scrollPosition,
                        preserveScroll: true,
                      },
                    });
                  } else {
                    // Fallback to simple back navigation
                    navigate(-1);
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                  onClick={handleSave}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
                  />
                  {isSaved ? "Đã lưu" : "Lưu tin"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Hero */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {job_title}
                      </h1>
                      <div className="flex items-center gap-2 text-lg text-blue-600">
                        <Building2 className="w-5 h-5" />
                        <span>{companies?.users?.username || "Công ty"}</span>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm text-gray-500">Mức lương</div>
                          <div className="font-semibold">{formatSalary()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="text-sm text-gray-500">Địa điểm</div>
                          <div className="font-semibold">
                            {location || "Không xác định"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Kinh nghiệm
                          </div>
                          <div className="font-semibold">
                            {experience || "Không yêu cầu"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm text-gray-500">Số lượng</div>
                          <div className="font-semibold">
                            {quantity || 1} người
                          </div>
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
                      <Button
                        onClick={handleApply}
                        disabled={isApplied}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                      </Button>
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
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Chi tiết tin tuyển dụng
                  </h2>

                  <div className="space-y-6">
                    {/* Job Description */}
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
                        <BookOpen className="w-4 h-4" />
                        Yêu cầu ứng viên
                      </h3>
                      <div className="space-y-3">
                        {education && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Học vấn:{" "}
                            </span>
                            <span className="text-gray-700">{education}</span>
                          </div>
                        )}
                        {experience && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Kinh nghiệm:{" "}
                            </span>
                            <span className="text-gray-700">{experience}</span>
                          </div>
                        )}
                        {job_level && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Cấp bậc:{" "}
                            </span>
                            <span className="text-gray-700">{job_level}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {skill_tags && skill_tags.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Kỹ năng cần có
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {skill_tags.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Benefits */}
                    {benefit && (
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
                            <Clock className="w-4 h-4" />
                            Thời gian làm việc
                          </h3>
                          <div className="space-y-2">
                            {working_time && (
                              <div>
                                <span className="font-medium text-gray-600">
                                  Giờ làm việc:{" "}
                                </span>
                                <span className="text-gray-700">
                                  {working_time}
                                </span>
                              </div>
                            )}
                            {job_type && (
                              <div>
                                <span className="font-medium text-gray-600">
                                  Hình thức:{" "}
                                </span>
                                <span className="text-gray-700">
                                  {job_type}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Application Instructions */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Cách thức ứng tuyển
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      • Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{" "}
                      <strong>Ứng tuyển ngay</strong>
                    </p>
                    <p>
                      • Hồ sơ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng
                      và bạn sẽ nhận được thông báo qua email
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
              {/* Company Info */}
              {companies && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Thông tin chung
                      </h3>
                      <Link
                        to={`/companies/${companies.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        Xem trang công ty
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {/* Company Logo & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {companies.users?.avatar_url ? (
                            <img
                              src={companies.users.avatar_url}
                              alt={companies.users.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {companies.users?.username}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {companies.fields?.field_name ||
                              "Chưa cập nhật ngành nghề"}
                          </p>
                        </div>
                      </div>

                      {/* Company Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {companies.users?.address_city || "Việt Nam"}
                          </span>
                        </div>
                        {companies.users?.address_street && (
                          <div className="text-gray-600 text-sm">
                            {[
                              companies.users.address_street,
                              companies.users.address_ward,
                              companies.users.address_city,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safety Tips */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Bi kíp tìm việc an toàn
                  </h3>
                  <div className="space-y-2 text-sm text-orange-700">
                    <p>
                      • Tuyệt đối không đưa tiền hoặc tài sản cho bất kỳ ai khi
                      ứng tuyển
                    </p>
                    <p>• Kiểm tra kỹ thông tin công ty trước khi nộp hồ sơ</p>
                    <p>• Chỉ nộp CV qua hệ thống chính thức của platform</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Apply Section - Mobile Sticky */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
                <div className="flex gap-3">
                  <Button
                    onClick={handleApply}
                    disabled={isApplied}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
                  </Button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
