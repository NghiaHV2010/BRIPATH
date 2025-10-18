import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  getUserCareerPath as apiGetUserCareerPath,
  getUserCareerPathById as apiGetUserCareerPathById,
} from "../../api/quiz_api";

const UserCareerPath = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingId, setFetchingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await apiGetUserCareerPath();
        // backend may return { success: true, data: [...] } or data directly
        const data = resp?.data ?? resp;
        // If data is an array -> show; if object with success and data is array
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(resp)
          ? resp
          : [];
        if (mounted) setPaths(arr);
      } catch (e) {
        if (mounted) setError("Không tải được lộ trình đã lưu.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpen = async (id: number) => {
    try {
      setFetchingId(id);
      // fetch by id then navigate with data
      const resp = await apiGetUserCareerPathById(id);
      // resp may be { success, data }
      navigate("/quiz/career-path", {
        state: { careerPath: resp, isLoading: false },
      });
    } catch (e) {
      setError("Không thể tải chi tiết lộ trình.");
    } finally {
      setFetchingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mb-8">
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-56 bg-slate-200 rounded"></div>
            <div className="h-4 w-full max-w-2xl bg-slate-200 rounded"></div>
            <div className="h-32 w-full bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mb-6">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!paths || paths.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lộ trình bạn đã tạo</h3>
          <span className="text-sm text-gray-500">{paths.length} lộ trình</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {paths.map((p) => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{p.title}</h4>
                  <div className="text-sm text-slate-500 mt-1">
                    {p.jobSpecialized?.job_type}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <div>{p._count?.careerPathSteps ?? "-"} bước</div>
                  <div className="mt-1">{p.level}</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                {p.description}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  onClick={() => handleOpen(p.id)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  disabled={fetchingId === p.id}
                >
                  {fetchingId === p.id ? "Đang tải..." : "Xem chi tiết"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCareerPath;
