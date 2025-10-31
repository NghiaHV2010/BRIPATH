import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ReportDialog from "./ReportDialog";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      // API call will be added by user
      // await axios.post(`${API_URL}/events/${event.id}/join`);

      setTimeout(() => {
        setHasJoined(!hasJoined);
        toast.success(
          hasJoined ? "Đã rời khỏi sự kiện" : "Đã tham gia sự kiện!"
        );
        setIsJoining(false);
      }, 300);
    } catch (error) {
      toast.error("Không thể tham gia sự kiện");
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Card
        className="event-card-hover overflow-hidden border-slate-200 shadow-sm hover:shadow-md bg-white transition-shadow"
        data-testid="event-card"
      >
        {/* Banner Image */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt={event.title}
              className="banner-image w-full h-full object-cover"
              data-testid="event-banner-image"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
              <Calendar className="w-16 h-16 text-white/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* Title */}
          <h3
            className="text-lg sm:text-xl font-bold text-slate-900 leading-snug"
            data-testid="event-title"
          >
            {event.title}
          </h3>

          {/* Date and Quantity Info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div
              className="flex items-center gap-1.5"
              data-testid="event-dates"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5"
              data-testid="event-quantity"
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{event.quantity} chỗ</span>
            </div>
          </div>

          {/* Working Time */}
          {event.working_time && (
            <div
              className="flex items-center gap-1.5 text-sm text-slate-600"
              data-testid="event-working-time"
            >
              <Clock className="w-4 h-4 text-green-500" />
              <span>{event.working_time}</span>
            </div>
          )}

          {/* Description */}
          <p
            className="text-slate-600 text-sm leading-relaxed line-clamp-3"
            data-testid="event-description"
          >
            {event.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className={`join-button flex-1 font-medium py-5 rounded-lg shadow-sm transition-all ${
                hasJoined
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              } text-white`}
              data-testid="join-event-button"
            >
              {hasJoined ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Đã tham gia
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {isJoining ? "Đang xử lý..." : "Tham gia"}
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowReportDialog(true)}
              variant="outline"
              size="icon"
              className="border-slate-300 hover:bg-red-50 hover:border-red-400 hover:text-red-600 rounded-lg h-11 w-11"
              data-testid="report-event-button"
            >
              <AlertCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        eventId={event.id}
      />
    </>
  );
};

export default EventCard;
