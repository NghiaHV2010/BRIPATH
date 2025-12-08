import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import CompanyFeedback from "@/components/company/CompanyFeedback";
import { Loader2, Star } from "lucide-react";
import axiosConfig from "@/config/axios.config";
import type { CompanyFeedback as CompanyFeedbackType } from "@/types/company";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function CompanyReviews() {
  const { authUser } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<CompanyFeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("Công ty");

  useEffect(() => {
    const fetchCompanyFeedbacks = async () => {
      if (!authUser?.company_id) {
        setError("Không tìm thấy thông tin công ty");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosConfig.get(
          `/feedbacks/${authUser.company_id}`
        );
        if (response.data?.success && response.data?.data) {
          const companyData = response.data.data;
          setFeedbacks(companyData || []);
          setCompanyName(authUser.username);
        } else {
          throw new Error("Không thể tải thông tin công ty");
        }
      } catch (error) {
        console.error("Error fetching company feedbacks:", error);
        setError("Có lỗi xảy ra khi tải đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl w-full min-h-screen p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải đánh giá...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl w-full min-h-screen p-6 space-y-6">
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="text-red-600">
            <p className="text-lg font-medium">Có lỗi xảy ra</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full min-h-screen p-6 space-y-6">
      {feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg shadow-sm p-8">
          {/* Rating Summary Skeleton */}
          <div className="w-full bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-300">0.0</div>
                <div className="flex items-center justify-center mt-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gray-300" />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">0 đánh giá</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400 w-8">
                      {star} ★
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-0" />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      0
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Empty State Animation */}
          <DotLottieReact
            src="/animations/Bouncy Fail.json"
            loop
            autoplay
            className="w-32 h-32"
          />
          <h3 className="text-xl font-semibold text-gray-700 mt-4">
            Chưa có đánh giá nào
          </h3>
          <p className="text-gray-500 mt-2">
            Công ty chưa nhận được đánh giá từ ứng viên
          </p>
        </div>
      ) : (
        <CompanyFeedback feedbacks={feedbacks} companyName={companyName} />
      )}
    </div>
  );
}
