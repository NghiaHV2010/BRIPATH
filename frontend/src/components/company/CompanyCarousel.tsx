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
  // isFixed prop not used for simplicity and consistency with JobCarousel's display approach
}

export default function CompanyCarousel({
  companies,
  onCompanyClick,
  title = "Công ty nổi bật",
}: CompanyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3); // Thay đổi mặc định thành 3
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Giới hạn số lượng công ty hiển thị trong carousel (ví dụ: 12 công ty, tức 4 slide)
  const displayCompanies = companies.slice(0, 12);

  // Cập nhật số lượng item/slide dựa trên kích thước màn hình
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        // Trên màn hình lớn (>= 1024px), hiển thị tối đa 3 cột
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Chức năng tự động chuyển slide (4 giây)
  useEffect(() => {
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(
            0,
            Math.ceil(displayCompanies.length / itemsPerView) - 1
          );
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 4000);
    };

    // Chỉ bắt đầu tự động chuyển nếu có nhiều hơn 1 slide
    if (displayCompanies.length > itemsPerView) {
      startAutoSlide();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayCompanies.length, itemsPerView]);

  // Tạm dừng tự động chuyển slide khi di chuột vào
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (displayCompanies.length <= itemsPerView) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(
          0,
          Math.ceil(displayCompanies.length / itemsPerView) - 1
        );
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 4000);
  };

  const nextSlide = () => {
    const maxIndex = Math.max(
      0,
      Math.ceil(displayCompanies.length / itemsPerView) - 1
    );
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(
      0,
      Math.ceil(displayCompanies.length / itemsPerView) - 1
    );
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  if (!displayCompanies || displayCompanies.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(displayCompanies.length / itemsPerView);

  return (
    <div className="mb-12">
      {/* HEADER: Tiêu đề (và loại bỏ nút điều hướng khỏi đây) */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {/* LƯU Ý: Loại bỏ phần nút điều hướng cũ ở đây */}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div
            // THAY ĐỔI: Thêm relative để các nút absolute căn chỉnh theo div này
            className="relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Nút Điều hướng MỚI: Đặt tuyệt đối bên trong container tương đối */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  className="h-8 w-8 p-0 rounded-full text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  className="h-8 w-8 p-0 rounded-full text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </div>
            )}

            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {/* Render mỗi slide */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  {/* Grid hiển thị 1, 2, hoặc 3 cột */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayCompanies
                      .slice(
                        slideIndex * itemsPerView,
                        (slideIndex + 1) * itemsPerView
                      )
                      .map((company) => (
                        <div key={company.id} className="h-full">
                          <CompanyCard
                            company={company}
                            onClick={() => onCompanyClick?.(company.id)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chấm phân trang - Căn giữa */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-blue-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
