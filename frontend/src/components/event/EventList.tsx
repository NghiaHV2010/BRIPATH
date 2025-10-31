import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Event } from "@/types/event";
import EventCard from "./EventCard";
import { Button } from "../ui/button";

// Mock data for demonstration
const generateMockEvents = (count: number): Event[] => {
  const mockImages = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
  ];

  const titles = [
    "Tech Innovation Summit 2025",
    "Hội thảo Sức khỏe Cộng đồng",
    "Khóa học Digital Marketing Master",
    "Hội nghị Thiết kế Sáng tạo",
    "Gặp gỡ Startup Networking",
    "Hội thảo AI & Machine Learning",
    "Triển lãm Nhiếp ảnh",
    "Lễ hội Âm nhạc Cuối tuần",
  ];

  const descriptions = [
    "Tham gia cùng chúng tôi trong hành trình khám phá tương lai công nghệ. Kết nối với các nhà lãnh đạo ngành, học hỏi từ các chuyên gia và khám phá những đổi mới tiên tiến đang định hình ngày mai.",
    "Chương trình chăm sóc sức khỏe toàn diện tập trung vào sức khỏe tinh thần, thể chất và lối sống cân bằng. Kết nối với các chuyên gia y tế và những người đam mê sức khỏe.",
    "Làm chủ nghệ thuật tiếp thị kỹ thuật số trong khóa học chuyên sâu này. Học SEO, chiến lược truyền thông xã hội, tiếp thị nội dung và phân tích từ các chuyên gia ngành.",
    "Khám phá các xu hướng mới nhất trong tư duy thiết kế và sáng tạo. Có hội thảo, thảo luận nhóm và đánh giá hồ sơ với các nhà thiết kế nổi tiếng.",
    "Kết nối với các doanh nhân và nhà đổi mới đồng nghiệp. Chia sẻ ý tưởng, tìm đồng sáng lập và xây dựng các mối quan hệ có ý nghĩa trong hệ sinh thái khởi nghiệp.",
    "Đắm mình vào trí tuệ nhân tạo và học máy. Các buổi thực hành, trình bày nghiên cứu và cơ hội kết nối với các chuyên gia AI.",
    "Khám phá những câu chuyện hình ảnh tuyệt đẹp qua ống kính của các nhiếp ảnh gia tài năng. Các buổi tương tác và giới thiệu hồ sơ.",
    "Ba ngày âm nhạc, ẩm thực và cộng đồng tuyệt vời. Có các nghệ sĩ địa phương và quốc tế trên nhiều thể loại.",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i + 1}`,
    title: titles[i % titles.length],
    description: descriptions[i % descriptions.length],
    start_date: new Date(2025, 9 + (i % 3), 1 + i).toISOString().split("T")[0],
    end_date: new Date(2025, 9 + (i % 3), 5 + i).toISOString().split("T")[0],
    quantity: Math.floor(Math.random() * 100) + 20,
    working_time: i % 2 === 0 ? "9:00 AM - 5:00 PM" : "",
    banner_url: mockImages[i % mockImages.length],
  }));
};

interface EventListProps {
  refreshTrigger: number;
}

const EventList = ({ refreshTrigger }: EventListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const eventsPerPage = 5;

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // API call will be added by user
      // const response = await axios.get(`${API_URL}/events`);
      // setEvents(response.data);

      // Using mock data for now
      setTimeout(() => {
        const mockEvents = generateMockEvents(15);
        setEvents(mockEvents);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = events.slice(startIndex, startIndex + eventsPerPage);

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
        {currentEvents.map(event => (
          <div key={event.id} className="fade-in">
            <EventCard event={event} />
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
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
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
