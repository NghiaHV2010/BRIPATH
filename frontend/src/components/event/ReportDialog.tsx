// import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/api/user_api";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

const reportReasons = [
  { id: "fraud", label: "Lừa đảo, gian lận hoặc mạo danh" },
  { id: "adult", label: "Nội dung người lớn" },
  { id: "fake", label: "Bán hoặc quảng cáo mặt hàng bị hạn chế" },
  { id: "violence", label: "Bạo lực, thù ghét hoặc bóc lột" },
  { id: "spam", label: "Bắt nạt hoặc liên hệ theo cách không mong muốn" },
  { id: "rights", label: "Quyền sở hữu trí tuệ" },
  { id: "suicide", label: "Tự tử hoặc tự hại bản thân" },
  { id: "false", label: "Thông tin sai sự thật" },
];

const ReportDialog = ({ open, onOpenChange, eventId }: ReportDialogProps) => {
  const [step, setStep] = useState<"select" | "detail">("select");
  const [selectedReason, setSelectedReason] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectReason = (reasonId: string) => {
    const reason = reportReasons.find(r => r.id === reasonId);
    if (reason) {
      setSelectedReason(reason);
      setStep("detail");
    }
  };

  const handleBack = () => {
    setStep("select");
    setDescription("");
  };

  const handleSubmitReport = async () => {
    if (!selectedReason || !description.trim()) {
      toast.error("Vui lòng nhập mô tả chi tiết");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReport({
        title: `Báo cáo sự kiện: ${selectedReason.label}`,
        description: `Báo cáo sự kiện ID: ${eventId}\nLý do: ${selectedReason.label}\n\nChi tiết: ${description}`,
      });

      if (result.success) {
        toast.success("Báo cáo chờ duyệt thành công. Cảm ơn bạn đã phản hồi.");
        onOpenChange(false);
        // Reset state
        setStep("select");
        setSelectedReason(null);
        setDescription("");
      } else {
        toast.error(result.message || "Không thể gửi báo cáo");
      }
    } catch (error) {
      toast.error("Không thể gửi báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setStep("select");
      setSelectedReason(null);
      setDescription("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="sm:max-w-[425px] p-0"
        data-testid="report-dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {step === "detail" && (
              <button
                onClick={handleBack}
                className="hover:bg-slate-100 rounded-full p-1 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <DialogTitle className="text-xl font-bold flex-1 text-center">
              {step === "select" ? "Báo cáo" : "Chi tiết báo cáo"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "select" ? (
          <div className="px-2 pb-2">
            <p className="text-sm text-slate-600 px-4 py-3">
              Tại sao bạn báo cáo sự kiện này?
            </p>
            <p className="text-xs text-slate-500 px-4 pb-3">
              Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy
              tìm ngay sự giúp đỡ trước khi báo cáo.
            </p>

            <div className="space-y-0">
              {reportReasons.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => handleSelectReason(reason.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  data-testid={`report-reason-${reason.id}`}
                >
                  <span className="text-sm text-slate-900">{reason.label}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Lý do báo cáo:
              </p>
              <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-md">
                {selectedReason?.label}
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700 mb-2 block"
              >
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 mt-1">
                Cung cấp thông tin chi tiết giúp chúng tôi xử lý nhanh hơn
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={isSubmitting || !description.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
