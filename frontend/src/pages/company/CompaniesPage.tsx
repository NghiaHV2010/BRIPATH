import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2 } from "lucide-react";
import {
  CompanyList,
  CompanyFilters,
  CompanyPagination,
  CompanyCarousel,
} from "../../components/company";
import { useCompanyStore } from "../../store/company.store";
import { Layout } from "../../components/layout";

export default function CompaniesPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { companies, isLoading, totalPages, fetchCompanies } =
    useCompanyStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, fetchCompanies]);

  // Handle external navigation detection
  useEffect(() => {
    // Check if this is external navigation (from navbar, direct URL, etc.)
    const isExternalNavigation =
      !sessionStorage.getItem("companyScrollPosition") &&
      !sessionStorage.getItem("companyPage") &&
      !sessionStorage.getItem("companyFilterState");

    if (isExternalNavigation) {
      // Clear any leftover states and start fresh
      sessionStorage.removeItem("companyScrollPosition");
      sessionStorage.removeItem("companyPage");
      sessionStorage.removeItem("companyFilterState");

      // Reset to page 1
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
  }, [location.pathname, currentPage]);

  // Restore states when returning from company detail (run once on mount)
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("companyScrollPosition");
    const savedPage = sessionStorage.getItem("companyPage");

    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem("companyScrollPosition");
      }, 100);
    }

    if (savedPage) {
      const page = parseInt(savedPage);
      if (page !== currentPage) {
        setCurrentPage(page);
        // Don't call fetchCompanies here as it will be handled by the first useEffect
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const loadCompanies = async (page: number) => {
    setCurrentPage(page);
    // Save current page for navigation state
    sessionStorage.setItem("companyPage", page.toString());
    await fetchCompanies(page);
  };

  const handleCompanyClick = (companyId: string) => {
    // Save current scroll position and page before navigating
    sessionStorage.setItem("companyScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("companyPage", currentPage.toString());
    navigate(`/companies/${companyId}`);
  };

  const featuredCompanies = companies.slice(0, 6);

  return (
    <Layout className="bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Explore Companies</h1>
              <p className="text-blue-100 text-lg">
                Discover top companies and find your next opportunity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <CompanyFilters onCompanyClick={handleCompanyClick} />
        {featuredCompanies.length > 0 && (
          <CompanyCarousel
            companies={featuredCompanies}
            onCompanyClick={handleCompanyClick}
            title="Featured Companies"
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 ">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">Loading companies...</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">
              Các công ty đang liên kết với{" "}
              <span className="text-blue-600">BriPath</span>
            </h2>
            <CompanyList
              companies={companies}
              onCompanyClick={handleCompanyClick}
            />
            <CompanyPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={loadCompanies}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
