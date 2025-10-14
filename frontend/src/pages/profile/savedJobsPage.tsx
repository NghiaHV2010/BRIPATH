import { useEffect, useState } from "react";
import Layout from "../../components/layout/layout";
import { getSavedJobs } from "@/api/job_api";
import { Link } from "react-router-dom";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getSavedJobs();
      if (mounted && res.success) setJobs(res.data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Việc làm đã lưu</h1>
            <p className="text-gray-600 text-sm mb-6">Danh sách việc làm bạn đã lưu sẽ hiển thị ở đây.</p>

            {loading ? (
              <div className="text-sm text-gray-500">Đang tải...</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">Chưa có dữ liệu.</div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.job_title}</h3>
                        <div className="text-sm text-gray-600">{job.jobCategories?.job_category || ""}</div>
                        <div className="text-sm text-gray-600">{job.location || ""}</div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {Array.isArray(job.salary) ? job.salary.join(" - ") : job.salary}
                        {job.currency ? ` ${job.currency}` : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
