import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import CompanyFeedback from "@/components/company/CompanyFeedback";
import { Loader2 } from "lucide-react";
import axiosConfig from "@/config/axios.config";
import type { CompanyFeedback as CompanyFeedbackType } from "@/types/company";

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
                const response = await axiosConfig.get(`/feedbacks/${authUser.company_id}`);
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

    }, [authUser?.company_id]);

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
            <CompanyFeedback
                feedbacks={feedbacks}
                companyName={companyName}
            />
        </div>
    );
}