import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import CompanyCard from "./CompanyCard";
import type { CompanySummary } from "../../types/company";

interface CompanyCarouselProps {
  companies: CompanySummary[];
  onCompanyClick?: (companyId: string) => void;
  title?: string;
  isFixed?: boolean; // Giữ nguyên company list khi thay đổi trang
}

export default function CompanyCarousel({
  companies,
  onCompanyClick,
  title = "Công ty nổi bật",
  isFixed = false,
}: CompanyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [fixedCompanies, setFixedCompanies] = useState<CompanySummary[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use fixed companies or current companies
  const displayCompanies =
    isFixed && fixedCompanies.length > 0 ? fixedCompanies : companies;

  // Store first 8 companies when isFixed is true
  useEffect(() => {
    if (isFixed && companies.length > 0 && fixedCompanies.length === 0) {
      setFixedCompanies(companies.slice(0, 8));
    }
  }, [companies, isFixed, fixedCompanies.length]);ssssss

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto-play functionality with true infinite loop
  useEffect(() => {
    if (displayCompanies.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayCompanies.length]);

  // Reset position when reaching end to create infinite effect
  useEffect(() => {
    if (
      currentIndex >= displayCompanies.length &&
      displayCompanies.length > 0
    ) {
      const timer = setTimeout(() => {
        setCurrentIndex(0);
      }, 500); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayCompanies.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (companies.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Chưa có công ty nào để hiển thị</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {/* Navigation buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${
                (currentIndex % displayCompanies.length) * (100 / itemsPerView)
              }%)`,
            }}
          >
            {/* Render companies multiple times for infinite effect */}
            {Array.from({ length: 3 }).map((_, setIndex) =>
              displayCompanies.map((company, companyIndex) => (
                <div
                  key={`${company.id}-set-${setIndex}-${companyIndex}`}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${
                      ((itemsPerView - 1) * 16) / itemsPerView
                    }px)`,
                  }}
                >
                  <CompanyCard
                    company={company}
                    onClick={() => onCompanyClick?.(company.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Dots */}
        {displayCompanies.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {displayCompanies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex % displayCompanies.length
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 w-2 hover:bg-gray-400"
                }`}
                aria-label={`Chuyển đến slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
