import CreateEventDialog from "@/components/event/CreateEventDialog";
import EventList from "@/components/event/EventList";
import { Layout } from "@/index";
import { useState } from "react";
import { Calendar } from "lucide-react"; // Đổi icon thành icon liên quan đến sự kiện hơn

const EventsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {" "}
          {/* Đổi max-w và px */}
          {/* Header */}
          <div className="mb-10 text-center">
            {" "}
            {/* Căn giữa header */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              {" "}
              {/* Tăng cỡ chữ, độ đậm */}
              <span className="text-blue-600"> Những sự kiện</span> thú vị đang
              chờ bạn !
            </h1>
            <p className="text-lg text-gray-600 max-w-5xl mx-auto">
              {" "}
              {/* Tăng cỡ chữ, giới hạn chiều rộng */}
              Khám phá và tham gia các hoạt động tình nguyện có ý nghĩa, góp
              phần xây dựng cộng đồng tốt đẹp hơn.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {" "}
            {/* Tăng gap */}
            {/* Left Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              <CreateEventDialog onEventCreated={handleEventCreated} />
              {/* Info Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                {" "}
                {/* Nền trắng, shadow nổi bật hơn */}
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  {" "}
                  {/* Bold hơn */}
                  <Calendar className="w-5 h-5 text-indigo-500" />{" "}
                  {/* Đổi màu icon */}
                  Gợi ý hữu ích
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Để sự kiện của bạn nổi bật, hãy cung cấp mô tả chi tiết, hình
                  ảnh chất lượng và thời gian rõ ràng.
                </p>
              </div>
            </aside>
            {/* Main Content */}
            <main className="lg:col-span-9">
              <EventList
                refreshTrigger={refreshTrigger}
                onApplySuccess={handleEventCreated}
              />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
