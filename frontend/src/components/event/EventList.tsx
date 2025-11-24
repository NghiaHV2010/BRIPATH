import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset when refresh trigger changes
  useEffect(() => {
    setEvents([]);
    setCurrentPage(1);
    fetchEvents(1, true);
  }, [refreshTrigger]);

  const fetchEvents = async (page: number, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getAllEvents(page);

      if (isInitial || page === 1) {
        setEvents(response.data);
      } else {
        setEvents(prev => [...prev, ...response.data]);
      }

      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện");
      if (isInitial) {
        setEvents([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchEvents(nextPage, false);
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

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="flex items-center justify-center mt-8 pb-8">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all"
            data-testid="load-more-button"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              "Xem thêm sự kiện"
            )}
          </Button>
        </div>
      )}

      {/* End message */}
      {currentPage >= totalPages && events.length > 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            Đã hiển thị tất cả {events.length} sự kiện
          </p>
        </div>
      )}
    </div>
  );
};

export default EventList;
