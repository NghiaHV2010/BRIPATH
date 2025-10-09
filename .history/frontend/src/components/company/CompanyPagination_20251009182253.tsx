import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCompanies: number;
  companiesPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function CompanyPagination({
  currentPage,
  totalPages,
  totalCompanies,
  companiesPerPage,
  onPageChange,
  isLoading = false
}: CompanyPaginationProps) {
  const startItem = (currentPage - 1) * companiesPerPage + 1;
  const endItem = Math.min(currentPage * companiesPerPage, totalCompanies);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage <= 4) {
      // Show 1, 2, 3, 4, 5, ..., last
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Show 1, ..., last-4, last-3, last-2, last-1, last
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show 1, ..., current-1, current, current+1, ..., last
      pages.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Results info */}
      <div className="text-sm text-gray-600">
        Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
        <span className="font-medium">{endItem}</span> trong tổng số{" "}
        <span className="font-medium">{totalCompanies}</span> công ty
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-1 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                disabled={isLoading}
                className={`w-8 h-8 p-0 ${
                  isCurrentPage 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "hover:bg-blue-50"
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center gap-1 px-3"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}