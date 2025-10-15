import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import JobCard from "./JobCard";
import type { Job } from "../../types/job";

interface JobCarouselProps {
  jobs: Job[];
  onJobClick?: (jobId: string) => void;
  title?: string;
  isFixed?: boolean; // Giữ nguyên job list khi thay đổi trang
}

export default function JobCarousel({
  jobs,
  onJobClick,
  title = "Công việc nổi bật",
  isFixed = false,
}: JobCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [fixedJobs, setFixedJobs] = useState<Job[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use fixed jobs or current jobs - show 16 jobs (4x4)
  const displayJobs =
    isFixed && fixedJobs.length > 0 ? fixedJobs : jobs.slice(0, 16);

  // Store first 16 jobs when isFixed is true
  useEffect(() => {
    if (isFixed && jobs.length > 0 && fixedJobs.length === 0) {
      setFixedJobs(jobs.slice(0, 16));
    }
  }, [jobs, isFixed, fixedJobs.length]);

  // Update items per view based on screen size - always show 4 columns for jobs
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4); // 4 columns for desktop
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(
            0,
            Math.ceil(displayJobs.length / itemsPerView) - 1
          );
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 4000);
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayJobs.length, itemsPerView]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(
          0,
          Math.ceil(displayJobs.length / itemsPerView) - 1
        );
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 4000);
  };

  const nextSlide = () => {
    const maxIndex = Math.max(
      0,
      Math.ceil(displayJobs.length / itemsPerView) - 1
    );
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(
      0,
      Math.ceil(displayJobs.length / itemsPerView) - 1
    );
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  if (!displayJobs || displayJobs.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(displayJobs.length / itemsPerView);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

        {totalSlides > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600">
              {currentIndex + 1} / {totalSlides}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div
            className="relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayJobs
                      .slice(
                        slideIndex * itemsPerView,
                        (slideIndex + 1) * itemsPerView
                      )
                      .map((job) => (
                        <div key={job.id} className="h-full">
                          <JobCard
                            job={job}
                            onClick={() => onJobClick?.(job.id)}
                            compact={false}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-green-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
