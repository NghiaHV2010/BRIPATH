import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import EventCard from "./EventCard";
import { Button } from "../ui/button";
import { getAllEvents, type Event } from "@/api/event_api";
import { toast } from "sonner";

interface EventListProps {
  refreshTrigger: number;
  onApplySuccess?: () => void;
}

const EventList = ({ refreshTrigger, onApplySuccess }: EventListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, currentPage]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await getAllEvents(currentPage);
      setEvents(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-testid="loading-spinner"
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20" data-testid="no-events-message">
        <p className="text-slate-500 text-lg">
          Chưa có sự kiện nào. Hãy là người đầu tiên tạo sự kiện!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Events List - Single Column */}
      <div className="space-y-4" data-testid="events-list">
        {events.map(event => (
          <div key={event.id} className="fade-in">
            <EventCard event={event} onApplySuccess={onApplySuccess} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-8 pb-8"
          data-testid="pagination-controls"
        >
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="pagination-button border-slate-300 hover:bg-blue-50 hover:border-blue-400"
            data-testid="prev-page-button"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`pagination-button w-8 h-8 p-0 ${
                currentPage === page
                  ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white border-0"
                  : "border-slate-300 hover:bg-blue-50 hover:border-blue-400"
              }`}
              data-testid={`page-${page}-button`}
            >
              {page}
            </Button>
          ))}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="pagination-button border-slate-300 hover:bg-blue-50 hover:border-blue-400"
            data-testid="next-page-button"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventList;
