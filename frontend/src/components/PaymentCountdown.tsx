import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentCountdownProps {
  onTimeUp: () => void;
  duration?: number; // in minutes
}

export const PaymentCountdown: React.FC<PaymentCountdownProps> = ({
  onTimeUp,
  duration = 10 // 10 minutes default
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-500'; // Last minute - red
    if (timeLeft <= 300) return 'text-orange-500'; // Last 5 minutes - orange
    return 'text-blue-500'; // Normal - blue
  };

  const getProgressPercentage = () => {
    const total = duration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Hết thời gian thanh toán</span>
          </div>
          <p className="text-sm text-red-500 text-center mt-2">
            Đơn hàng đã được tự động hủy
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Clock className={`h-5 w-5 ${getTimeColor()}`} />
            <div>
              <p className="text-sm text-gray-600">Thời gian còn lại</p>
              <p className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft <= 60 ? 'bg-red-500' : 
                timeLeft <= 300 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Vui lòng hoàn thành thanh toán trong thời gian trên
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCountdown;
