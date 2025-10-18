import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/job";
import { JobCard } from "../job";


interface JobCarouselProps {
  jobs: Job[];
  title?: string;
}

const JobCarousel: React.FC<JobCarouselProps> = ({
  jobs,
  title = "Việc làm nổi bật",
}) => {
  const autoplay = React.useRef(
    Autoplay({
      delay: 1500,
      stopOnInteraction: true,
      playOnInit: true,
    })
  );

  // Chỉ lấy 6-8 jobs nổi bật nhất (có thể urgent hoặc mới nhất)
  const featuredJobs = jobs.slice(0, 8);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-8 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              {featuredJobs.length} việc làm
            </span>
          </div>
        </div>

        <Carousel
          opts={{ align: "start", loop: true, slidesToScroll: 1 }}
          plugins={[autoplay.current]}
          className="relative"
        >
          <CarouselContent>
            {featuredJobs.map((job) => (
              <CarouselItem
                key={job.id}
                className="flex-none basis-full pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <JobCard job={job} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6" />
          <CarouselNext className="-right-6" />
        </Carousel>
      </div>
    </div>
  );
};

export default JobCarousel;
