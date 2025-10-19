import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "../../components/ui/pagination";
import {
  getUserCareerPath as apiGetUserCareerPath,
  getUserCareerPathById as apiGetUserCareerPathById,
} from "../../api/quiz_api";

const ITEMS_PER_PAGE = 4;
const STORAGE_KEY = "career_path_state";

const UserCareerPath = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingId, setFetchingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // ✅ Khi mount: lấy page + scroll từ sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { page, scrollY } = JSON.parse(saved);
      if (page) setPage(page);
      // đợi render xong mới scroll
      setTimeout(() => {
        window.scrollTo({ top: scrollY || 0, behavior: "instant" });
      }, 50);
      sessionStorage.removeItem(STORAGE_KEY); // xoá để tránh ghi đè sau này
    }
  }, []);

  const totalPages = Math.ceil(paths.length / ITEMS_PER_PAGE);
  const paginatedPaths = paths.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await apiGetUserCareerPath();
        const data = resp?.data ?? resp;
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(resp)
          ? resp
          : [];
        setPaths(arr);
      } catch (e) {
        setError("Không tải được lộ trình đã lưu.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpen = async (id: number) => {
    try {
      setFetchingId(id);
      // ✅ lưu page + vị trí scroll vào sessionStorage
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          page,
          scrollY: window.scrollY,
        })
      );

      const resp = await apiGetUserCareerPathById(id);
      navigate("/quiz/career-path", {
        state: { careerPath: resp, isLoading: false },
      });
    } catch (e) {
      setError("Không thể tải chi tiết lộ trình.");
    } finally {
      setFetchingId(null);
    }
  };

  if (loading)
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

  if (error)
    return (
      <div className="max-w-4xl mx-auto mb-6">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded">
          {error}
        </div>
      </div>
    );

  if (!paths || paths.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold ">
            Bạn đã tạo {paths.length} lộ trình
          </h3>
        </div>

        {/* Danh sách card */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl text-center mx-auto">
          {paginatedPaths.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 bg-white p-5"
            >
              <div className="flex flex-col items-center text-center flex-grow">
                <h4 className="font-semibold text-slate-900 text-lg line-clamp-2">
                  {p.title}
                </h4>
              </div>
              <div>
                <p className="text-sm text-slate-500 mt-2">
                  {p.jobSpecialized?.job_type || "Không xác định"}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => handleOpen(p.id)}
                  size="sm"
                  variant={"emerald"}
                  disabled={fetchingId === p.id}
                >
                  {fetchingId === p.id ? "Đang tải..." : "Xem chi tiết"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-6">
            <Pagination>
              <PaginationContent>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => {
                        setPage(i + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCareerPath;
