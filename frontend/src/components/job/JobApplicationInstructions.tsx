import { Shield } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function JobApplicationInstructions() {
    return (
        <Card>
            <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Cách thức ứng tuyển
                </h2>
                <div className="space-y-3 text-gray-700 text-sm">
                    <p>
                        • Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <strong>Ứng tuyển ngay</strong>
                    </p>
                    <p>
                        • Hồ sơ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng và bạn sẽ nhận được thông
                        báo qua email
                    </p>
                    <p>
                        • Nếu phù hợp, nhà tuyển dụng sẽ liên hệ với bạn qua thông tin liên lạc mà bạn đã
                        cung cấp
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}   