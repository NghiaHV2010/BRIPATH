import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, ShieldOff, Shield, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "@/components/layout";
import { useAuthStore } from "@/store/auth";
import { FcGoogle } from "react-icons/fc";
import { disable2FA } from "@/api";

export default function Verify2FAPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const verify2FALogin = useAuthStore((s) => s.verify2FALogin);

    // Check for query params (Google OAuth redirect)
    const queryAction = searchParams.get('action');
    const queryTempToken = searchParams.get('temp_token');
    const queryProvider = searchParams.get('provider');

    // Check the action type (from state or query params)
    const action = location.state?.action || queryAction || 'login';
    const isDisabling = action === 'disable';
    const isLogin = action === 'login';
    const tempToken = location.state?.temp_token || queryTempToken;
    const provider = location.state?.provider || queryProvider;
    const redirectPath = location.state?.from || '/';

    useEffect(() => {
        // If coming from Google OAuth, show a welcome message
        if (provider === 'google') {
            toast.success("Xác thực Google thành công!");
        }
    }, [provider]);

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error("Vui lòng nhập mã xác thực 6 số");
            return;
        }

        try {
            setIsVerifying(true);

            if (isLogin) {
                // Verify 2FA for login
                if (!tempToken) {
                    toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
                    navigate("/login");
                    return;
                }

                await verify2FALogin?.(tempToken, verificationCode);

                const successMessage = provider === 'google'
                    ? "Đăng nhập Google thành công!"
                    : "Đăng nhập thành công!";

                toast.success(successMessage);

                setTimeout(() => {
                    const currentUser = useAuthStore.getState().authUser;
                    if (currentUser?.roles.role_name === "Admin") {
                        navigate("/admin", { replace: true });
                    } else {
                        navigate(redirectPath, { replace: true });
                    }
                }, 500);
            } else if (isDisabling) {
                // Disable 2FA
                const response = await disable2FA(verificationCode);

                if (response.success) {
                    toast.success("Đã tắt xác thực 2 yếu tố thành công!");
                    setTimeout(() => {
                        navigate("/profile", { replace: true });
                        window.location.reload();
                    }, 500);
                }
            }
        } catch (error: any) {
            if (error?.status === 400 && error?.message?.includes('hết hạn')) {
                toast.error("Phiên đăng nhập đã hết hạn");
                setTimeout(() => navigate("/login"), 1000);
            } else {
                toast.error(error?.message || "Mã xác thực không đúng");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCancel = () => {
        if (isLogin) {
            navigate("/login");
        } else if (isDisabling) {
            navigate("/profile");
        } else {
            navigate("/profile");
        }
    };

    const getTitle = () => {
        if (isLogin) {
            if (provider === 'google') return "Xác thực đăng nhập Google";
            return "Xác thực đăng nhập";
        }
        if (isDisabling) return "Tắt xác thực 2 yếu tố";
        return "Xác thực 2 yếu tố";
    };

    const getDescription = () => {
        if (isLogin) {
            if (provider === 'google') return "Xác thực tài khoản Google của bạn";
            return "Nhập mã để hoàn tất đăng nhập";
        }
        if (isDisabling) return "Xác nhận để tắt lớp bảo mật bổ sung";
        return "Nhập mã từ ứng dụng xác thực của bạn";
    };

    const getColorScheme = () => {
        if (isDisabling) return {
            gradient: "from-red-600 to-orange-600",
            textColor: "text-red-100",
            borderColor: "border-red-100",
            buttonColor: "bg-red-600 hover:bg-red-700"
        };
        return {
            gradient: "from-blue-600 to-purple-600",
            textColor: "text-blue-100",
            borderColor: "border-blue-100",
            buttonColor: "bg-blue-600 hover:bg-blue-700"
        };
    };

    const colors = getColorScheme();

    return (
        <Layout>
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className={`w-full max-w-md shadow-xl ${colors.borderColor}`}>
                    <CardHeader className={`bg-linear-to-r ${colors.gradient} text-white rounded-t-lg`}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-full">
                                {provider === 'google' ? (
                                    <FcGoogle className="w-6 h-6" />
                                ) : isDisabling ? (
                                    <ShieldOff className="w-6 h-6" />
                                ) : (
                                    <Shield className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">
                                    {getTitle()}
                                </CardTitle>
                                <CardDescription className={`${colors.textColor} mt-1`}>
                                    {getDescription()}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        {provider === 'google' && isLogin && (
                            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-green-800">
                                    <p className="font-medium mb-1">Xác thực Google thành công</p>
                                    <p>Tài khoản của bạn được bảo vệ bởi xác thực 2 yếu tố. Vui lòng nhập mã để tiếp tục.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-slate-600">
                                {isLogin
                                    ? provider === 'google'
                                        ? 'Vui lòng nhập mã xác thực 6 số từ ứng dụng Authenticator để hoàn tất đăng nhập với Google.'
                                        : 'Vui lòng nhập mã xác thực 6 số từ ứng dụng Authenticator để hoàn tất đăng nhập.'
                                    : isDisabling
                                        ? 'Để tắt tính năng này, vui lòng nhập mã xác thực 6 số từ ứng dụng Authenticator của bạn.'
                                        : 'Vui lòng nhập mã xác thực 6 số từ ứng dụng Authenticator.'
                                }
                            </p>

                            <div className="space-y-4 pt-2">
                                <div>
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
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && verificationCode.length === 6) {
                                                handleVerify();
                                            }
                                        }}
                                        className="text-center text-2xl tracking-widest font-mono mt-2"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || verificationCode.length !== 6}
                                className={`flex-1 ${colors.buttonColor} text-white`}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        {isDisabling ? (
                                            <>
                                                <ShieldOff className="w-4 h-4 mr-2" />
                                                Tắt 2FA
                                            </>
                                        ) : (
                                            <>
                                                {provider === 'google' ? (
                                                    <>
                                                        <FcGoogle className="w-4 h-4 mr-2" />
                                                        Xác thực Google
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        {isLogin ? 'Đăng nhập' : 'Xác thực'}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                disabled={isVerifying}
                            >
                                Hủy
                            </Button>
                        </div>

                        {isLogin && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Lưu ý bảo mật</p>
                                    <p>Mã xác thực thay đổi mỗi 30 giây. Phiên đăng nhập này sẽ hết hạn sau 10 phút.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}