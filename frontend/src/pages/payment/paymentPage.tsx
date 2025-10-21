import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
  popular?: boolean;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(
    location.state?.selectedPlan || null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!authUser?.id) {
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const response = await fetch(`/api/subscriptions/user/${authUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserSubscription(data.data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchUserSubscription();
  }, [authUser?.id]);

  // Mock data - replace with actual plan data from API
  const allPlans: PaymentPlan[] = [
    {
      id: 0,
      name: 'Gói Trial',
      price: 0,
      duration: 1,
      features: [
        'Đăng tối đa 2 việc làm',
        'Hỗ trợ email',
        'Báo cáo cơ bản',
        'Thời gian sử dụng: 7 ngày'
      ]
    },
    {
      id: 1,
      name: 'Gói Cơ Bản',
      price: 99000,
      duration: 1,
      features: [
        'Đăng tối đa 5 việc làm',
        'Hỗ trợ email',
        'Báo cáo cơ bản'
      ]
    },
    {
      id: 2,
      name: 'Gói Nâng Cao',
      price: 199000,
      duration: 1,
      features: [
        'Đăng tối đa 20 việc làm',
        'Ưu tiên hiển thị',
        'Hỗ trợ 24/7',
        'Báo cáo chi tiết',
        'AI matching'
      ],
      popular: true
    },
    {
      id: 3,
      name: 'Gói Doanh Nghiệp',
      price: 399000,
      duration: 1,
      features: [
        'Đăng không giới hạn việc làm',
        'Tính năng nâng cao',
        'Hỗ trợ ưu tiên',
        'Báo cáo toàn diện',
        'AI matching nâng cao',
        'Tích hợp API'
      ]
    }
  ];

  // Filter plans based on user subscription
  const plans = allPlans.filter(plan => {
    // If user has no subscription, show all plans
    if (!userSubscription) return true;
    
    // If user has trial subscription, hide trial plan
    if (plan.id === 0 && userSubscription.plan_id === 0) return false;
    
    // Show all other plans
    return true;
  });

  const paymentMethods = [
    {
      id: 'sepay',
      name: 'SePay',
      description: 'Chuyển khoản ngân hàng qua SePay',
      icon: <QrCode className="h-6 w-6" />,
      color: 'bg-blue-500'
    }
  ];

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error('Vui lòng chọn gói dịch vụ');
      return;
    }

    // For trial plan, no payment method needed
    if (selectedPlan.price === 0) {
      try {
        // Activate trial plan directly
        const response = await fetch('/api/subscriptions/activate-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            planId: selectedPlan.id
          })
        });

        if (response.ok) {
          toast.success('Kích hoạt gói trial thành công!');
          navigate('/dashboard');
        } else {
          throw new Error('Failed to activate trial');
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi kích hoạt gói trial');
      }
      return;
    }

    // For paid plans, require payment method
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      // Navigate to payment processing page with selected plan and method
      // Order will be created on the payment process page, not here
      navigate('/payment/process', {
        state: {
          plan: selectedPlan,
          paymentMethod: selectedPaymentMethod
        }
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chọn Gói Dịch Vụ
          </h1>
          <p className="text-gray-600">
            Nâng cao hiệu quả tuyển dụng với các gói dịch vụ của chúng tôi
          </p>
          {userSubscription && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
              <p className="text-sm text-blue-700">
                Bạn đang sử dụng: <span className="font-semibold">{userSubscription.plan_name || 'Gói hiện tại'}</span>
                {userSubscription.end_date && (
                  <span className="ml-2">
                    (Hết hạn: {new Date(userSubscription.end_date).toLocaleDateString('vi-VN')})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {isLoadingSubscription ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải thông tin gói dịch vụ...</p>
          </div>
        ) : (
          <>
            {/* Plans Selection */}
            <div className={`mb-8 ${
              plans.length === 4 
                ? 'flex flex-wrap justify-center gap-4' 
                : 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                  } ${
                    plans.length === 4 
                      ? 'w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]' 
                      : ''
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Phổ biến
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.price === 0 ? 'Miễn phí' : formatPrice(plan.price)}
                    </div>
                    <CardDescription>
                      / {plan.duration} tháng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPlan && (
              <>
                <Separator className="my-8" />
                
                {/* Payment Methods - Only show for paid plans */}
                {selectedPlan.price > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Chọn Phương Thức Thanh Toán
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {paymentMethods.map((method) => (
                        <Card 
                          key={method.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPaymentMethod === method.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => handlePaymentMethodSelect(method.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${method.color} text-white`}>
                                {method.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold">{method.name}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gói dịch vụ:</span>
                        <span className="font-semibold">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian:</span>
                        <span>{selectedPlan.duration} tháng</span>
                      </div>
                      {selectedPlan.price > 0 && (
                        <div className="flex justify-between">
                          <span>Phương thức thanh toán:</span>
                          <span>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">
                          {selectedPlan.price === 0 ? 'Miễn phí' : formatPrice(selectedPlan.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Button */}
                <div className="text-center">
                  <Button 
                    onClick={handlePayment}
                    size="lg"
                    className="px-8 py-3 text-lg"
                    disabled={!selectedPlan || (selectedPlan.price > 0 && !selectedPaymentMethod)}
                  >
                    {selectedPlan.price === 0 ? 'Kích hoạt miễn phí' : 'Thanh toán ngay'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
