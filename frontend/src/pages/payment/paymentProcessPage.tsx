import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QRScannerButton, QRCodeDisplay } from '@/components/QR';
import PaymentCountdown from '@/components/PaymentCountdown';
import axiosConfig from '@/config/axios.config';

interface PaymentPlan {
  id: number;
  plan_name: string;
  price: number;
  duration_months: number;
  features: any[];
}

interface PaymentProcessPageProps {}

const PaymentProcessPage: React.FC<PaymentProcessPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [copied, setCopied] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const handleSePayPayment = async () => {
    setIsLoading(true);
    try {
      // Create custom transfer content
      const getTransferContent = () => {
        return `TKP${SEPAY_VA} SEPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      };
      
      const transferContent = getTransferContent();
      
      // Call backend to create order and save mapping
      const response = await axiosConfig.post('/sepay/create-order', {
        amount: plan.price,
        description: transferContent,
        planId: plan.id,
        companyId: null
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      // Use the order data from backend
      const paymentInfo = {
        orderId: response.data.data.orderId,
        amount: response.data.data.amount,
        description: response.data.data.description,
        transferContent: response.data.data.description,
        vaNumber: response.data.data.vaNumber,
        bank: response.data.data.bankCode,
        qrCodeUrl: response.data.data.qrCodeUrl,
        paymentUrl: response.data.data.paymentUrl
      };

      setPaymentData(paymentInfo);
      setIsCountdownActive(true);
      
      // Start polling for payment status
      startPaymentPolling(response.data.data.orderId);
      
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
      const response = await axiosConfig.delete('/sepay/cancel-all');
      console.log(`Cancelled ${response.data.cancelledCount} pending orders`);
    } catch (error) {
      console.error('Error cancelling orders:', error);
    }
  };

  const startPaymentPolling = (orderId: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axiosConfig.get(`/sepay/status/${orderId}`);
        
        if (response.data.success && response.data.data.status === 'success') {
          setPaymentStatus('success');
          setIsCountdownActive(false);
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
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
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, 15 * 60 * 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result);
    toast.success('Đã quét mã QR thành công!');
    // Here you can process the QR code result
    // For example, extract payment information from the QR code
  };

  const handleCountdownTimeUp = async () => {
    if (!paymentData?.orderId) return;
    
    try {
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Auto cancel order when time is up
      await axiosConfig.delete(`/sepay/cancel/${paymentData.orderId}`);
      toast.error('Hết thời gian thanh toán. Đơn hàng đã được hủy tự động.');
      setPaymentStatus('failed');
      setIsCountdownActive(false);
    } catch (error) {
      console.error('Error auto-cancelling order:', error);
      toast.error('Có lỗi khi hủy đơn hàng tự động');
    }
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
            {/* Payment Countdown */}
            {isCountdownActive && paymentStatus === 'pending' && (
              <div className="md:col-span-2">
                <PaymentCountdown
                  onTimeUp={handleCountdownTimeUp}
                  duration={10}
                />
              </div>
            )}

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

            {/* QR Code with scanner layout */}
            <div className="space-y-4">
              <QRCodeDisplay
                qrCodeUrl={paymentData.qrCodeUrl}
                title="Mã QR thanh toán"
                description="Quét mã QR để chuyển khoản nhanh chóng"
              />
              <QRScannerButton
                onScan={handleQRScan}
                variant="outline"
                className="w-full"
              >
                Mở camera quét QR
              </QRScannerButton>
            </div>
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
                <span className="font-semibold">{plan?.plan_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span>{plan?.duration_months || 0} tháng</span>
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
                const response = await axiosConfig.get(`/sepay/status/${paymentData?.orderId}`);
                
                if (response.data.success) {
                  if (response.data.data.status === 'success') {
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
