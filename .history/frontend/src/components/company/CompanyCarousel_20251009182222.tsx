import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanySummary } from "@/types/company";

interface CompanyCarouselProps {
  companies: CompanySummary[];
  isLoading?: boolean;
  onCompanyClick?: (companyId: string) => void;
}

export function CompanyCarousel({ companies, isLoading = false, onCompanyClick }: CompanyCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to update navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [companies]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const handleCompanyClick = (companyId: string) => {
    onCompanyClick?.(companyId);
  };

  const getCompanyName = (company: CompanySummary) => {
    return company.users?.username || "Company";
  };

  const getCompanyType = (type: string) => {
    switch (type) {
      case "business":
        return "Doanh nghiệp";
      case "business_household":
        return "Hộ kinh doanh";
      default:
        return type;
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Công ty nổi bật</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="min-w-80 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Công ty nổi bật</h2>
        </div>
        <Card className="p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không có công ty nào được tìm thấy</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Công ty nổi bật</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {companies.map((company) => (
          <Card 
            key={company.id}
            className="min-w-80 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 border-gray-200 hover:border-blue-300 flex-shrink-0"
            onClick={() => handleCompanyClick(company.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Company Avatar */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  {company.users?.avatar_url ? (
                    <img 
                      src={company.users.avatar_url} 
                      alt={getCompanyName(company)}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-700 font-semibold text-sm">
                      {getCompanyInitials(getCompanyName(company))}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Company Name */}
                  <h3 className="font-semibold text-gray-900 text-lg truncate mb-1">
                    {getCompanyName(company)}
                  </h3>

                  {/* Company Type */}
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 mb-2">
                    {getCompanyType(company.company_type)}
                  </Badge>

                  {/* Location and Job Count */}
                  <div className="space-y-1 text-sm text-gray-600">
                    {company.users?.address_city && (
                      <div className="truncate">
                        📍 {company.users.address_city}
                      </div>
                    )}
                    <div>
                      💼 {company._count?.jobs || 0} việc làm
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-blue-600 font-medium">
                  Xem chi tiết →
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
}