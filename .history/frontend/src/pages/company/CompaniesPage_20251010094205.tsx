import { usexport default function CompaniesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // Có thể get từ API response

  const { companies, isLoading, fetchCompanies } = useCompanyStore();

  // Debug component lifecycle
  useEffect(() => {
    console.log("🏗️ CompaniesPage mounted");
    return () => console.log("💥 CompaniesPage unmounted");
  }, []);ct, useState } from "react";
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
  const [totalPages] = useState(10); // Có thể get từ API response

  const { companies, isLoading, fetchCompanies } = useCompanyStore();

  // Load companies on initial mount only
  useEffect(() => {
    fetchCompanies(1); // ✅ Always start with page 1 on mount
  }, [fetchCompanies]);

  const loadCompanies = async (page: number) => {
    console.log("🔄 Pagination clicked - loading page:", page);
    setCurrentPage(page);
    await fetchCompanies(page); // ✅ Handle API call manually in pagination
    console.log("✅ Page loaded:", page);
  };

  const handleCompanyClick = (companyId: string) => {
    console.log("Company clicked:", companyId);
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
            />
          </>
        )}
      </div>
    </Layout>
  );
}
