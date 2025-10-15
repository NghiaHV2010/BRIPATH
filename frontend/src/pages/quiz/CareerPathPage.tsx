import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, BookOpen, Target } from "lucide-react";
import { Layout, type CareerPathResponse } from "@/index";
import { CareerPathTimeline } from "@/components/quiz/CareerPathTimeline";

const CareerPathPage = () => {
  const location = useLocation();
  const careerPathData = location.state?.careerPath as
    | CareerPathResponse
    | undefined;
  const isLoading = location.state?.isLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6 space-y-12">
          {/* Header Skeleton */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="space-y-3">
              <Skeleton className="h-14 w-3/4 mx-auto" />
              <Skeleton className="h-5 w-full max-w-3xl mx-auto" />
              <Skeleton className="h-5 w-5/6 max-w-3xl mx-auto" />
            </div>
            <div className="flex items-center justify-center gap-6">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-24 w-full max-w-3xl mx-auto" />
          </div>

          {/* Timeline Skeleton */}
          <div className="relative space-y-16">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            {[1, 2, 3, 4, 5].map((i) => {
              const isLeft = i % 2 === 1;
              return (
                <div
                  key={i}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Step number dot */}
                  <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-4 border-background">
                      <Skeleton className="w-4 h-4 rounded-full" />
                    </div>
                  </div>

                  {/* Card skeleton */}
                  <div
                    className={`grid grid-cols-2 gap-8 ${
                      isLeft ? "" : "grid-flow-dense"
                    }`}
                  >
                    <div className={isLeft ? "" : "col-start-2"}>
                      <div className="p-6 rounded-lg border border-border bg-card space-y-4">
                        <Skeleton className="h-7 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                        <div className="pt-3 border-t space-y-2">
                          <Skeleton className="h-3 w-1/3" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </div>
                    <div className={isLeft ? "col-start-2" : ""} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  if (!careerPathData || !careerPathData.success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải lộ trình sự nghiệp. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <CareerPathTimeline careerPath={careerPathData.data} />;
};

export default CareerPathPage;
