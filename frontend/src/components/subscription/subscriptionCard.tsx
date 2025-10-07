import { useState } from "react";
import { Button } from "../ui/button";
// import { Badge } from "../";

// SVG Icons as components
const CheckIcon = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 6L9 9l3-8 3 8-3-3zM9 9l-5 1 5-1zM15 9l5 1-5-1zM7.5 17.5h9l1-4H6.5l1 4z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L4.09 12.97h6.91V22l8.91-10.97h-6.91V2z" />
  </svg>
);

const SmallCrownIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 6L9 9l3-8 3 8-3-3zM9 9l-5 1 5-1zM15 9l5 1-5-1zM7.5 17.5h9l1-4H6.5l1 4z" />
  </svg>
);

const SmallStarIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SmallZapIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L4.09 12.97h6.91V22l8.91-10.97h-6.91V2z" />
  </svg>
);

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "bronze" | "silver" | "gold";
  price: {
    monthly: number;
    yearly: number;
  };
  originalPrice?: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  onSelect: (planId: string) => void;
}

const tierConfig = {
  bronze: {
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    bgGradient: "from-amber-50 via-orange-50 to-amber-50",
    borderGradient: "from-amber-400 to-orange-500",
    icon: ZapIcon,
    shadowColor: "shadow-amber-500/25",
    glowColor: "shadow-amber-400/30",
    badgeColor: "bg-gradient-to-r from-amber-500 to-orange-600",
    smallIcon: SmallZapIcon,
  },
  silver: {
    gradient: "from-slate-400 via-gray-300 to-slate-500",
    bgGradient: "from-slate-50 via-gray-50 to-slate-50",
    borderGradient: "from-slate-400 to-gray-500",
    icon: StarIcon,
    shadowColor: "shadow-slate-500/25",
    glowColor: "shadow-slate-400/30",
    badgeColor: "bg-gradient-to-r from-slate-500 to-gray-600",
    smallIcon: SmallStarIcon,
  },
  gold: {
    gradient: "from-yellow-400 via-amber-300 to-yellow-500",
    bgGradient: "from-yellow-50 via-amber-50 to-yellow-50",
    borderGradient: "from-yellow-400 to-amber-500",
    icon: CrownIcon,
    shadowColor: "shadow-yellow-500/25",
    glowColor: "shadow-yellow-400/40",
    badgeColor: "bg-gradient-to-r from-yellow-500 to-amber-600",
    smallIcon: SmallCrownIcon,
  },
};

export function SubscriptionCard({
  plan,
  billingCycle,
  onSelect,
}: SubscriptionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = tierConfig[plan.tier];
  const Icon = config.icon;
  const SmallIcon = config.smallIcon;

  const currentPrice = plan.price[billingCycle];
  const originalPrice = plan.originalPrice?.[billingCycle];
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Keep all cards equal size; remove tier-based scaling/z-index

  return (
    <div
      className={`relative transition-all duration-500 ease-out transform hover:scale-105 h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
          config.borderGradient
        } opacity-0 transition-opacity duration-500 ${
          isHovered || plan.tier === "gold" ? "opacity-20" : ""
        } blur-xl`}
      />

      {/* Popular/Recommended Badge */}
      {(plan.isPopular || plan.isRecommended) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          {/* <Badge
            className={`${config.badgeColor} text-white px-4 py-1 text-sm font-semibold shadow-lg animate-pulse`}
          >
            {plan.isRecommended ? "🔥 Được đề xuất" : "⭐ Phổ biến nhất"}
          </Badge> */}
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && billingCycle === "yearly" && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
            -{discount}%
          </div>
        </div>
      )}

      {/* Main Card */}
      <div
        className={`relative bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-transparent p-6 lg:p-8 transition-all duration-300 ${
          config.shadowColor
        } ${isHovered ? `shadow-2xl ${config.glowColor}` : "shadow-lg"} ${
          plan.tier === "gold" ? "ring-2 ring-yellow-400/40" : ""
        } h-full flex flex-col`}
        style={{
          background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${
            plan.tier === "gold"
              ? "#fbbf24, #f59e0b"
              : plan.tier === "silver"
              ? "#94a3b8, #64748b"
              : "#f59e0b, #ea580c"
          }) border-box`,
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} mb-4 shadow-lg`}
          >
            <Icon />
          </div>

          <h3
            className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}
          >
            Gói {plan.name.toUpperCase()}
          </h3>

          <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Content grows to fill height */}
        <div className="flex-1">
          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center mb-2">
              <span
                className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
              >
                {currentPrice.toLocaleString()}
              </span>
              <span className="text-gray-500 text-lg ml-1">₫</span>
            </div>

            {originalPrice && (
              <div className="text-gray-400 line-through text-lg mb-2">
                {originalPrice.toLocaleString()}₫
              </div>
            )}

            <p className="text-gray-500 text-sm">
              /{billingCycle === "monthly" ? "tháng" : "năm"}
            </p>

            {billingCycle === "yearly" && (
              <p className="text-green-600 text-sm font-semibold mt-1">
                💰 Tiết kiệm{" "}
                {discount > 0 ? `${discount}%` : "2 tháng miễn phí"}
              </p>
            )}
          </div>

          {/* Features Preview */}
          <div className="mb-6">
            <ul className="space-y-3">
              {plan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mt-0.5`}
                  >
                    <CheckIcon />
                  </div>
                  <span className="text-gray-700 text-sm lg:text-base leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            {plan.features.length > 4 && (
              <p className="mt-3 text-xs text-gray-500">
                … và nhiều lợi ích khác
              </p>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant={
            plan.tier === "gold"
              ? "gold"
              : plan.tier === "silver"
              ? "silver"
              : "bronze"
          }
          size="lg"
          onClick={() => onSelect(plan.id)}
          className="w-full rounded-xl"
        >
          Xem chi tiết
          <SmallIcon />
        </Button>

        {/* Subtle Premium Emphasis */}
        <div className="mt-3 text-center">
          {plan.tier === "gold" && (
            <p className="text-xs text-yellow-700">
              Gói cao cấp với nhiều đặc quyền
            </p>
          )}
          {plan.tier === "silver" && (
            <p className="text-xs text-slate-600">
              Gói phổ biến, cân bằng chi phí - lợi ích
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
