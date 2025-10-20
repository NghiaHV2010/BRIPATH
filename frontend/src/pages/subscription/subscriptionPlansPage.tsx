import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components";
import { SubscriptionCard } from "../../components/subscription/subscriptionCard";
import { getAllPricingPlans } from "../../api/user_api";

type SubscriptionPlan = {
  id: string;
  name: string;
  tier: "trial" | "bronze" | "silver" | "gold";
  price: number;
  durationMonths: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  isPopular: boolean;
};

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
          })() as SubscriptionPlan['tier'],
          price: Number(p.price) || 0,
          durationMonths: p.duration_months || 1,
          description: p.description || "",
          features: Array.isArray(p.features)
            ? p.features
              .map((f: { feature_name?: string } | string) =>
                typeof f === "string" ? f : f.feature_name || ""
              )
              .filter(Boolean)
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
            <h1 className="text-4xl md:text-6xl font-bold  text-black mb-4">
              Các gói dịch vụ của BriPath
            </h1>
            <p className="text-xl text-gray-600 ">
              Từ cơ bản đến cao cấp, hãy lựa chọn gói dịch vụ phù hợp với bạn
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