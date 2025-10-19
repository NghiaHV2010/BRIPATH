import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components";
import { SubscriptionCard } from "../../components/subscription/subscriptionCard";
import type { SubscriptionPlan } from "../../components/subscription/subscriptionCard";
import { getAllPricingPlans } from "../../api/user_api";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const data = await getAllPricingPlans();

        const mapped = (data || []).map((p: any) => ({
          id: String(p.id),
          name: p.plan_name || p.name || "Gói dịch vụ",
          tier: (() => {
            const lower = (p.plan_name || "").toLowerCase();
            if (lower.includes("trial")) return "trial";
            if (lower.includes("basic")) return "bronze";
            if (lower.includes("vip")) return "silver";
            if (lower.includes("premium")) return "gold";
            return "bronze";
          })(),
          price: Number(p.price) || 0,
          durationMonths: p.duration_months || 1,
          description: p.description || "",
          features: Array.isArray(p.features)
            ? p.features.map((f: any) => f.feature_name)
            : [],
          isRecommended: Boolean(p.recommended_labels),
          isPopular: Boolean(p.verified_badge),
        }));

        setPlans(mapped);
      } catch (err) {
        console.error("Error loading plans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelect = (id: string) => {
    window.scrollTo(0, 0);
    navigate(`/subscriptions/${id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white relative">
        {/* Background blur effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Chọn Gói Đăng Ký
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá tiềm năng nghề nghiệp của bạn với các gói dịch vụ phù hợp
              cho mọi nhu cầu.
            </p>
          </div>

          {/* Plan cards */}
          {loading ? (
            <div className="text-center text-gray-500 py-20">
              Đang tải gói...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[2000px] mx-auto px-4 mb-20 items-stretch">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
