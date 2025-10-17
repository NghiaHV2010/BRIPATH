import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { applyjob, getUserCVs, type CV } from "@/api/job_api";
import { toast } from "sonner";
import { uploadUserCV } from "@/api/cv_api";

interface ApplyJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export function ApplyJobDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  onSuccess,
}: ApplyJobDialogProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadCVs();
    }
  }, [open]);

  const loadCVs = async () => {
    setIsLoadingCVs(true);
    setError("");
    try {
      const data = await getUserCVs();
      setCvs(
        Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      );
    } catch (err: any) {
      setError("Không thể tải danh sách CV. Vui lòng thử lại.");
      console.error(err);
      setCvs([]);
    } finally {
      setIsLoadingCVs(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Vui lòng chọn file PDF hoặc Word (.doc, .docx)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      await uploadUserCV(file);
      toast.success("Upload thành công", {
        description: "CV của bạn đã được tải lên.",
        duration: 3000,
      });
      // Reload CVs after successful upload
      await loadCVs();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải CV. Vui lòng thử lại."
      );
      console.error(err);
      toast.error("Lỗi khi tải CV", {
        description:
          (err?.response?.data?.message as string) ||
          "Có lỗi xảy ra khi tải CV. Vui lòng thử lại.",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCvId) {
      setError("Vui lòng chọn CV để ứng tuyển");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await applyjob(jobId, parseInt(selectedCvId), coverLetter || undefined);
      toast.success("Ứng tuyển thành công", {
        description: "Đơn ứng tuyển của bạn đã được gửi đi.",
        duration: 3000,
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại."
      );
      toast.error("Ứng tuyển thất bại", {
        description:
          (err?.response?.data?.message as string) ||
          "Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCvId("");
    setCoverLetter("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Ứng tuyển công việc</DialogTitle>
          <DialogDescription>{jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* CV Selection */}
          <div className="space-y-2">
            <Label htmlFor="cv-select" className="text-base font-semibold">
              Chọn CV <span className="text-destructive">*</span>
            </Label>
            {isLoadingCVs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : cvs.length === 0 ? (
              <div className="border rounded-lg p-6 bg-muted/50">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Bạn chưa có CV nào</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Vui lòng tải lên CV của bạn để tiếp tục ứng tuyển
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên CV
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ: PDF, DOC, DOCX (Tối đa 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                <SelectTrigger id="cv-select" className="w-full">
                  <SelectValue placeholder="-- Chọn CV --" />
                </SelectTrigger>
                <SelectContent>
                  {cvs.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{cv.fullname}</span>
                          {cv.apply_job && (
                            <span className="text-xs text-muted-foreground">
                              {cv.apply_job}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover-letter" className="text-base font-semibold">
              Cover Letter
            </Label>
            <Textarea
              id="cover-letter"
              placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length}/1000 ký tự
            </p>
          </div>

          {/* Guidelines */}
          <div className="border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 dark:text-orange-400 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Lưu ý khi ứng tuyển
            </h4>
            <ul className="space-y-1 text-xs text-orange-700 dark:text-orange-400">
              <li>• Kiểm tra kỹ thông tin CV trước khi gửi</li>
              <li>
                • Cover letter nên ngắn gọn, rõ ràng và thể hiện điểm mạnh của
                bạn
              </li>
              <li>
                • Tuyệt đối không đưa tiền hoặc tài sản cho bất kỳ ai trong quá
                trình ứng tuyển
              </li>
              <li>
                • Sau khi ứng tuyển, nhà tuyển dụng sẽ xem xét và liên hệ với
                bạn qua thông tin trong CV
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedCvId || cvs.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi ứng tuyển"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
