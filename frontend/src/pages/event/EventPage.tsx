import EventForm from "@/components/event/EventForm";
import EventList from "@/components/event/EventList";
import { useState } from "react";

const EventsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Sự kiện Cộng đồng
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Khám phá và tham gia các sự kiện thú vị
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Create Event Form */}
        <EventForm onEventCreated={handleEventCreated} />

        {/* Events List */}
        <EventList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default EventsPage;
