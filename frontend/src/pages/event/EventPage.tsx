import CreateEventDialog from "@/components/event/CreateEventDialog";
import EventList from "@/components/event/EventList";
import { Layout } from "@/index";
import { useState } from "react";
import { Calendar } from "lucide-react";

const EventsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sự kiện tình nguyện
            </h1>
            <p className="text-gray-600">
              Khám phá và tham gia các hoạt động tình nguyện có ý nghĩa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Create Event Card */}
              <CreateEventDialog onEventCreated={handleEventCreated} />

              {/* Info Card */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg shadow-sm border border-amber-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  💡 Gợi ý
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Tạo sự kiện với mô tả chi tiết và hình ảnh đẹp để thu hút
                  nhiều người tham gia hơn.
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
