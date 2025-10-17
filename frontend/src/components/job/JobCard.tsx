import { MapPin, Briefcase, DollarSign, Building2, Heart } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Job } from "../../types/job";
import { LoginDialog } from "../login/LoginDialog";
import { useAuthStore } from "../../store/auth";
import { useState, useRef, useEffect } from "react";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onSave?: () => void;
  onApply?: () => void;
  isSaved?: boolean;
  compact?: boolean;
}

export default function JobCard({
  job,
  onClick,
  onSave,
  onApply,
  isSaved = false,
  compact = false,
}: JobCardProps) {
  const authUser = useAuthStore((s) => s.authUser);
  const [loginOpen, setLoginOpen] = useState(false);
  // Ref used to temporarily ignore card clicks (covers dialog overlay clicks)
  const ignoreClicksRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const handleLoginOpenChange = (open: boolean) => {
    if (open) {
      ignoreClicksRef.current = true;
      // ensure any pending timer is cleared
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setLoginOpen(true);
    } else {
      setLoginOpen(false);
      closeTimerRef.current = window.setTimeout(() => {
        ignoreClicksRef.current = false;
        closeTimerRef.current = null;
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const formatSalary = (salary?: string[], currency?: string) => {
    if (!salary || salary.length === 0) return "Competitive salary";
    return `${salary[0]} ${currency || "VND"}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "on_going":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
            Đang tuyển
          </Badge>
        );
      case "paused":
        return <Badge variant="secondary">Tạm dừng</Badge>;
      case "closed":
        return <Badge variant="outline">Đã đóng</Badge>;
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            Mới
          </Badge>
        );
    }
  };

  const getJobLabelBadge = (labelName?: string) => {
    switch (labelName) {
      case "Việc gấp":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 absolute -top-1 right-0 z-10 p-2 rounded-br-none">
            Việc Gấp
          </Badge>
        );
      case "Việc Hot":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 absolute -top-1 right-0 z-10 p-2 rounded-br-none">
            Việc HOT
          </Badge>
        );
      case "Việc chất":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 absolute -top-1 right-0 z-10 p-2 rounded-br-none">
            Việc Chất
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (ignoreClicksRef.current) return;
    onClick?.();
  };

  // ✅ Check if user has applied
  const hasApplied = (job.applicants?.length ?? 0) > 0;

  return (
    <Card
      onClick={handleCardClick}
      className="group cursor-pointer transition-all duration-300
      hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1
      border border-gray-200 hover:border-blue-300
      w-full h-full flex flex-col justify-between
      rounded-2xl bg-white overflow-hidden relative"
    >
      {getJobLabelBadge(job.jobLabels?.label_name || job?.label_name)}
      <CardContent
        className={`relative flex flex-col justify-between ${
          compact ? "p-3" : "px-4 py-5 sm:px-6"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 w-full">
            {/* Avatar */}
            {job.companies?.users?.avatar_url || job?.avatar_url ? (
              <img
                src={job?.companies?.users?.avatar_url || job?.avatar_url}
                alt="Company Avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                {job.job_title}
              </h3>
            </div>

            {/* Save button */}
            <Button
              variant="custom"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (!authUser) {
                  // open login dialog via wrapper so we ignore the following click
                  handleLoginOpenChange(true);
                  return;
                }
                onSave?.();
              }}
              className="p-1 h-8 w-8 border-0 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.location || "Remote"}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-green-600 truncate">
              {formatSalary(job.salary, job.currency)}
            </span>
          </div>

          {job.jobCategories && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{job.jobCategories.job_category}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto">{getStatusBadge(job.status)}</div>

          {!compact && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(); // navigate sang job detail
              }}
              className={`shadow-sm rounded-md w-full sm:w-auto ${
                hasApplied
                  ? "bg-emerald-600 text-white cursor-not-allowed hover:bg-emerald-700"
                  : "bg-emerald-400 text-white hover:bg-emerald-500"
              }`}
              disabled={hasApplied}
            >
              {hasApplied ? "✓ Đã ứng tuyển" : "Ứng tuyển"}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Login Dialog */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={handleLoginOpenChange}
        redirectTo={window.location.pathname}
      />
    </Card>
  );
}
