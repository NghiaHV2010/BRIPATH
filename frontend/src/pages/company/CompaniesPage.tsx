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
import type { CompanySummary } from "../../types/company";

export default function CompaniesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPage, setFilterPage] = useState(1);
  const [allFilteredCompanies, setAllFilteredCompanies] = useState<
    CompanySummary[]
  >([]);
  const [currentFilterParams, setCurrentFilterParams] = useState({
    name: "",
    location: "",
    field: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    companies,
    filteredCompanies,
    isLoading,
    totalPages,
    fetchCompanies,
    clearFilteredCompanies,
    filterCompanies,
  } = useCompanyStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, fetchCompanies]);

  useEffect(() => {
    const isExternalNavigation =
      !sessionStorage.getItem("companyScrollPosition") &&
      !sessionStorage.getItem("companyPage") &&
      !sessionStorage.getItem("companyFilterState");

    if (isExternalNavigation && currentPage !== 1) {
      sessionStorage.removeItem("companyScrollPosition");
      sessionStorage.removeItem("companyPage");
      sessionStorage.removeItem("companyFilterState");
      setCurrentPage(1);
    }
  }, [location.pathname, currentPage]);

  useEffect(() => {
    return () => {
      if (!sessionStorage.getItem("filteredCompanies")) {
        clearFilteredCompanies();
        setAllFilteredCompanies([]);
        setHasSearched(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("companyScrollPosition");
    const savedPage = sessionStorage.getItem("companyPage");
    const savedFilteredCompanies = sessionStorage.getItem("filteredCompanies");
    const savedFilterPage = sessionStorage.getItem("filterPage");
    const savedFilterParams = sessionStorage.getItem("filterParams");

    if (savedFilteredCompanies && savedFilterPage && savedFilterParams) {
      try {
        setAllFilteredCompanies(JSON.parse(savedFilteredCompanies));
        setFilterPage(parseInt(savedFilterPage));
        setCurrentFilterParams(JSON.parse(savedFilterParams));
        setHasSearched(JSON.parse(savedFilteredCompanies).length > 0);

        sessionStorage.removeItem("filteredCompanies");
        sessionStorage.removeItem("filterPage");
        sessionStorage.removeItem("filterParams");
      } catch (err) {
        console.error("Error restoring filter state:", err);
      }
    }

    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem("companyScrollPosition");
      }, 100);
    }

    if (savedPage && parseInt(savedPage) !== currentPage) {
      setCurrentPage(parseInt(savedPage));
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

    if (allFilteredCompanies.length > 0) {
      sessionStorage.setItem(
        "filteredCompanies",
        JSON.stringify(allFilteredCompanies)
      );
      sessionStorage.setItem("filterPage", filterPage.toString());
      sessionStorage.setItem(
        "filterParams",
        JSON.stringify(currentFilterParams)
      );
    }

    navigate(`/companies/${companyId}`);
  };

  useEffect(() => {
    if (filteredCompanies.length > 0) {
      if (filterPage === 1) {
        setAllFilteredCompanies(filteredCompanies);
      } else {
        setAllFilteredCompanies(prev => [...prev, ...filteredCompanies]);
      }
    }
  }, [filteredCompanies, filterPage]);

  const hasMoreFilteredCompanies = filteredCompanies.length === 12;

  const handleFilterSearch = async (
    name: string,
    location: string,
    field: string
  ) => {
    setIsSearching(true);
    setFilterPage(1);
    setAllFilteredCompanies([]);
    setHasSearched(true);

    // Normalize location để search linh hoạt hơn
    const normalizedLocation = location
      ? location
          .replace(/^(TP\.|Tỉnh|Thành phố)\s*/gi, "") // Xóa "TP.", "Tỉnh", "Thành phố"
          .replace(/\s+/g, " ") // Loại bỏ khoảng trắng thừa
          .trim()
      : "";

    setCurrentFilterParams({ name, location: normalizedLocation, field });
    await filterCompanies(1, name, normalizedLocation, field);
    setIsSearching(false);
  };

  const handleLoadMore = async () => {
    const nextPage = filterPage + 1;
    setFilterPage(nextPage);
    await filterCompanies(
      nextPage,
      currentFilterParams.name,
      currentFilterParams.location,
      currentFilterParams.field
    );
  };

  const handleResetFilter = async () => {
    clearFilteredCompanies();
    setFilterPage(1);
    setAllFilteredCompanies([]);
    setCurrentFilterParams({ name: "", location: "", field: "" });
    setHasSearched(false);

    sessionStorage.removeItem("filteredCompanies");
    sessionStorage.removeItem("filterPage");
    sessionStorage.removeItem("filterParams");
    sessionStorage.removeItem("companyFilterState");
  };

  return (
    <Layout className="bg-linear-to-br from-slate-50 to-slate-100">
      {/* Filters */}
      <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white py-16 px-4 mb-8">
        <div className="max-w-[1500px] mx-auto flex justify-center">
          <CompanyFilters
            onSearch={handleFilterSearch}
            onReset={handleResetFilter}
          />
        </div>
      </div>{" "}
      {/* Search Loading State */}
      {isSearching && allFilteredCompanies.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Đang tìm kiếm...</p>
          </div>
        </div>
      )}
      {allFilteredCompanies.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <h2 className="text-slate-800 text-xl font-bold mb-4">
              Kết quả tìm kiếm
            </h2>
            <CompanyList
              companies={allFilteredCompanies}
              onCompanyClick={handleCompanyClick}
            />

            {hasMoreFilteredCompanies && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}

            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Tìm thấy {allFilteredCompanies.length} công ty phù hợp
              </p>
            </div>
          </div>
        </div>
      )}
      {hasSearched && allFilteredCompanies.length === 0 && !isSearching && (
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 md:px-10 mb-12">
          <div className="w-full max-w-[1700px] mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="w-16 h-16 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700">
                  Không tìm thấy công ty phù hợp
                </h3>
                <p className="text-sm text-slate-500">
                  Vui lòng thử lại với từ khóa hoặc bộ lọc khác
                </p>
                <button
                  onClick={handleResetFilter}
                  className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {companies.length > 0 && (
        <div className="relative left-1/2 right-1/2 w-[95%] max-w-[1700px] -translate-x-1/2 mb-12 mt-12">
          <CompanyCarousel
            companies={companies}
            onCompanyClick={handleCompanyClick}
            title="Công ty nổi bật"
          />
        </div>
      )}
      <div className="w-full mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 ">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 font-medium">Đang tải...</p>
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
