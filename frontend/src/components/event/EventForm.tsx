import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface EventFormProps {
  onEventCreated: () => void;
}

const EventForm = ({ onEventCreated }: EventFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    quantity: "",
    working_time: "",
    banner_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // API call will be added by user
      // const response = await axios.post(`${API_URL}/events`, formData);

      toast.success("Tạo sự kiện thành công! (Chờ tích hợp API)");

      // Reset form
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        quantity: "",
        working_time: "",
        banner_url: "",
      });
      setIsExpanded(false);

      onEventCreated();
    } catch (error) {
      toast.error("Không thể tạo sự kiện");
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardContent className="p-4 sm:p-6">
        {!isExpanded ? (
          // Collapsed state - Simple input that expands
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
            data-testid="create-event-trigger"
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              placeholder="Tạo sự kiện mới..."
              className="flex-1 bg-transparent border-0 outline-none text-slate-600 cursor-pointer"
              readOnly
            />
            <ImageIcon className="w-5 h-5 text-slate-400" />
          </div>
        ) : (
          // Expanded state - Full form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Tạo sự kiện mới
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                data-testid="close-form-button"
              >
                ✕
              </Button>
            </div>

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
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
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
                className="min-h-[100px] border-slate-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="start_date"
                  className="text-slate-700 text-sm font-medium"
                >
                  Ngày bắt đầu
                </Label>
                <Input
                  id="start_date"
                  data-testid="event-start-date-input"
                  type="date"
                  value={formData.start_date}
                  onChange={e =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="end_date"
                  className="text-slate-700 text-sm font-medium"
                >
                  Ngày kết thúc
                </Label>
                <Input
                  id="end_date"
                  data-testid="event-end-date-input"
                  type="date"
                  value={formData.end_date}
                  onChange={e =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quantity and Working Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="quantity"
                  className="text-slate-700 text-sm font-medium"
                >
                  Số lượng chỗ
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
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="working_time"
                  className="text-slate-700 text-sm font-medium"
                >
                  Thời gian (tùy chọn)
                </Label>
                <Input
                  id="working_time"
                  data-testid="event-working-time-input"
                  placeholder="9:00 AM - 5:00 PM"
                  value={formData.working_time}
                  onChange={e =>
                    setFormData({ ...formData, working_time: e.target.value })
                  }
                  className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <Label
                htmlFor="banner_url"
                className="text-slate-700 text-sm font-medium"
              >
                URL ảnh bìa (tùy chọn)
              </Label>
              <Input
                id="banner_url"
                data-testid="event-banner-url-input"
                placeholder="https://example.com/image.jpg"
                value={formData.banner_url}
                onChange={e =>
                  setFormData({ ...formData, banner_url: e.target.value })
                }
                className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="flex-1"
                data-testid="cancel-button"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                data-testid="create-event-button"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Đang tạo..." : "Đăng sự kiện"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default EventForm;
