import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { PaymentMethodSelector, PaymentSuccess } from "../../components/subscription/paymentMethod";
import type { PaymentMethod } from "../../components/subscription/paymentMethod";
import type { SubscriptionPlan } from "../../components/subscription/subscriptionCard";

// Sample subscription plans data (same as in plans page)
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

const tierConfig = {
  bronze: {
    gradient: 'from-amber-600 via-orange-500 to-amber-700',
    icon: '⚡',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    borderColor: 'border-amber-300',
  },
  silver: {
    gradient: 'from-slate-400 via-gray-300 to-slate-500',
    icon: '⭐',
    bgColor: 'bg-gradient-to-br from-slate-50 to-gray-100',
    borderColor: 'border-slate-300',
  },
  gold: {
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    icon: '👑',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-100',
    borderColor: 'border-yellow-300',
  },
};

export default function SubscriptionDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const foundPlan = subscriptionPlans.find(p => p.id === planId);
    if (foundPlan) {
      setPlan(foundPlan);
    } else {
      navigate('/subscriptions');
    }
  }, [planId, navigate]);

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !plan) return;
    
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, you would redirect to payment gateway
    // const paymentUrls = {
    //   zalopay: 'https://zalopay.vn/payment',
    //   momo: 'https://momo.vn/payment', 
    //   cpay: 'https://cpay.vn/payment'
    // };
    // window.location.href = paymentUrls[selectedPaymentMethod];
    
    // For demo purposes, just show success
    setIsProcessingPayment(false);
    setShowPaymentSuccess(true);
  };

  const handleContinue = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/subscriptions');
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin gói...</p>
        </div>
      </div>
    );
  }

  const config = tierConfig[plan.tier];
  const currentPrice = plan.price[billingCycle];
  const originalPrice = plan.originalPrice?.[billingCycle];
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  if (showPaymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          <PaymentSuccess
            paymentMethod={selectedPaymentMethod!}
            amount={currentPrice}
            onContinue={handleContinue}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          onClick={handleGoBack}
          className="mb-8 bg-white/50 hover:bg-white/70 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl transition-all duration-300"
        >
          ← Quay lại danh sách gói
        </Button>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Plan Details */}
          <div className={`${config.bgColor} rounded-3xl p-8 border-2 ${config.borderColor} shadow-xl`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${config.gradient} mb-4 shadow-lg`}>
                <span className="text-3xl">{config.icon}</span>
              </div>
              
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                Gói {plan.name.toUpperCase()}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/50 rounded-full p-1 border border-white/20">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-full transition-all duration-300 text-sm ${
                        billingCycle === 'monthly'
                          ? 'bg-white shadow-md text-gray-800'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Hàng tháng
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-full transition-all duration-300 text-sm relative ${
                        billingCycle === 'yearly'
                          ? 'bg-white shadow-md text-gray-800'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Hàng năm
                      {billingCycle === 'yearly' && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center mb-2">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                    {currentPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xl ml-1">₫</span>
                </div>
                
                {originalPrice && (
                  <div className="text-gray-400 line-through text-lg mb-2">
                    {originalPrice.toLocaleString()}₫
                  </div>
                )}
                
                <p className="text-gray-500">
                  /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                </p>
                
                {billingCycle === 'yearly' && (
                  <p className="text-green-600 font-semibold mt-2">
                    💰 Tiết kiệm {discount}% so với thanh toán hàng tháng
                  </p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ✨ Tính năng bao gồm:
              </h3>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center mt-0.5`}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Benefits */}
            {plan.tier === 'gold' && (
              <div className="bg-white/30 rounded-2xl p-6 border border-white/20">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">🎁</span>
                  Ưu đãi độc quyền
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Miễn phí tham gia webinar chuyên gia hàng tháng</li>
                  <li>• Được mời tham gia sự kiện networking độc quyền</li>
                  <li>• Ưu tiên được tư vấn trực tiếp qua video call</li>
                </ul>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={setSelectedPaymentMethod}
              onProceedPayment={handlePayment}
              isLoading={isProcessingPayment}
            />
            
            {/* Order Summary */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">📋 Tóm tắt đơn hàng</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Gói {plan.name}</span>
                  <span className="font-semibold">{plan.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chu kỳ thanh toán</span>
                  <span>{billingCycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</span>
                </div>
                {originalPrice && (
                  <div className="flex justify-between text-gray-400">
                    <span>Giá gốc</span>
                    <span className="line-through">{originalPrice.toLocaleString()}₫</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({discount}%)</span>
                    <span>-{(originalPrice! - currentPrice).toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t text-lg font-bold">
                  <span>Tổng thanh toán</span>
                  <span className="text-blue-600">{currentPrice.toLocaleString()}₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}