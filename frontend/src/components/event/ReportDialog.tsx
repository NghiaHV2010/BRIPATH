import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

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

const ReportDialog = ({ open, onOpenChange }: ReportDialogProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async (reasonId: string) => {
    setSelectedReason(reasonId);
    setIsSubmitting(true);

    try {
      // API call will be added by user
      // await axios.post(`${API_URL}/events/${eventId}/report`, { reason: reasonId });

      setTimeout(() => {
        toast.success("Đã gửi báo cáo. Cảm ơn bạn đã phản hồi.");
        setIsSubmitting(false);
        onOpenChange(false);
        setSelectedReason(null);
      }, 800);
    } catch (error) {
      toast.error("Không thể gửi báo cáo");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] p-0"
        data-testid="report-dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <DialogTitle className="text-xl font-bold text-center">
            Báo cáo
          </DialogTitle>
        </DialogHeader>

        <div className="px-2 pb-2">
          <p className="text-sm text-slate-600 px-4 py-3">
            Tại sao bạn báo cáo quảng cáo này?
          </p>
          <p className="text-xs text-slate-500 px-4 pb-3">
            Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy tìm
            ngay sự giúp đỡ trước khi báo cáo với Facebook.
          </p>

          <div className="space-y-0">
            {reportReasons.map(reason => (
              <button
                key={reason.id}
                onClick={() => handleReport(reason.id)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                data-testid={`report-reason-${reason.id}`}
              >
                <span className="text-sm text-slate-900">{reason.label}</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
