import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Send, Image as ImageIcon, Plus } from "lucide-react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { createEvent } from "@/api/event_api";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase.config";
import { useAuthStore } from "@/store/auth";
import { LoginDialog } from "@/components/login/LoginDialog";
import { SubscriptionRequiredDialog } from "@/components/subscription/SubscriptionRequiredDialog";
import { getUserSubscription } from "@/api/user_api";
import toast from "react-hot-toast";

interface EventFormProps {
  onEventCreated: () => void;
}

const CreateEventDialog = ({ onEventCreated }: EventFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const authUser = useAuthStore(state => state.authUser);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    quantity: "",
    working_time: "",
    banner_url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      toast.error("Kích thước tệp vượt quá giới hạn 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(
        storage,
        `event-banners/${Date.now()}_${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        error => {
          console.error(error);
          toast.error("Tải lên thất bại, vui lòng thử lại.");
          setIsUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({ ...prev, banner_url: url }));
          setIsUploading(false);
          setUploadProgress(100);
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải tệp lên Firebase.");
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, banner_url: "" }));
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.quantity
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
      };
      console.log("Creating event with payload:", payload);
      await createEvent(payload);
      toast.success("Tạo sự kiện thành công!");
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        quantity: "",
        working_time: "",
        banner_url: "",
      });
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsOpen(false);
      onEventCreated();
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo sự kiện");
      // console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Clear all form data when closing
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        quantity: "",
        working_time: "",
        banner_url: "",
      });
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsOpen(open);
  };

  const handleTriggerClick = async () => {
    // Check if user is logged in
    if (!authUser) {
      setShowLoginDialog(true);
      return;
    }

    // Check if user has subscription
    try {
      const subscriptionData = await getUserSubscription();

      if (
        !subscriptionData ||
        !subscriptionData.data ||
        subscriptionData.data.length === 0
      ) {
        setShowSubscriptionDialog(true);
        return;
      }

      // User has subscription, open create dialog
      setIsOpen(true);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Không thể kiểm tra subscription. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div
        onClick={handleTriggerClick}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-50 p-2 sm:p-3 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm w-full"
      >
        <div className="p-1.5 sm:p-2 bg-blue-600 rounded-full shrink-0">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <input
          type="text"
          placeholder="Tạo sự kiện mới..."
          className="flex-1 bg-transparent border-0 outline-none text-slate-600 cursor-pointer text-sm sm:text-base min-w-0"
          readOnly
        />
        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
      </div>

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                Tạo sự kiện mới
              </span>
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 py-3 sm:py-4"
          >
            {/* Title */}
            <div className="space-y-2">
              <Input
                id="title"
                data-testid="event-title-input"
                placeholder="Tiêu đề sự kiện"
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-medium"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Textarea
                id="description"
                data-testid="event-description-input"
                placeholder="Mô tả chi tiết về sự kiện của bạn..."
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-20 sm:min-h-[100px] max-h-[300px] border-slate-300 focus:ring-blue-500 focus:border-blue-500 resize-y w-full text-sm sm:text-base overflow-y-auto"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="start_date"
                  className="text-slate-700 text-xs sm:text-sm font-medium"
                >
                  Ngày bắt đầu
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="start_date"
                      data-testid="event-start-date-input"
                      type="text"
                      value={formData.start_date}
                      readOnly
                      placeholder="Chọn ngày bắt đầu"
                      className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white text-sm sm:text-base"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <ShadCalendar
                      mode="single"
                      locale={vi}
                      selected={
                        formData.start_date
                          ? new Date(formData.start_date)
                          : undefined
                      }
                      onSelect={date => {
                        if (date) {
                          setFormData({
                            ...formData,
                            start_date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="end_date"
                  className="text-slate-700 text-xs sm:text-sm font-medium"
                >
                  Ngày kết thúc
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="end_date"
                      data-testid="event-end-date-input"
                      type="text"
                      value={formData.end_date}
                      readOnly
                      placeholder="Chọn ngày kết thúc"
                      className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white text-sm sm:text-base"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <ShadCalendar
                      mode="single"
                      locale={vi}
                      selected={
                        formData.end_date
                          ? new Date(formData.end_date)
                          : undefined
                      }
                      onSelect={date => {
                        if (date) {
                          setFormData({
                            ...formData,
                            end_date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quantity and Working Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="quantity"
                  className="text-slate-700 text-xs sm:text-sm font-medium"
                >
                  Số lượng
                </Label>
                <Input
                  id="quantity"
                  data-testid="event-quantity-input"
                  type="number"
                  placeholder="Ví dụ: 50"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="working_time"
                  className="text-slate-700 text-xs sm:text-sm font-medium"
                >
                  Thời gian
                </Label>
                <Input
                  id="working_time"
                  data-testid="event-working-time-input"
                  placeholder="9:00 AM - 5:00 PM"
                  value={formData.working_time}
                  onChange={e =>
                    setFormData({ ...formData, working_time: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label
                htmlFor="banner_image"
                className="text-slate-700 text-xs sm:text-sm font-medium"
              >
                Banner sự kiện
              </Label>
              {!formData.banner_url ? (
                <label
                  className={`border-2 border-dashed rounded-lg w-full flex flex-col items-center justify-center p-4 sm:p-6 cursor-pointer ${isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                    }`}
                >
                  <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  <span className="text-gray-600 text-xs sm:text-sm mt-2 text-center">
                    Chọn banner cho sự kiện
                  </span>
                  <span className="text-gray-400 text-[10px] sm:text-xs mt-1 text-center">
                    (PNG, JPG, WEBP - Tối đa 10MB)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={isUploading}
                    ref={fileInputRef}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                  {isUploading && (
                    <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </label>
              ) : (
                <div className="relative border rounded-lg p-2">
                  <img
                    src={formData.banner_url}
                    alt="Event banner"
                    className="w-full h-32 sm:h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-3 right-3 bg-white rounded-full p-1.5 sm:p-2 text-gray-500 hover:text-red-500 shadow-md"
                    variant="ghost"
                    size="sm"
                  >
                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />✕
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <DialogFooter className="pt-3 sm:pt-4 gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting || isUploading}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang tạo...
                  </>
                ) : isUploading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang upload ({Math.round(uploadProgress)}%)...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Tạo sự kiện
                  </>
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

      {/* Subscription Required Dialog */}
      <SubscriptionRequiredDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        message="Bạn cần mua gói dịch vụ để tạo sự kiện mới"
      />

    </>
  );
};

export default CreateEventDialog;
