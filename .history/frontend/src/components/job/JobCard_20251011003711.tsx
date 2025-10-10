import { MapPin, Briefcase, DollarSign, Building2, Clock, Bookmark } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Job } from "../../types/job";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onSave?: () => void;
  onApply?: () => void;
  isSaved?: boolean;
}

export default function JobCard({ 
  job, 
  onClick, 
  onSave, 
  onApply,
  isSaved = false 
}: JobCardProps) {
  // Format salary display
  const formatSalary = (salary?: string[], currency?: string) => {
    if (!salary || salary.length === 0) return "Competitive salary";
    const salaryRange = salary[0];
    return `${salaryRange} ${currency || "VND"}`;
  };

  // Get job status display
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "on_going":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Đang tuyển</Badge>;
      case "paused":
        return <Badge variant="secondary">Tạm dừng</Badge>;
      case "closed":
        return <Badge variant="outline">Đã đóng</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Mới</Badge>;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 border-gray-200 hover:border-blue-300 overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Job Title */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
            {job.job_title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} />
          </Button>
        </div>

        {/* Company Info */}
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 truncate">
            Company Name
          </span>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{job.location || "Remote"}</span>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-green-600">
              {formatSalary(job.salary, job.currency)}
            </span>
          </div>

          {/* Job Category */}
          {job.jobCategories && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{job.jobCategories.job_category}</span>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {getStatusBadge(job.status)}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>2 ngày trước</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Ứng tuyển
          </Button>
        </div>

        {/* Hover Effect Indicator */}
        <div className="mt-3 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              Nhấn để xem chi tiết
            </span>
            <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}