import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, Shield, AlertCircle, Smartphone, Copy, Check } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "@/components/layout";
import { create2FAQR, verify2FA } from "@/api";

interface QRCodeResponse {
    secret: string;
    qrCodeDataURL: string;
}

export default function Setup2FAPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await create2FAQR();

            if (response) {
                setQrData(response.data);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error: any) {
            console.error("Error fetching QR code:", error);
            const errorMessage = error?.response?.data?.message || "Không thể tải mã QR. Vui lòng thử lại.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopySecret = async () => {
        if (qrData?.secret) {
            try {
                await navigator.clipboard.writeText(qrData.secret);
                setIsCopied(true);
                toast.success("Đã sao chép mã bí mật!");
                setTimeout(() => setIsCopied(false), 2000);
            } catch (error) {
                toast.error("Không thể sao chép. Vui lòng copy thủ công.");
            }
        }
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error("Vui lòng nhập mã xác thực 6 số");
            return;
        }

        try {
            setIsVerifying(true);
            const response = await verify2FA(verificationCode);

            console.log("hello", response);


            if (!response.success) {
                throw new Error("Mã xác thực không đúng");
            }

            // Temporary success handling
            toast.success("Xác thực 2FA thành công!");
            navigate("/profile");
        } catch (error: any) {
            console.error("Error verifying 2FA:", error);
            toast.error(error?.message || "Mã xác thực không đúng");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSkip = () => {
        navigate("/profile");
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-12 flex flex-col items-center justify-center">
                            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-600">Đang tạo mã QR...</p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (error && !qrData) {
        return (
            <Layout>
                <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-8">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <div className="mt-6 flex gap-3">
                                <Button onClick={fetchQRCode} className="flex-1">
                                    Thử lại
                                </Button>
                                <Button onClick={handleSkip} variant="outline" className="flex-1">
                                    Bỏ qua
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl shadow-xl">
                    <CardHeader className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-full">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Thiết lập xác thực 2 yếu tố</CardTitle>
                                <CardDescription className="text-blue-100 mt-1">
                                    Bảo vệ tài khoản của bạn với lớp bảo mật bổ sung
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        {/* Step 1: Download App */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    1
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900">Tải ứng dụng xác thực</h3>
                            </div>
                            <p className="text-slate-600 pl-10">
                                Tải xuống một trong các ứng dụng sau:
                            </p>
                            <div className="pl-10 flex flex-wrap gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer">
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        Google Authenticator
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="https://www.microsoft.com/en-us/security/mobile-authenticator-app" target="_blank" rel="noopener noreferrer">
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        Microsoft Authenticator
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Step 2: Scan QR Code */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    2
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900">Quét mã QR hoặc nhập mã thủ công</h3>
                            </div>
                            <p className="text-slate-600 pl-10">
                                Mở ứng dụng và quét mã QR bên dưới hoặc nhập mã bí mật:
                            </p>

                            {qrData && (
                                <div className="pl-10 space-y-4">
                                    {/* QR Code */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                                            <img
                                                src={qrData.qrCodeDataURL}
                                                alt="2FA QR Code"
                                                className="w-64 h-64"
                                            />
                                        </div>
                                    </div>

                                    {/* Secret Key Section */}
                                    <div className="max-w-xl">
                                        <Label htmlFor="secret-key" className="text-sm font-medium text-slate-700">
                                            Hoặc nhập mã bí mật thủ công:
                                        </Label>
                                        <div className="mt-2 flex gap-2">
                                            <div className="flex-1 relative">
                                                <Input
                                                    id="secret-key"
                                                    type="text"
                                                    value={qrData.secret}
                                                    readOnly
                                                    className="font-mono text-sm bg-slate-50 pr-10"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={handleCopySecret}
                                                className="shrink-0"
                                            >
                                                {isCopied ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Sao chép mã này và nhập vào ứng dụng xác thực nếu không thể quét QR code
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 3: Verify */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    3
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900">Xác nhận thiết lập</h3>
                            </div>
                            <p className="text-slate-600 pl-10">
                                Nhập mã 6 số từ ứng dụng xác thực:
                            </p>
                            <div className="pl-10 space-y-4">
                                <div className="max-w-md">
                                    <Label htmlFor="verification-code">Mã xác thực</Label>
                                    <Input
                                        id="verification-code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        className="text-center text-2xl tracking-widest font-mono mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || verificationCode.length !== 6}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Kích hoạt 2FA
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleSkip}
                                variant="outline"
                                disabled={isVerifying}
                            >
                                Bỏ qua
                            </Button>
                        </div>

                        {/* Security Notice */}
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>Lưu ý bảo mật:</strong> Lưu giữ mã bí mật ở nơi an toàn. Bạn sẽ cần nó nếu thay đổi thiết bị hoặc mất quyền truy cập vào ứng dụng xác thực.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        maxWidth: "400px",
                    },
                    success: {
                        style: {
                            background: "#10B981",
                            color: "white",
                        },
                        iconTheme: {
                            primary: "white",
                            secondary: "#10B981",
                        },
                    },
                    error: {
                        style: {
                            background: "#EF4444",
                            color: "white",
                        },
                        iconTheme: {
                            primary: "white",
                            secondary: "#EF4444",
                        },
                    },
                }}
            />
        </Layout>
    );
}