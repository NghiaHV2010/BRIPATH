import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SubscriptionCard } from "../../components/subscription/subscriptionCard";
import type { SubscriptionPlan } from "../../components/subscription/subscriptionCard";
import { Button } from "../../components/ui/button";

// Sample data - bạn có thể chỉnh sửa thông tin này
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'bronze',
    name: 'Đồng',
    tier: 'bronze',
    price: {
      monthly: 99000,
      yearly: 990000,
    },
    originalPrice: {
      monthly: 129000,
      yearly: 1290000,
    },
    description: 'Gói cơ bản dành cho người mới bắt đầu khám phá nghề nghiệp',
    features: [
      'Truy cập 5 bài trắc nghiệm cơ bản',
      'Gợi ý nghề nghiệp từ AI',
      'Báo cáo kết quả đơn giản',
      'Hỗ trợ email trong giờ hành chính',
      'Lưu trữ kết quả 30 ngày',
    ],
    isPopular: false,
  },
  {
    id: 'silver',
    name: 'Bạc',
    tier: 'silver',
    price: {
      monthly: 199000,
      yearly: 1990000,
    },
    originalPrice: {
      monthly: 249000,
      yearly: 2490000,
    },
    description: 'Gói phổ biến với nhiều tính năng hữu ích cho việc định hướng nghề nghiệp',
    features: [
      'Truy cập 15+ bài trắc nghiệm chuyên sâu',
      'Phân tích tính cách chi tiết bằng AI',
      'Báo cáo nghề nghiệp đầy đủ với lộ trình',
      'Gợi ý khóa học và kỹ năng cần phát triển',
      'Hỗ trợ chat 24/7',
      'Lưu trữ kết quả không giới hạn',
      'So sánh với xu hướng thị trường',
    ],
    isPopular: true,
  },
  {
    id: 'gold',
    name: 'Vàng',
    tier: 'gold',
    price: {
      monthly: 399000,
      yearly: 3990000,
    },
    originalPrice: {
      monthly: 499000,
      yearly: 4990000,
    },
    description: 'Gói cao cấp với tư vấn cá nhân hóa và tính năng độc quyền',
    features: [
      'Truy cập toàn bộ thư viện trắc nghiệm premium',
      'Phân tích tâm lý học chuyên sâu bằng AI',
      'Tư vấn 1-1 với chuyên gia định hướng nghề nghiệp',
      'Lộ trình phát triển sự nghiệp cá nhân hóa',
      'Kết nối với mentor và cộng đồng chuyên gia',
      'Ưu tiên hỗ trợ 24/7 với hotline riêng',
      'Cập nhật xu hướng nghề nghiệp hàng tuần',
      'Chứng chỉ đánh giá năng lực được công nhận',
      'Truy cập sớm các tính năng mới',
    ],
    isRecommended: true,
  },
];

export default function SubscriptionPlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();

  const handlePlanSelect = (planId: string) => {
    navigate(`/subscriptions/${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Chọn Gói Đăng Ký
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá tiềm năng nghề nghiệp của bạn với các gói dịch vụ được thiết kế phù hợp cho mọi nhu cầu
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/50 backdrop-blur-sm rounded-full p-2 border border-white/20 shadow-lg">
            <div className="flex space-x-2">
              <Button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30'
                }`}
              >
                Thanh toán hàng tháng
              </Button>
              <Button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30'
                }`}
              >
                Thanh toán hàng năm
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  -20%
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-4 max-w-7xl mx-auto mb-16">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={plan.id}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <SubscriptionCard
                plan={plan}
                billingCycle={billingCycle}
                onSelect={handlePlanSelect}
              />
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🎯 Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Hệ thống định hướng nghề nghiệp hàng đầu với công nghệ AI tiên tiến
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white/30 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Thông Minh</h3>
              <p className="text-gray-600 text-sm">
                Phân tích dựa trên thuật toán học máy và tâm lý học nghề nghiệp
              </p>
            </div>
            <div className="p-6 bg-white/30 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-800 mb-2">Báo Cáo Chi Tiết</h3>
              <p className="text-gray-600 text-sm">
                Kết quả được trình bày rõ ràng với lộ trình phát triển cụ thể
              </p>
            </div>
            <div className="p-6 bg-white/30 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-semibold text-gray-800 mb-2">Chuyên Gia Tư Vấn</h3>
              <p className="text-gray-600 text-sm">
                Đội ngũ chuyên gia giàu kinh nghiệm trong định hướng nghề nghiệp
              </p>
            </div>
          </div>
        </div>

        {/* Guarantee Section */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">30 ngày đảm bảo hoàn tiền 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}