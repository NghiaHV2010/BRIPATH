import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Calendar, User } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { CompanyFeedback as CompanyFeedbackType } from "@/types/company";

interface CompanyFeedbackProps {
  feedbacks: CompanyFeedbackType[];
  companyName: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
            }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const FeedbackCard = ({ feedback }: { feedback: CompanyFeedbackType }) => {
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
                <span className="text-2xl">{getGenderIcon(feedback.users.gender)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
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

const FeedbackStats = ({ feedbacks }: { feedbacks: CompanyFeedbackType[] }) => {
  const [showDetails, setShowDetails] = useState(false);
  const averageRating = feedbacks.reduce((sum, f) => sum + f.stars, 0) / feedbacks.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedbacks.filter((f) => Math.round(f.stars) === rating).length,
    percentage: (feedbacks.filter((f) => Math.round(f.stars) === rating).length / feedbacks.length) * 100,
  }));

  return (
    <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {averageRating.toFixed(1)}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <StarRating rating={averageRating} />
            </div>
            <p className="text-sm text-slate-600">
              Dựa trên {feedbacks.length} đánh giá
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {feedbacks.length}
            </div>
            <p className="text-sm text-slate-600">Đánh giá</p>
          </div>
        </div>

        {/* Toggle button for details */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
          </Button>
        </div>

        {/* Rating distribution - only show when expanded */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Phân bố đánh giá:</h4>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm font-medium text-slate-600">
                    {rating}
                  </span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CompanyFeedback({ feedbacks, companyName }: CompanyFeedbackProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 3);

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Đánh giá từ người dùng
          </h2>
          <p className="text-slate-600 text-lg">
            Chưa có đánh giá nào từ người dùng về {companyName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Đánh giá từ người dùng
        </h2>
        <p className="text-slate-600 text-lg">
          Những chia sẻ chân thực từ người dùng về trải nghiệm với công ty
        </p>
      </div>

      {/* Stats */}
      <FeedbackStats feedbacks={feedbacks} />

      {/* Feedback list */}
      <div className="space-y-6">
        {displayedFeedbacks.map((feedback, index) => (
          <FeedbackCard key={index} feedback={feedback} />
        ))}

        {feedbacks.length > 3 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3"
            >
              {showAll ? "Ẩn bớt" : `Xem thêm ${feedbacks.length - 3} đánh giá`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
