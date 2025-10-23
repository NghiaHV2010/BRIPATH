import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ==================== QR Code Display Component ====================
interface QRCodeDisplayProps {
  qrCodeUrl: string;
  title?: string;
  description?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  title = "Mã QR thanh toán",
  description = "Quét mã QR để chuyển khoản nhanh chóng",
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {/* QR Code with scanner-like layout */}
        <div className="relative inline-block">
          {/* Red border layout similar to QR scanner */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-4 border-red-500 rounded-lg overflow-hidden bg-white">
            {/* QR Code */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Scanning overlay similar to QR scanner */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner indicators */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              <div className="absolute left-0 right-0 h-1 bg-red-500 animate-scan-line"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== QR Scanner Component ====================
interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL();
  };

  const handleScan = () => {
    const imageData = captureFrame();
    if (imageData) {
      // Simulate QR code detection
      const mockResult = `QR_SCAN_RESULT_${Date.now()}`;
      onScan(mockResult);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Red border layout */}
      <div className="relative w-80 h-80 border-4 border-red-500 rounded-lg overflow-hidden">
        {/* Camera view */}
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner indicators */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            <div className="absolute left-0 right-0 h-1 bg-red-500 animate-scan-line"></div>
          </div>
        </div>
        
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Button
          onClick={toggleCamera}
          variant="outline"
          size="lg"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Đổi camera
        </Button>
        
        <Button
          onClick={handleScan}
          variant="outline"
          size="lg"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <Camera className="h-5 w-5 mr-2" />
          Quét QR
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          size="lg"
          className="bg-red-500/20 text-white border-red-500/30 hover:bg-red-500/30"
        >
          <X className="h-5 w-5 mr-2" />
          Đóng
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white">
        <h3 className="text-lg font-semibold mb-2">Quét mã QR</h3>
        <p className="text-sm opacity-80">Đặt mã QR vào khung hình để quét</p>
      </div>
    </div>
  );
};

// ==================== QR Scanner Button Component ====================
interface QRScannerButtonProps {
  onScan: (result: string) => void;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'gold' | 'silver' | 'bronze' | 'emerald' | 'google' | 'custom' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const QRScannerButton: React.FC<QRScannerButtonProps> = ({
  onScan,
  children,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = (result: string) => {
    onScan(result);
    setIsScannerOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsScannerOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Camera className="h-4 w-4 mr-2" />
        {children || 'Quét QR'}
      </Button>

      <QRScanner
        isOpen={isScannerOpen}
        onScan={handleScan}
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );
};

// ==================== Default Exports ====================
export default {
  QRCodeDisplay,
  QRScanner,
  QRScannerButton
};
