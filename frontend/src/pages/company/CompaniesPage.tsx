import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [filterPage, setFilterPage] = useState(1);

  const {
    companies,
    filteredCompanies,
    isLoading,
    totalPages,
    fetchCompanies,
    clearFilteredCompanies,
  } = useCompanyStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, fetchCompanies]);

  // Handle external navigation detection
  useEffect(() => {
    const isExternalNavigation =
      !sessionStorage.getItem("companyScrollPosition") &&
      !sessionStorage.getItem("companyPage") &&
      !sessionStorage.getItem("companyFilterState");

    if (isExternalNavigation) {
      sessionStorage.removeItem("companyScrollPosition");
      sessionStorage.removeItem("companyPage");
      sessionStorage.removeItem("companyFilterState");

      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
  }, [location.pathname, currentPage]);

  // Clear filtered search results when entering or leaving CompaniesPage
  useEffect(() => {
    clearFilteredCompanies();
    return () => {
      clearFilteredCompanies();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore states when returning from company detail
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanies = async (page: number) => {
    setCurrentPage(page);
    sessionStorage.setItem("companyPage", page.toString());
    await fetchCompanies(page);
  };

  const handleCompanyClick = (companyId: string) => {
    sessionStorage.setItem("companyScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("companyPage", currentPage.toString());
    navigate(`/companies/${companyId}`);
  };

  const companiesPerFilterPage = 8;
  const totalFilterPages = Math.ceil(
    filteredCompanies.length / companiesPerFilterPage
  );
  const paginatedFilteredCompanies = filteredCompanies.slice(
    (filterPage - 1) * companiesPerFilterPage,
    filterPage * companiesPerFilterPage
  );

  const handleResetFilter = async () => {
    clearFilteredCompanies();
    setFilterPage(1);
  };

  return (
    <Layout className="bg-linear-to-br from-slate-50 to-slate-100">
      {/* Filters */}
      <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white py-16 px-4 mb-8">
        <div className="max-w-[1500px] mx-auto flex justify-center">
          <CompanyFilters />
        </div>
      </div>

      {/* Filtered Companies */}
      {filteredCompanies.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-slate-800 text-xl font-bold">
                Tìm thấy {filteredCompanies.length} công ty phù hợp
              </h2>
              <button
                onClick={handleResetFilter}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                Xóa bộ lọc
              </button>
            </div>
            <CompanyList
              companies={paginatedFilteredCompanies}
              onCompanyClick={handleCompanyClick}
            />

            <CompanyPagination
              currentPage={filterPage}
              totalPages={totalFilterPages}
              onPageChange={setFilterPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Carousel */}
      {companies.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-[95%] max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
          <CompanyCarousel
            companies={companies}
            onCompanyClick={handleCompanyClick}
            title="Công ty nổi bật"
          />
        </div>
      )}
      {/* END THAY ĐỔI */}

      <div className="max-w-full mx-auto px-4 py-18 bg-linear-to-b from-white via-blue-100 to-blue-200 transform transition-transform duration-500  ">
        <div className="grid grid-cols-1 justify-items-center">
          <img
            src="/src/assets/banner/4.jpg"
            alt="Company banner"
            className="max-w-2xl aspect-square rounded-xl object-cover"
          />
        </div>
      </div>
      {/* Khối này giữ lại cho Company List bên dưới */}
      <div className="w-full mx-auto px-4 py-12 bg-linear-to-b from-blue-100  to-white ">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 ">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">Loading companies...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-8">
              <div className="max-w-[1700px] mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-6">
                  Các công ty đang liên kết với{" "}
                  <span className="text-blue-600">BriPath</span>
                </h2>

                <CompanyList onCompanyClick={handleCompanyClick} />

                <CompanyPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={loadCompanies}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
