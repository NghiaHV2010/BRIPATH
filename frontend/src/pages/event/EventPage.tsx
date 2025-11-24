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
        setRecommendedJobs(jobsResponse.data || []);
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
        <div className="w-full max-w-[2000px] mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar - Create Event (Sticky) */}
            <aside className="w-full lg:w-[20%] lg:min-w-[260px] xl:min-w-[300px] lg:shrink-0">
              <div className="sticky top-20 space-y-6">
                <CreateEventDialog onEventCreated={handleEventCreated} />

                {/* Info Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Gợi ý hữu ích
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Cung cấp mô tả chi tiết để thu hút nhiều người tham gia
                        hơn
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Hình ảnh chất lượng cao giúp sự kiện nổi bật
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Đăng sớm để có thời gian quảng bá tốt nhất
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Event Cards (Bóp lại, padding hợp lý) */}
            <main className="w-full lg:w-[55%] lg:flex-1 lg:min-w-0 px-2 sm:px-4">
              <EventList
                refreshTrigger={refreshTrigger}
                onApplySuccess={handleEventCreated}
              />
            </main>

            {/* Right Sidebar - Recommendations (Không sticky) */}
            <aside className="w-full lg:w-[25%] lg:min-w-[300px] xl:min-w-[350px] lg:shrink-0">
              <RecommendedJobsCard
                jobs={recommendedJobs}
                isLoading={isLoadingJobs}
              />
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
