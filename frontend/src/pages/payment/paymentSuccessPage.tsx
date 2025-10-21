import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const plan = location.state?.plan as PaymentPlan;
  const paymentMethod = location.state?.paymentMethod as string;
  const orderId = location.state?.orderId as string;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 text-lg">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </p>
            </div>

            {plan && (
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Thông tin gói dịch vụ
                </h2>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gói dịch vụ:</span>
                    <span className="font-semibold">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold text-green-600">{formatPrice(plan.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-semibold">{plan.duration} tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-semibold">
                      {paymentMethod === 'sepay' ? 'SePay - Chuyển khoản' : 
                       paymentMethod === 'vnpay' ? 'VNPay' : 
                       paymentMethod === 'zalopay' ? 'ZaloPay' : 'Khác'}
                    </span>
                  </div>
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-mono text-sm">{orderId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                🎉 Gói dịch vụ đã được kích hoạt!
              </h3>
              <p className="text-blue-800 text-sm">
                Bạn có thể bắt đầu sử dụng các tính năng nâng cao ngay bây giờ.
                Kiểm tra email để xem hóa đơn chi tiết.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/profile')}
                className="flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Vào trang cá nhân
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
