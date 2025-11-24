import { useState } from "react";
import { Clock, Users } from "lucide-react";
import { format } from "date-fns";
import ReportDialog from "./ReportDialog";
import { LoginDialog } from "@/components/login/LoginDialog";
import { useAuthStore } from "@/store/auth";
import type { Event } from "@/api/event_api";

interface EventCardProps {
  event: Event;
  onApplySuccess?: () => void;
}

const EventCard = ({ event }: EventCardProps) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const authUser = useAuthStore(state => state.authUser);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const imageSrc =
    !imageError && event.banner_url
      ? event.banner_url
      : `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-25&blend=0F172A&blend-mode=screen&sig=${
          event.id ?? event.title
        }`;

  const handleReportClick = () => {
    if (!authUser) {
      setShowLoginDialog(true);
    } else {
      setShowReportDialog(true);
    }
  };

  return (
    <>
      <div
        className="m-4 max-w-3xl w-full rounded-4xl bg-background border border-primary/10 shadow-2xl/10 p-4"
        data-testid="event-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 card-header">
          <div className="flex items-center gap-4">
            <img
              src={
                event.users?.avatar_url ||
                `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop`
              }
              alt={event.users?.username || "User"}
              width={35}
              height={35}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="flex flex-col">
                <span className="font-semibold">
                  {event.users?.username || "Anonymous"}
                </span>
                <span className="flex items-center gap-2 opacity-70 text-sm">
                  <h2>
                    Ngày bắt đầu: {formatDate(event.start_date)} -{" "}
                    {formatDate(event.end_date)}
                  </h2>
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={handleReportClick}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
          >
            Báo cáo
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-6">
          {/* Title */}
          <h2
            className="text-xl font-bold text-slate-900"
            data-testid="event-title"
          >
            {event.title}
          </h2>

          {/* Description */}
          <p
            className="whitespace-pre-wrap text-slate-700 leading-relaxed"
            data-testid="event-description"
          >
            {event.description}
          </p>

          {/* Banner Image */}
          <img
            src={imageSrc}
            alt={event.title}
            width={1920}
            height={1080}
            className="max-w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity border border-slate-200"
            data-testid="event-banner-image"
            onError={() => setImageError(true)}
            onClick={() => setShowImageModal(true)}
            loading="lazy"
          />
        </div>

        {/* Event Info */}
        <div className="mt-4 flex justify-evenly gap-2">
          {event.working_time && (
            <div className="flex grow items-center justify-center gap-3 rounded-xl px-4 py-2">
              <Clock />
              <span className="inline font-medium">
                Thời gian: {event.working_time}
              </span>
            </div>
          )}

          <div className="flex grow items-center justify-center gap-3 rounded-xl px-4 py-2">
            <Users />
            <span className="inline font-medium">
              Số lượng: {event.quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        eventId={event.id || ""}
      />

      {/* Login Dialog */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full">
            <img
              src={imageSrc}
              alt={event.title}
              className="w-full h-full object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
