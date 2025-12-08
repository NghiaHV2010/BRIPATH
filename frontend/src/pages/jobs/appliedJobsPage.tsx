import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Building2, Calendar, MapPin, Briefcase, DollarSign, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { getAppliedJobs, type AppliedJob } from "@/api";

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppliedJobs();
  }, [page, filterStatus]);

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const response = await getAppliedJobs(page, filterStatus);
      if (response.success) {
        setApplications(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Đã duyệt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSalary = (salary: string[], currency: string) => {
    if (!salary || salary.length === 0) return "Thỏa thuận";
    const formatted = salary.map(s => {
      const num = parseFloat(s);
      if (currency === "VND") {
        return `${(num / 1000000).toFixed(0)}tr`;
      }
      return `${num}`;
    }).join(" - ");
    return `${formatted} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (status: 'pending' | 'approved' | 'rejected' | undefined) => {
    setFilterStatus(status);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Việc làm đã ứng tuyển
        </h3>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterStatus === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(undefined)}
          >
            Tất cả
          </Button>
          <Button
            variant={filterStatus === 'pending' ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('pending')}
            className={filterStatus === 'pending' ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
          >
            <Clock className="h-4 w-4 mr-1" />
            Chờ duyệt
          </Button>
          <Button
            variant={filterStatus === 'approved' ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('approved')}
            className={filterStatus === 'approved' ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Đã duyệt
          </Button>
          <Button
            variant={filterStatus === 'rejected' ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('rejected')}
            className={filterStatus === 'rejected' ? "bg-red-100 text-red-800 hover:bg-red-200" : ""}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Từ chối
          </Button>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {filterStatus
                ? `Chưa có công việc nào với trạng thái "${filterStatus}".`
                : "Bạn chưa ứng tuyển công việc nào."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${application.jobs.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Avatar */}
                    <div className="shrink-0">
                      {application.jobs.companies.users.avatar_url ? (
                        <img
                          src={application.jobs.companies.users.avatar_url}
                          alt={application.jobs.companies.users.username}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {application.jobs.job_title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.jobs.companies.users.username}
                          </p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatSalary(application.jobs.salary, application.jobs.currency)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {application.jobs.location || "Chưa cập nhật"}
                        </div>
                        {application.jobs.jobCategories && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                            {application.jobs.jobCategories.job_category}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          Ứng tuyển:
                          <p className="">
                            {formatDate(application.apply_date)}
                          </p>
                        </div>
                      </div>

                      {/* Labels and CV Info */}
                      <div className="flex flex-wrap items-center gap-2">
                        {application.jobs.jobLabels && (
                          <Badge variant="secondary" className="text-xs">
                            {application.jobs.jobLabels.label_name}
                          </Badge>
                        )}
                      </div>

                      {/* Application Description */}
                      <div className="flex flex-col my-2 pt-2 border-t border-gray-100">
                        <Badge variant="outline" className="text-xs w-fit bg-blue-200">
                          Hồ sơ: {application.cvs.fullname}
                        </Badge>
                        {application.description && (
                          <div className="pt-3 ">
                            <p className="text-xs text-gray-500 mb-1">Thư giới thiệu:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {application.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {applications.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
