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

interface Job {
  id: number;
  title: string;
  company: {
    name: string;
    logo: string;
  };
  location: string;
  type: string;
  level: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  industry: string;
  skills: string[];
  isUrgent: boolean;
  isRemote: boolean;
}

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
                <div className="h-full">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {job.company.name}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                      {job.isUrgent && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                          Gấp
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 leading-tight">
                      {job.title}
                    </h4>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span className="font-medium text-green-600">
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                          />
                        </svg>
                        <span>{job.level}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {job.postedDate}
                      </span>
                      <Button size="sm">Ứng tuyển</Button>
                    </div>
                  </div>
                </div>
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
