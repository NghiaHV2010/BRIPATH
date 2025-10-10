import { useJobStore } from "../../store/job.store";
import JobCard from "./JobCard";
import { Briefcase } from "lucide-react";
import { JobDetailSkeleton } from "./JobDetailSkeleton";

interface JobListProps {
  onJobClick?: (jobId: string) => void;
}

export default function JobList({ onJobClick }: JobListProps = {}) {
  const { jobs, isLoading } = useJobStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <JobDetailSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Không có công việc nào
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Hiện tại chưa có công việc nào được đăng tuyển. Hãy quay lại sau hoặc
          thử tìm kiếm với từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onClick={() => onJobClick?.(job.id)} />
      ))}
    </div>
  );
}
