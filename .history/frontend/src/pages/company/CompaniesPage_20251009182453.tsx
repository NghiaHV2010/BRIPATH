import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyFilters, type CompanyFilterValues } from "@/components/company/CompanyFilters";
import { CompanyCarousel } from "@/components/company/CompanyCarousel";
import { CompanyList } from "@/components/company/CompanyList";
import { CompanyPagination } from "@/components/company/CompanyPagination";
import { useCompanyStore } from "@/store/company.store";
import { useAuthStore } from "@/store/auth";

const COMPANIES_PER_PAGE = 12;

export function CompaniesPage() {
  const navigate = useNavigate();
  
  // Store states
  const { 
    companies, 
    isLoading, 
    fetchCompanies, 
    filterCompanies 
  } = useCompanyStore();
  
  const { authUser } = useAuthStore();

  // Local states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [filters, setFilters] = useState<CompanyFilterValues>({
    name: "",
    location: "",
    field: ""
  });

  // Featured companies for carousel (first 6 companies)
  const featuredCompanies = companies.slice(0, 6);
  
  // Companies for main grid
  const mainCompanies = companies;

  // Load companies on mount and when page/filters change
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadCompanies = useCallback(async () => {
    try {
      const hasFilters = Object.values(filters).some(val => val.trim() !== "");
      
      if (hasFilters) {
        // Use filter API
        await filterCompanies(
          currentPage, 
          filters.name, 
          filters.location, 
          filters.field, 
          authUser?.id
        );
      } else {
        // Use regular fetch API
        await fetchCompanies(currentPage, authUser?.id);
      }
      
      // For now, we'll calculate pagination based on current companies length
      // In real app, you should modify store to return pagination info
      setTotalCompanies(companies.length);
      setTotalPages(Math.ceil(companies.length / COMPANIES_PER_PAGE));
      
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  }, [currentPage, filters, fetchCompanies, filterCompanies, authUser?.id, companies.length]);

  const handleFilterChange = (newFilters: CompanyFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val.trim() !== "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Khám phá các công ty
          </h1>
          <p className="text-gray-600">
            Tìm hiểu về các công ty hàng đầu và cơ hội nghề nghiệp tại đây
          </p>
        </div>

        {/* Filters */}
        <CompanyFilters 
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />

        {/* Featured Companies Carousel - Only show when no filters are active */}
        {!hasActiveFilters && featuredCompanies.length > 0 && (
          <CompanyCarousel 
            companies={featuredCompanies}
            isLoading={isLoading}
            onCompanyClick={handleCompanyClick}
          />
        )}

        {/* Results Summary */}
        {totalCompanies > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {hasActiveFilters ? "Kết quả tìm kiếm" : "Tất cả công ty"}
              </h2>
              <span className="text-sm text-gray-600">
                {totalCompanies} công ty
              </span>
            </div>
          </div>
        )}

        {/* Company Grid */}
        <CompanyList 
          companies={mainCompanies}
          isLoading={isLoading}
          onCompanyClick={handleCompanyClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <CompanyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCompanies={totalCompanies}
            companiesPerPage={COMPANIES_PER_PAGE}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-700">Đang tải...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}