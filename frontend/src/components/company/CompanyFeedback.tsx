import { useState, useMemo } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Calendar,
  User,
  Flag,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import type { CompanyFeedback as CompanyFeedbackType } from "@/types/company";
import { createReport } from "@/api/user_api";
import { toast } from "sonner";

interface CompanyFeedbackProps {
  feedbacks: CompanyFeedbackType[];
  companyName: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const feedbackReportReasons = [
  { id: "inappropriate", label: "Ngôn từ không phù hợp, công kích cá nhân" },
  { id: "fake", label: "Đánh giá giả mạo hoặc spam" },
  { id: "false", label: "Thông tin sai sự thật về công ty" },
  { id: "competitive", label: "Đối thủ cạnh tranh phá hoại uy tín" },
  { id: "harassment", label: "Quấy rối hoặc đe dọa" },
  { id: "violence", label: "Nội dung bạo lực hoặc thù ghét" },
  { id: "rights", label: "Vi phạm quyền sở hữu trí tuệ" },
  { id: "other", label: "Lý do khác" },
];

interface ReportFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackId: string;
  feedbackUsername: string;
}

const ReportFeedbackDialog = ({
  open,
  onOpenChange,
  feedbackId,
  feedbackUsername,
}: ReportFeedbackDialogProps) => {
  const [step, setStep] = useState<"select" | "detail">("select");
  const [selectedReason, setSelectedReason] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectReason = (reasonId: string) => {
    const reason = feedbackReportReasons.find(r => r.id === reasonId);
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
      await createReport({
        title: `Báo cáo đánh giá: ${selectedReason.label}`,
        description: `Báo cáo đánh giá từ người dùng: ${feedbackUsername}\nID đánh giá: ${feedbackId}\nLý do: ${selectedReason.label}\n\nChi tiết: ${description}`,
      });

      toast.success("Báo cáo của bạn đã được gửi và đang chờ xem xét");
      onOpenChange(false);
      setStep("select");
      setSelectedReason(null);
      setDescription("");
    } catch {
      toast.error("Không thể gửi báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setStep("select");
      setSelectedReason(null);
      setDescription("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px] p-0">
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
              {step === "select" ? "Báo cáo đánh giá" : "Chi tiết báo cáo"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "select" ? (
          <div className="px-2 pb-2">
            <p className="text-sm text-slate-600 px-4 py-3">
              Tại sao bạn báo cáo đánh giá này?
            </p>
            <p className="text-xs text-slate-500 px-4 pb-3">
              Báo cáo sẽ được quản trị viên xem xét và xử lý theo quy định của
              hệ thống.
            </p>

            <div className="space-y-0">
              {feedbackReportReasons.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => handleSelectReason(reason.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
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
              <p className="text-sm font-medium text-slate-700 mb-2">
                Mô tả chi tiết:
              </p>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">
                {description.length}/500 ký tự
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
                className="flex-1 bg-red-600 hover:bg-red-700"
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

const FeedbackCard = ({
  feedback,
  onReportClick,
  feedbackIndex,
}: {
  feedback: CompanyFeedbackType;
  onReportClick?: (feedbackIndex: number, username: string) => void;
  feedbackIndex: number;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderIcon = (gender?: string | null) => {
    switch (gender) {
      case "male":
        return "👨";
      case "female":
        return "👩";
      default:
        return "👤";
    }
  };

  return (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {feedback.users.avatar_url ? (
              <img
                src={feedback.users.avatar_url}
                alt={feedback.users.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                <span className="text-2xl">
                  {getGenderIcon(feedback.users.gender)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-slate-900">
                    {feedback.users.username}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    Người dùng
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(feedback.created_at)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onReportClick?.(feedbackIndex, feedback.users.username)
                }
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Báo cáo đánh giá"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <StarRating rating={feedback.stars} />
            </div>

            {/* Main feedback */}
            <div className="mb-4">
              <p className="text-slate-700 leading-relaxed">
                {feedback.description}
              </p>
            </div>

            {/* Additional details */}
            {(feedback.work_environment || feedback.benefit) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {feedback.work_environment && (
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-slate-900 mb-1">
                        Môi trường làm việc
                      </h5>
                      <p className="text-sm text-slate-600">
                        {feedback.work_environment}
                      </p>
                    </div>
                  </div>
                )}

                {feedback.benefit && (
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-slate-900 mb-1">
                        Phúc lợi
                      </h5>
                      <p className="text-sm text-slate-600">
                        {feedback.benefit}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CompanyFeedback({ feedbacks }: CompanyFeedbackProps) {
  const [showAll, setShowAll] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    index: number;
    username: string;
  } | null>(null);

  const displayedFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 3);

  const averageRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, fb) => sum + fb.stars, 0);
    return parseFloat((total / feedbacks.length).toFixed(1));
  }, [feedbacks]);

  const handleReportClick = (feedbackIndex: number, username: string) => {
    setSelectedFeedback({ index: feedbackIndex, username });
    setReportDialogOpen(true);
  };

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Đánh giá từ người dùng
          </h2>
          <p className="text-slate-600">Chưa có đánh giá nào từ người dùng</p>
        </div>

        {/* Empty state card */}
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl font-bold text-gray-300 mb-2">0.0</div>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-5 h-5 text-gray-300" />
                ))}
              </div>
              <p className="text-gray-500 font-medium">Chưa có đánh giá nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Đánh giá sẽ được hiển thị ở đây
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Đánh giá từ người dùng
          </h2>
          <p className="text-slate-600">
            Những chia sẻ chân thực từ người dùng về trải nghiệm với công ty
          </p>
        </div>

        {/* Rating Summary */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="text-center md:min-w-[120px]">
              <div className="text-5xl font-bold text-blue-600">
                {averageRating}
              </div>
              <div className="flex items-center justify-center mt-2 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">{feedbacks.length}</span> đánh
                giá
              </p>
            </div>
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = feedbacks.filter(f => f.stars === star).length;
                const percentage = (count / feedbacks.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">
                      {star} ★
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback list */}
        <div className="space-y-6">
          {displayedFeedbacks.map((feedback, index) => (
            <FeedbackCard
              key={index}
              feedback={feedback}
              feedbackIndex={index}
              onReportClick={handleReportClick}
            />
          ))}

          {feedbacks.length > 3 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="px-8"
              >
                {showAll
                  ? "Ẩn bớt"
                  : `Xem thêm ${feedbacks.length - 3} đánh giá`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedFeedback && (
        <ReportFeedbackDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          feedbackId={`${selectedFeedback.index}`}
          feedbackUsername={selectedFeedback.username}
        />
      )}
    </>
  );
}
