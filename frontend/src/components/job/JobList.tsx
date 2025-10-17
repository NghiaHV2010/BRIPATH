import { useJobStore } from "../../store/job.store";
import JobCard from "./JobCard";
import { Briefcase } from "lucide-react";
import { JobDetailSkeleton } from "./JobDetailSkeleton";
import { toast } from "sonner";

interface JobListProps {
  onJobClick?: (jobId: string) => void;
}

export default function JobList({ onJobClick }: JobListProps = {}) {
  const { jobs, isLoading, saveJob, unsaveJob, checkIfSaved } = useJobStore();

  const handleSaveJob = async (jobId: string) => {
    const isSaved = checkIfSaved(jobId);
    if (isSaved) {
      await unsaveJob(jobId);
      toast.success("Hủy lưu công việc thành công", {
        duration: 3000,
      });
    } else {
      await saveJob(jobId);
      toast.success("Lưu công việc thành công", {
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 16 }).map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onClick={() => onJobClick?.(job.id)}
          onSave={() => handleSaveJob(job.id)}
          compact={false}
          isSaved={job.isSaved || false}
        />
      ))}
    </div>
  );
}
