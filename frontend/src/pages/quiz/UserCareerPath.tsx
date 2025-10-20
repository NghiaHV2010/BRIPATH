"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;
const STORAGE_KEY = "career_path_state";

const COLOR_VARIANTS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-red-100", text: "text-pink-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

const parseResourceTags = (resources: string): string[] => {
  if (!resources) return [];
  return resources
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 3) // Only take first 3 tags
    .map((tag) => truncateText(tag, 15)); // Truncate each tag to 15 chars
};

const UserCareerPath = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingId, setFetchingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

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
      <div className="max-w-6xl mx-auto mb-8 px-4">
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
      <div className="max-w-6xl mx-auto mb-6 px-4">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded">
          {error}
        </div>
      </div>
    );

  if (!paths || paths.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto mb-8 px-4">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Lộ trình sự nghiệp{" "}
            <span className="text-emerald-500">({paths.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {paginatedPaths.map((p, index) => {
            const colorVariant = COLOR_VARIANTS[index % COLOR_VARIANTS.length];
            const tags = parseResourceTags(p.resources);
            const descriptionPreview = truncateText(p.description || "", 80);

            return (
              <div
                key={p.id}
                className="bg-white rounded-lg overflow-hidden border transition-transform  hover:scale-[1.02] border-gray-200 hover:shadow-lg  duration-300 flex flex-col h-full"
              >
                <div
                  className={`${colorVariant.bg} px-6 py-4 flex-grow min-h-[180px] flex flex-col relative overflow-hidden`}
                >
                  <div className="px-2 pt-6 pb-4 z-10 relative h-25">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-2">
                      {p.title}
                    </h4>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {descriptionPreview}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 relative">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`${colorVariant.text} bg-white bg-opacity-60 text-xs font-medium px-3 py-1 rounded-full`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                  <Button
                    onClick={() => handleOpen(p.id)}
                    disabled={fetchingId === p.id}
                    variant={"custom"}
                    className="hover:scale-115"
                  >
                    Chi tiết
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-600">
                    {p._count?.careerPathSteps || 0} bước
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
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
                      className={
                        page === i + 1 ? "bg-emerald-500 text-white" : ""
                      }
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
