import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import axiosConfig from '@/config/axios.config';

interface PaymentPlan {
  id: number;
  plan_name: string;
  price: number;
  duration_months: number;
  features: any[];
  popular?: boolean;
  urgent_jobs_limit?: number;
  quality_jobs_limit?: number;
  total_jobs_limit?: number;
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
  const [allPlans, setAllPlans] = useState<PaymentPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Fetch pricing plans data
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await axiosConfig.get('/pricings');
        setAllPlans(response.data.data);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        toast.error('Không thể tải danh sách gói dịch vụ');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPricingPlans();
  }, []);

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!authUser?.id) {
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const response = await axiosConfig.get(`/subscriptions/user/${authUser.id}`);
        setUserSubscription(response.data.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchUserSubscription();
  }, [authUser?.id]);


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
        await axiosConfig.post('/subscriptions/activate-trial', {
          planId: selectedPlan.id
        });

        toast.success('Kích hoạt gói trial thành công!');
        navigate('/dashboard');
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
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center"
            >
              ← Về trang chủ
            </Button>
            
            {/* User subscription status */}
            {!isLoadingSubscription && userSubscription && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Gói hiện tại:</p>
                <p className="font-semibold text-green-600">
                  {userSubscription.plan?.plan_name || userSubscription.plan_name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  Hết hạn: {userSubscription.end_date ? 
                    new Date(userSubscription.end_date).toLocaleDateString('vi-VN') : 
                    'N/A'
                  }
                </p>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chọn Gói Dịch Vụ
          </h1>
          <p className="text-gray-600">
            Nâng cao hiệu quả tuyển dụng với các gói dịch vụ của chúng tôi
          </p>
        </div>

        {/* Warning if user already has subscription */}
        {!isLoadingSubscription && userSubscription && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 text-orange-600">⚠️</div>
              <div>
                <p className="font-semibold text-orange-800">
                  Bạn đang sử dụng gói {userSubscription.plan?.plan_name || userSubscription.plan_name || 'N/A'}
                </p>
                <p className="text-sm text-orange-700">
                  Gói mới sẽ được kích hoạt sau khi gói hiện tại hết hạn
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoadingSubscription ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải thông tin gói dịch vụ...</p>
          </div>
        ) : (
          <>
            {/* Plans Selection */}
            {isLoadingPlans ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Đang tải gói dịch vụ...</span>
              </div>
            ) : (
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
                    <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.price === 0 ? 'Miễn phí' : formatPrice(plan.price)}
                    </div>
                    <CardDescription>
                      / {plan.duration_months} tháng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features && plan.features.map((feature: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature.feature_name || feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

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
                        <span className="font-semibold">{selectedPlan.plan_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian:</span>
                        <span>{selectedPlan.duration_months} tháng</span>
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
