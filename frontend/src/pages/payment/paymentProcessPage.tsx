import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

interface PaymentProcessPageProps {}

const PaymentProcessPage: React.FC<PaymentProcessPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [copied, setCopied] = useState(false);

  const plan = location.state?.plan as PaymentPlan;
  const paymentMethod = location.state?.paymentMethod as string;

  // SePay VA configuration
  const SEPAY_VA = '69880428888';
  const SEPAY_BANK = 'TPBank';

  useEffect(() => {
    if (!plan || !paymentMethod) {
      navigate('/payment');
      return;
    }

    // Only handle SePay payments
    if (paymentMethod === 'sepay') {
      handleSePayPayment();
    } else {
      // Redirect back to payment page if invalid method
      navigate('/payment');
    }
  }, [plan, paymentMethod]);

  const handleSePayPayment = async () => {
    setIsLoading(true);
    try {
      // Create custom transfer content based on plan
      const getTransferContent = (plan: any) => {
        const planCode = plan.name.toUpperCase().replace(/\s+/g, '');
        return `TKP${SEPAY_VA} SEPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)} ${planCode}`;
      };
      
      const transferContent = getTransferContent(plan);
      
      // Call backend to create order and save mapping
      const response = await fetch('/api/sepay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          amount: plan.price,
          description: transferContent,
          planId: plan.id,
          companyId: null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      // Use the order data from backend
      const paymentInfo = {
        orderId: result.data.orderId,
        amount: result.data.amount,
        description: result.data.description,
        transferContent: result.data.description,
        vaNumber: result.data.vaNumber,
        bank: result.data.bankCode,
        qrCodeUrl: result.data.qrCodeUrl,
        paymentUrl: result.data.paymentUrl
      };

      setPaymentData(paymentInfo);
      
      // Start polling for payment status
      startPaymentPolling(result.data.orderId);
      
    } catch (error) {
      console.error('SePay payment error:', error);
      toast.error('Có lỗi xảy ra khi tạo thanh toán');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAllPendingOrders = async () => {
    try {
      const response = await fetch('/api/sepay/cancel-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Cancelled ${result.cancelledCount} pending orders`);
      }
    } catch (error) {
      console.error('Error cancelling orders:', error);
    }
  };

  const startPaymentPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sepay/status/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.data.status === 'success') {
          setPaymentStatus('success');
          clearInterval(pollInterval);
          toast.success('Thanh toán thành công!');
          
          // Redirect to success page after 3 seconds
          setTimeout(() => {
            navigate('/payment/success', { 
              state: { plan, paymentMethod, orderId } 
            });
          }, 3000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 15 * 60 * 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tạo thanh toán...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Gói dịch vụ của bạn đã được kích hoạt
            </p>
            <Button onClick={() => navigate('/profile')}>
              Về trang cá nhân
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              Có lỗi xảy ra trong quá trình thanh toán
            </p>
            <Button onClick={() => navigate('/payment')}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán qua SePay
          </h1>
          <p className="text-gray-600">
            Vui lòng chuyển khoản theo thông tin bên dưới
          </p>
        </div>

        {paymentData && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Payment Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Hướng dẫn thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Thông tin chuyển khoản:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <div className="flex items-center">
                        <span className="font-mono font-bold">{SEPAY_VA}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(SEPAY_VA)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-semibold">{SEPAY_BANK}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-bold text-blue-600">{formatPrice(paymentData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nội dung:</span>
                      <div className="flex items-center">
                        <span className="font-mono text-xs">{paymentData.transferContent.split(' ').pop()}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(paymentData.transferContent.split(' ').pop() || '')}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">Lưu ý quan trọng:</p>
                      <ul className="text-yellow-700 space-y-1">
                        <li>• Chuyển khoản chính xác số tiền: <strong>{formatPrice(paymentData.amount)}</strong></li>
                        <li>• Nội dung chuyển khoản phải chính xác: <strong>{paymentData.transferContent.split(' ').pop()}</strong></li>
                        <li>• Giao dịch sẽ được xử lý tự động trong vòng 5-10 phút</li>
                        <li>• Không cần mã số thuế, chỉ cần tài khoản cá nhân</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>Mã QR thanh toán</CardTitle>
                <CardDescription>
                  Quét mã QR để chuyển khoản nhanh chóng
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <img 
                    src={paymentData.qrCodeUrl} 
                    alt="QR Code" 
                    className="mx-auto max-w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Order Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Gói dịch vụ:</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span>{plan.duration} tháng</span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span>SePay - Chuyển khoản</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{formatPrice(plan.price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicator */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <Clock className="h-6 w-6 text-blue-500 animate-pulse" />
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">Đang chờ thanh toán</h3>
                <p className="text-sm text-gray-600">
                  Hệ thống sẽ tự động xác nhận khi nhận được chuyển khoản
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <Button 
            variant="outline" 
            onClick={() => {
              // Cancel all pending orders for this user
              cancelAllPendingOrders();
              navigate('/payment');
            }}
          >
            Quay lại
          </Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch(`/api/sepay/status/${paymentData?.orderId}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                  }
                });
                const data = await response.json();
                
                if (data.success) {
                  if (data.data.status === 'success') {
                    toast.success('Thanh toán đã được xác nhận!');
                    setPaymentStatus('success');
                  } else {
                    toast.info('Chưa nhận được thanh toán. Vui lòng kiểm tra lại.');
                  }
                } else {
                  toast.error('Không thể kiểm tra trạng thái thanh toán');
                }
              } catch (error) {
                toast.error('Lỗi khi kiểm tra trạng thái');
              }
            }}
          >
            Kiểm tra trạng thái
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessPage;
