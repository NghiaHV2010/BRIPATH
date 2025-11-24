import CreateEventDialog from "@/components/event/CreateEventDialog";
import EventList from "@/components/event/EventList";
import { Layout } from "@/index";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { getRecommendedJobs } from "@/api/event_api";
import { useAuthStore } from "@/store/auth";
import { RecommendedJobsCard } from "@/components/job/RecommendedJobCard";

const EventsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState<
    Array<{
      id: string;
      job_title: string;
      salary: number[];
      currency: string;
      location: string;
      status: string;
      job_category: string;
      label_name: string | null;
      avatar_url: string | null;
      username: string;
    }>
  >([]);

  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const authUser = useAuthStore(state => state.authUser);

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Fetch recommended jobs
      setIsLoadingJobs(true);
      try {
        const jobsResponse = await getRecommendedJobs();
        setRecommendedJobs(jobsResponse.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchRecommendations();
  }, [authUser]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-[1600px] mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
            {/* Left Sidebar - Create Event (Sticky on desktop, 20%) */}
            <aside className="w-full lg:w-[20%] lg:min-w-[200px] lg:shrink-0">
              <div className="lg:sticky lg:top-6 space-y-3 sm:space-y-4 lg:space-y-6">
                <CreateEventDialog onEventCreated={handleEventCreated} />
                {/* Info Card - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-500" />
                    Gợi ý hữu ích
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                    Để sự kiện của bạn nổi bật, hãy cung cấp mô tả chi tiết,
                    hình ảnh chất lượng và thời gian rõ ràng.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content - Event Cards (55% on desktop, full width on mobile) */}
            <main className="w-full lg:w-[55%] lg:flex-1 lg:min-w-0">
              <EventList
                refreshTrigger={refreshTrigger}
                onApplySuccess={handleEventCreated}
              />
            </main>

            {/* Right Sidebar - Recommendations (Sticky on desktop, 25%) */}
            <aside className="w-full lg:w-[25%] lg:min-w-[250px] lg:shrink-0">
              <div className="lg:sticky lg:top-6">
                <RecommendedJobsCard
                  jobs={recommendedJobs}
                  isLoading={isLoadingJobs}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
