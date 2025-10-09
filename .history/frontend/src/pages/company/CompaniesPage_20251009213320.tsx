import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import {
  CompanyList,
  CompanyFilters,
  CompanyPagination,
  CompanyCarousel,
} from "../../components/company";
import { useCompanyStore } from "../../store/company.store";

export default function CompaniesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  const { companies, isLoading, fetchCompanies } = useCompanyStore();

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, fetchCompanies]);

  const loadCompanies = async (page: number) => {
    setCurrentPage(page);
    await fetchCompanies(page);
  };

  const handleCompanyClick = (companyId: string) => {
    console.log("Company clicked:", companyId);
  };

  const featuredCompanies = companies.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
        {featuredCompanies.length > 0 && (
          <CompanyCarousel
            companies={featuredCompanies}
            onCompanyClick={handleCompanyClick}
            title="Featured Companies"
          />
        )}

        <CompanyFilters />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">Loading companies...</p>
            </div>
          </div>
        ) : (
          <>
            <CompanyList
              companies={companies}
              onCompanyClick={handleCompanyClick}
            />

            <CompanyPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={loadCompanies}
            />
          </>
        )}
      </div>
    </div>
  );
}
