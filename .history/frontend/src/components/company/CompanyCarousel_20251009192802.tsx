import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import CompanyCard from './CompanyCard';
import type { CompanySummary } from '../../types/company';

interface CompanyCarouselProps {
  companies: CompanySummary[];
  onCompanyClick?: (companyId: string) => void;
  title?: string;
}

export default function CompanyCarousel({
  companies,
  onCompanyClick,
  title = 'Công ty nổi bật',
}: CompanyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, companies.length - itemsPerView);

  // Auto-play functionality with smooth infinite loop
  useEffect(() => {
    if (isAutoPlay && companies.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          // Always move forward, loop back to 0 when reaching the end
          return (prevIndex + 1) % Math.max(1, companies.length - itemsPerView + 1);
        });
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, companies.length, itemsPerView]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (companies.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Không có công ty nào để hiển thị</p>
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
            {/* Auto-play toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="p-2"
            >
              {isAutoPlay ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            {/* Navigation buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView + (itemsPerView > 1 ? 1 : 0))}%)`,
            }}
          >
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex-shrink-0"
                style={{ 
                  width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 16) / itemsPerView}px)` 
                }}
              >
                <CompanyCard 
                  company={company} 
                  onClick={() => onCompanyClick?.(company.id)} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {isAutoPlay && maxIndex > 0 && (
          <div className="mt-4">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-[2000ms] ease-linear"
                style={{
                  width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
