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

interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
  size: string;
  website: string;
  benefits: string[];
  experienceRequired: string;
  salaryRange: string;
}

interface CompanyCarouselProps {
  companies: Company[];
  title?: string;
}

const CompanyCarousel: React.FC<CompanyCarouselProps> = ({
  companies,
  title = "Công ty nổi bật",
}) => {
  const autoplay = React.useRef(
    Autoplay({
      delay: 1500,
      stopOnInteraction: false,
      playOnInit: true,
    })
  );
  // Chỉ lấy 8-10 công ty nổi bật nhất (rating cao, review nhiều)
  const featuredCompanies = companies
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 10);

  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 py-8 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {featuredCompanies.length} công ty
            </span>
          </div>
        </div>

        <Carousel
          opts={{ align: "start", loop: true, slidesToScroll: 1 }}
          plugins={[autoplay.current]}
          className="relative"
        >
          <CarouselContent>
            {featuredCompanies.map((company) => (
              <CarouselItem
                key={company.id}
                className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="h-full">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-200 p-6 h-full flex flex-col">
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
                          {company.name}
                        </h3>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(company.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm font-medium text-gray-600">
                            {company.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {company.reviewCount} đánh giá
                        </span>
                      </div>

                      <div className="space-y-3">
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="truncate">{company.industry}</span>
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{company.location}</span>
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
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                          <span className="truncate">{company.size}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {company.benefits.slice(0, 2).map((benefit) => (
                          <span
                            key={benefit}
                            className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
                          >
                            {benefit}
                          </span>
                        ))}
                        {company.benefits.length > 2 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            +{company.benefits.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs font-medium text-green-600">
                        {company.salaryRange}
                      </span>
                      <Button>Xem thêm</Button>
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

export default CompanyCarousel;
