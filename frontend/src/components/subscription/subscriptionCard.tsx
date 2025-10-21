import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

// Icons
const SparklesIcon = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm7 10l.8 2.2L22 15l-2.2.8L19 18l-.8-2.2L16 15l2.2-.8L19 12zm-12 4l.6 1.8L10 19l-1.8.6L8 21l-.6-1.4L6 19l1.4-.6L7 16z" />
  </svg>
);

const SmallSparklesIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm7 10l.8 2.2L22 15l-2.2.8L19 18l-.8-2.2L16 15l2.2-.8L19 12zm-12 4l.6 1.8L10 19l-1.8.6L8 21l-.6-1.4L6 19l1.4-.6L7 16z" />
  </svg>
);
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

// Tier color configs
const tierConfig = {
  trial: {
    gradient: "from-blue-400 via-indigo-400 to-blue-500",
    borderGradient: "from-blue-300 to-indigo-400",
    icon: SparklesIcon,
    smallIcon: SmallSparklesIcon,
  },
  bronze: {
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    borderGradient: "from-amber-400 to-orange-500",
    icon: ZapIcon,
    smallIcon: SmallZapIcon,
  },
  silver: {
    gradient: "from-slate-400 via-gray-300 to-slate-500",
    borderGradient: "from-slate-400 to-gray-500",
    icon: StarIcon,
    smallIcon: SmallStarIcon,
  },
  gold: {
    gradient: "from-yellow-400 via-amber-300 to-yellow-500",
    borderGradient: "from-yellow-400 to-amber-500",
    icon: CrownIcon,
    smallIcon: SmallCrownIcon,
  },
};

export interface SubscriptionCardProps {
  plan: {
    id: string;
    name: string;
    tier: "trial" | "bronze" | "silver" | "gold";
    price: number;
    durationMonths?: number;
    description?: string;
    features: string[];
    isRecommended?: boolean;
    isPopular?: boolean;
  };
  compact?: boolean;
}

export function SubscriptionCard({
  plan,
  compact = false,
}: SubscriptionCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const config = tierConfig[plan.tier];
  const Icon = config.icon;

  const handlePurchase = () => {
    // Navigate to payment page with plan data
    navigate('/payment', {
      state: {
        selectedPlan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          duration: plan.durationMonths || 1,
          features: plan.features
        }
      }
    });
  };

  return (
    <div
      className="relative transition-all duration-500 ease-out transform hover:scale-105 h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
          config.borderGradient
        } opacity-0 transition-opacity duration-500 ${
          hovered ? "opacity-20" : ""
        } blur-xl`}
      />

      {/* Main Card */}
      <div
        className={`relative bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-transparent transition-all duration-300 shadow-lg flex flex-col ${
          compact ? "p-4 lg:p-6" : "p-6 lg:p-8"
        } h-full`}
        style={{
          background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, ${
            plan.tier === "gold"
              ? "#fbbf24, #f59e0b"
              : plan.tier === "silver"
              ? "#94a3b8, #64748b"
              : plan.tier === "trial"
              ? "#60a5fa, #6366f1"
              : "#f59e0b, #ea580c"
          }) border-box`,
        }}
      >
        {/* Header */}
        <div className="text-center mb-6 min-h-[50px]">
          <div
            className={`inline-flex items-center justify-center ${
              compact ? "w-12 h-12" : "w-16 h-16"
            } rounded-full bg-gradient-to-r ${config.gradient} mb-3 shadow-lg`}
          >
            <Icon />
          </div>

          <h3
            className={`font-bold bg-gradient-to-r ${
              config.gradient
            } bg-clip-text text-transparent mb-1 ${
              compact ? "text-lg lg:text-xl" : "text-2xl lg:text-3xl"
            }`}
          >
            {plan.name.split(" ")[0]}
          </h3>
        </div>

        {/* Price */}
        <div className="text-center mb-6 pt-2 relative">
          <div className="flex items-baseline justify-center mb-2">
            <span
              className={`font-bold bg-gradient-to-r ${
                config.gradient
              } bg-clip-text text-transparent ${
                compact ? "text-2xl" : "text-4xl"
              }`}
            >
              {plan.price.toLocaleString()}₫
            </span>
          </div>
          {plan.durationMonths && (
            <p className="text-gray-500 text-sm">{plan.durationMonths} tháng</p>
          )}
          <div className="pt-4 min-h-[120px] ">
            <p className="text-gray-600 text-m leading-relaxed relative">
              {plan.description}
            </p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 flex-1">
          {plan.features.slice(0, 10).map((feature, i) => (
            <li key={i} className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mt-0.5`}
              >
                <CheckIcon />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <Button
          onClick={handlePurchase}
          size={compact ? "sm" : "lg"}
          className={`w-full rounded-xl mt-6 ${
            plan.tier === "trial"
              ? "bg-blue-700 text-white hover:bg-blue-800"
              : "bg-gradient-to-r " + config.gradient + " text-white"
          }`}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
