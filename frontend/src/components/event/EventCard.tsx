import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import ReportDialog from "./ReportDialog";
import { ApplyEventDialog } from "./ApplyEventDialog";
import type { Event } from "@/api/event_api";

interface EventCardProps {
  event: Event;
  onApplySuccess?: () => void;
}

const EventCard = ({ event, onApplySuccess }: EventCardProps) => {
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // ✅ Check if user has applied to this event
  const hasApplied = (event.volunteers?.length ?? 0) > 0;

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
        <div className="relative w-full aspect-video overflow-hidden bg-linear-to-br from-slate-200 to-slate-300">
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
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-indigo-500">
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
              onClick={() => setShowApplyDialog(true)}
              disabled={hasApplied}
              className={`join-button flex-1 font-medium py-5 rounded-lg shadow-sm transition-all ${
                hasApplied
                  ? "bg-emerald-600 text-white cursor-not-allowed hover:bg-emerald-700"
                  : "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              }`}
              data-testid="join-event-button"
            >
              <Users className="w-4 h-4 mr-2" />
              {hasApplied ? "✓ Đã ứng tuyển" : "Ứng tuyển"}
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

      {/* Apply Event Dialog */}
      <ApplyEventDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        eventId={event.id || ""}
        eventTitle={event.title}
        onSuccess={onApplySuccess}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        eventId={event.id || ""}
      />
    </>
  );
};

export default EventCard;
