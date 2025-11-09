import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { applyEvent } from "@/api/event_api";
import { useSettingsStore } from "@/store/settings.store";
import { useAuthStore } from "@/store/auth";
import { LoginDialog } from "@/components/login/LoginDialog";

interface ApplyEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

export function ApplyEventDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  onSuccess,
}: ApplyEventDialogProps) {
  const { settings, fetchSettings } = useSettingsStore();
  const authUser = useAuthStore(state => state.authUser);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Check authentication and auto-fill cover letter when dialog opens
  useEffect(() => {
    const checkAuthAndLoadSettings = async () => {
      if (open) {
        // Check if user is logged in
        if (!authUser) {
          onOpenChange(false); // Close apply dialog
          setShowLoginDialog(true);
          return;
        }

        // User is logged in, fetch settings for cover letter
        if (settings.length === 0) {
          fetchSettings();
        }

        // Find cover_letter setting
        const coverLetterSetting = settings.find(s => s.key === "cover_letter");

        if (coverLetterSetting) {
          // If user selected "Tự động" and has customValue, auto-fill description
          if (
            coverLetterSetting.selectedOption === "Tự động" &&
            coverLetterSetting.customValue
          ) {
            setDescription(coverLetterSetting.customValue);
          } else {
            setDescription("");
          }
        }
      }
    };

    checkAuthAndLoadSettings();
  }, [open, authUser, settings, fetchSettings, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả ứng tuyển");
      return;
    }

    setIsSubmitting(true);
    try {
      await applyEvent(eventId, description);
      toast.success("Ứng tuyển thành công!");
      onOpenChange(false);
      setDescription("");
      // Call onSuccess callback to refresh the event list
      onSuccess?.();
    } catch (error) {
      console.error("Error applying to event:", error);
      toast.error("Không thể ứng tuyển. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ứng tuyển sự kiện</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{eventTitle}</p>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Cover Letter <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Giới thiệu bản thân và lý do bạn muốn tham gia sự kiện này..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === "cover_letter")
                    ?.selectedOption === "Tự động"
                    ? "✨ Đã tự động điền cover letter từ cài đặt của bạn"
                    : "Nhập mô tả ứng tuyển của bạn"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi ứng tuyển"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        redirectTo="/events"
      />
    </>
  );
}
