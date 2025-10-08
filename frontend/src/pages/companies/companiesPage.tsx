import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { CompanyCarousel } from "@/components";

interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
  size: string;
  website: string;
  benefits: string[];
  experienceRequired: string;
  salaryRange: string;
}

type CompanyFilterState = {
  searchTerm: string;
  industryInput: string;
  locationInput: string;
  selectedSize: string;
  sortBy: string;
};

const createDefaultCompanyFilters = (): CompanyFilterState => ({
  searchTerm: "",
  industryInput: "",
  locationInput: "",
  selectedSize: "",
  sortBy: "default",
});

// Mock data - sắp xếp ngược theo ID (công ty mới thêm hiện lên trước)
const mockCompanies: Company[] = [
  {
    id: 12,
    name: "Sendo",
    logo: "https://via.placeholder.com/80x80?text=SENDO",
    industry: "Thương mại điện tử",
    location: "TP. Hồ Chí Minh",
    description:
      "Sàn thương mại điện tử C2C hàng đầu Việt Nam, kết nối người mua và người bán trực tiếp.",
    rating: 4.0,
    reviewCount: 250,
    size: "100-500 nhân viên",
    website: "sendo.vn",
    benefits: ["Bảo hiểm y tế", "Du lịch hàng năm", "Học tập và phát triển"],
    experienceRequired: "1-3 năm",
    salaryRange: "15-25 triệu",
  },
  {
    id: 11,
    name: "VNPAY",
    logo: "https://via.placeholder.com/80x80?text=VNPAY",
    industry: "Fintech",
    location: "Hà Nội",
    description:
      "Công ty công nghệ thanh toán hàng đầu Việt Nam, cung cấp các giải pháp thanh toán điện tử.",
    rating: 4.4,
    reviewCount: 380,
    size: "500-1000 nhân viên",
    website: "vnpay.vn",
    benefits: [
      "Lương tháng 13",
      "Bảo hiểm premium",
      "Gym miễn phí",
      "Stock options",
    ],
    experienceRequired: "2-5 năm",
    salaryRange: "20-40 triệu",
  },
  {
    id: 10,
    name: "Tiki Corporation",
    logo: "https://via.placeholder.com/80x80?text=TIKI",
    industry: "Thương mại điện tử",
    location: "TP. Hồ Chí Minh",
    description:
      "Nền tảng thương mại điện tử và dịch vụ giao hàng nhanh hàng đầu Việt Nam.",
    rating: 4.2,
    reviewCount: 320,
    size: "500-1000 nhân viên",
    website: "tiki.vn",
    benefits: ["Flexible working", "Learning budget", "Health insurance"],
    experienceRequired: "1-4 năm",
    salaryRange: "18-35 triệu",
  },
  {
    id: 9,
    name: "Momo",
    logo: "https://via.placeholder.com/80x80?text=MOMO",
    industry: "Fintech",
    location: "TP. Hồ Chí Minh",
    description:
      "Ví điện tử và nền tảng thanh toán di động hàng đầu Việt Nam với hơn 30 triệu người dùng.",
    rating: 4.5,
    reviewCount: 450,
    size: "100-500 nhân viên",
    website: "momo.vn",
    benefits: [
      "Startup equity",
      "Free meals",
      "Flexible hours",
      "Tech allowance",
    ],
    experienceRequired: "1-5 năm",
    salaryRange: "20-45 triệu",
  },
  {
    id: 8,
    name: "Techcombank",
    logo: "https://via.placeholder.com/80x80?text=TCB",
    industry: "Ngân hàng",
    location: "Hà Nội",
    description:
      "Ngân hàng số hàng đầu Việt Nam với các sản phẩm dịch vụ ngân hàng hiện đại và tiện ích.",
    rating: 4.6,
    reviewCount: 720,
    size: "500-1000 nhân viên",
    website: "techcombank.com",
    benefits: ["Lương cạnh tranh", "Bonus cao", "Đào tạo quốc tế"],
    experienceRequired: "3-7 năm",
    salaryRange: "25-60 triệu",
  },
  {
    id: 7,
    name: "BIDV",
    logo: "https://via.placeholder.com/80x80?text=BIDV",
    industry: "Ngân hàng",
    location: "Hà Nội",
    description:
      "Ngân hàng Đầu tư và Phát triển Việt Nam - một trong những ngân hàng lớn nhất Việt Nam.",
    rating: 4.0,
    reviewCount: 580,
    size: "1000+ nhân viên",
    website: "bidv.com.vn",
    benefits: ["Ổn định lâu dài", "Bảo hiểm toàn diện", "Nghỉ phép nhiều"],
    experienceRequired: "2-10 năm",
    salaryRange: "15-50 triệu",
  },
  {
    id: 6,
    name: "Grab Vietnam",
    logo: "https://via.placeholder.com/80x80?text=GRAB",
    industry: "Giao thông vận tải",
    location: "TP. Hồ Chí Minh",
    description:
      "Ứng dụng siêu đa năng cung cấp dịch vụ di chuyển, giao hàng và thanh toán số tại Đông Nam Á.",
    rating: 4.1,
    reviewCount: 420,
    size: "500-1000 nhân viên",
    website: "grab.careers",
    benefits: [
      "Free Grab rides",
      "International exposure",
      "Mental health support",
    ],
    experienceRequired: "2-6 năm",
    salaryRange: "25-55 triệu",
  },
  {
    id: 5,
    name: "Shopee Vietnam",
    logo: "https://via.placeholder.com/80x80?text=SPE",
    industry: "Thương mại điện tử",
    location: "TP. Hồ Chí Minh",
    description:
      "Nền tảng thương mại điện tử và công nghệ hàng đầu Đông Nam Á, thuộc Sea Group.",
    rating: 4.4,
    reviewCount: 780,
    size: "500-1000 nhân viên",
    website: "careers.shopee.vn",
    benefits: [
      "Competitive salary",
      "Stock options",
      "MacBook Pro",
      "Free snacks",
    ],
    experienceRequired: "1-5 năm",
    salaryRange: "18-50 triệu",
  },
  {
    id: 4,
    name: "Vingroup",
    logo: "https://via.placeholder.com/80x80?text=VIN",
    industry: "Đa ngành",
    location: "Hà Nội",
    description:
      "Tập đoàn kinh tế tư nhân đa ngành lớn nhất Việt Nam hoạt động trong bất động sản, công nghiệp, nông nghiệp.",
    rating: 4.3,
    reviewCount: 2100,
    size: "1000+ nhân viên",
    website: "vingroup.net",
    benefits: [
      "Cơ hội thăng tiến",
      "Đào tạo chuyên nghiệp",
      "Môi trường quốc tế",
    ],
    experienceRequired: "3-8 năm",
    salaryRange: "20-70 triệu",
  },
  {
    id: 3,
    name: "Vietcombank",
    logo: "https://via.placeholder.com/80x80?text=VCB",
    industry: "Ngân hàng",
    location: "Hà Nội",
    description:
      "Ngân hàng thương mại cổ phần hàng đầu Việt Nam với mạng lưới chi nhánh rộng khắp cả nước.",
    rating: 4.2,
    reviewCount: 650,
    size: "500-1000 nhân viên",
    website: "vietcombank.com.vn",
    benefits: ["Lương ổn định", "Thưởng theo hiệu quả", "Bảo hiểm full"],
    experienceRequired: "1-8 năm",
    salaryRange: "12-45 triệu",
  },
  {
    id: 2,
    name: "VNG Corporation",
    logo: "https://via.placeholder.com/80x80?text=VNG",
    industry: "Công nghệ thông tin",
    location: "TP. Hồ Chí Minh",
    description:
      "Tập đoàn công nghệ tiên phong tại Việt Nam, nổi tiếng với Zalo, ZaloPay và các sản phẩm game.",
    rating: 4.7,
    reviewCount: 890,
    size: "1000+ nhân viên",
    website: "vng.com.vn",
    benefits: [
      "Top salary",
      "13th month salary",
      "Premium healthcare",
      "Flexible time",
    ],
    experienceRequired: "2-8 năm",
    salaryRange: "25-80 triệu",
  },
  {
    id: 1,
    name: "FPT Software",
    logo: "https://via.placeholder.com/80x80?text=FPT",
    industry: "Công nghệ thông tin",
    location: "Hà Nội",
    description:
      "Công ty phần mềm hàng đầu Việt Nam chuyên về outsourcing và phát triển ứng dụng công nghệ cao.",
    rating: 4.5,
    reviewCount: 1250,
    size: "1000+ nhân viên",
    website: "fptsoftware.com",
    benefits: [
      "Lương cạnh tranh",
      "Đào tạo liên tục",
      "Cơ hội overseas",
      "Bảo hiểm FPTCare",
    ],
    experienceRequired: "1-10 năm",
    salaryRange: "15-60 triệu",
  },
];

const COMPANIES_PER_PAGE = 10;

export default function CompaniesPage() {
  const [companies] = useState<Company[]>(mockCompanies);
  const [filteredCompanies, setFilteredCompanies] =
    useState<Company[]>(mockCompanies);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states - cải thiện với input tự do
  const [industryInput, setIndustryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [appliedFilters, setAppliedFilters] = useState<CompanyFilterState>(() =>
    createDefaultCompanyFilters()
  );

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      industryInput,
      locationInput,
      selectedSize,
      sortBy,
    });
  };

  const handleClearFilters = () => {
    const defaults = createDefaultCompanyFilters();
    setSearchTerm("");
    setIndustryInput("");
    setLocationInput("");
    setSelectedSize("");
    setSortBy(defaults.sortBy);
    setAppliedFilters(defaults);
  };

  // Get unique values for filter options
  const industries = Array.from(new Set(companies.map((c) => c.industry)));
  const locations = Array.from(new Set(companies.map((c) => c.location)));
  const companySizes = Array.from(new Set(companies.map((c) => c.size)));

  // Filter and sort companies
  useEffect(() => {
    const {
      searchTerm: appliedSearchTerm,
      industryInput: appliedIndustry,
      locationInput: appliedLocation,
      selectedSize: appliedSize,
      sortBy: appliedSort,
    } = appliedFilters;

    let filtered = [...companies];

    if (appliedSearchTerm) {
      const loweredSearch = appliedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(loweredSearch) ||
          company.description.toLowerCase().includes(loweredSearch)
      );
    }

    if (appliedIndustry) {
      const loweredIndustry = appliedIndustry.toLowerCase();
      filtered = filtered.filter((company) =>
        company.industry.toLowerCase().includes(loweredIndustry)
      );
    }

    if (appliedLocation) {
      const loweredLocation = appliedLocation.toLowerCase();
      filtered = filtered.filter((company) =>
        company.location.toLowerCase().includes(loweredLocation)
      );
    }

    if (appliedSize) {
      filtered = filtered.filter((company) => company.size === appliedSize);
    }

    if (appliedSort === "name-asc") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (appliedSort === "name-desc") {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (appliedSort === "rating-high") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    } else if (appliedSort === "rating-low") {
      filtered = filtered.sort((a, b) => a.rating - b.rating);
    } else if (appliedSort === "newest") {
      filtered = filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  }, [companies, appliedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);
  const startIndex = (currentPage - 1) * COMPANIES_PER_PAGE;
  const endIndex = startIndex + COMPANIES_PER_PAGE;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  const handleCompanyClick = (companyId: number) => {
    // Tạm thời log, sau này sẽ navigate đến trang chi tiết
    console.log(`Clicked company ID: ${companyId}`);
    // TODO: Implement navigation to company detail page
    // navigate(`/companies/${companyId}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Featured Companies Carousel */}
      <CompanyCarousel companies={companies} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Danh sách công ty
            </h1>
            <p className="text-gray-600 text-base">
              Khám phá các công ty hàng đầu và tìm kiếm cơ hội nghề nghiệp phù
              hợp
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search - Ô tìm kiếm lớn hơn */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  placeholder="Tên công ty, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Industry Filter - Input với datalist */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Ngành nghề
                </label>
                <input
                  type="text"
                  placeholder="Nhập hoặc chọn ngành..."
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  list="industries"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <datalist id="industries">
                  <option value="" />
                  {industries.map((industry) => (
                    <option key={industry} value={industry} />
                  ))}
                </datalist>
              </div>

              {/* Location Filter - Input với datalist */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  placeholder="Nhập hoặc chọn địa điểm..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  list="locations"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <datalist id="locations">
                  <option value="" />
                  {locations.map((location) => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
              </div>

              {/* Company Size Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Quy mô công ty
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Tất cả quy mô</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="default">Mặc định (mới nhất)</option>
                  <option value="newest">Công ty mới thêm</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="rating-high">Đánh giá cao → thấp</option>
                  <option value="rating-low">Đánh giá thấp → cao</option>
                </select>
              </div>
            </div>

            {/* Search & Clear Buttons */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                🔍 Tìm kiếm
              </Button>
              <Button
                onClick={handleClearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-xs transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                🗑️ Xóa bộ lọc
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Hiển thị {startIndex + 1}-
              {Math.min(endIndex, filteredCompanies.length)} trong tổng số{" "}
              {filteredCompanies.length} công ty
            </p>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(company.rating)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {company.industry}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {company.location}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {company.description}
                    </p>

                    {/* Benefits và Experience/Salary Info */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {company.benefits.slice(0, 3).map((benefit, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                        {company.benefits.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{company.benefits.length - 3} khác
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          💼 {company.experienceRequired}
                        </span>
                        <span className="flex items-center">
                          💰 {company.salaryRange}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{company.size}</span>
                      <span className="flex items-center">
                        <span className="text-yellow-500 font-medium">
                          {company.rating}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{company.reviewCount} đánh giá</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - dùng shadcn/ui pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                        }
                      }}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-semibold",
                        currentPage === 1
                          ? "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
                          : "border-blue-500 bg-white text-blue-600 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:scale-105"
                      )}
                      aria-disabled={currentPage === 1}
                      tabIndex={currentPage === 1 ? -1 : undefined}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Trước</span>
                    </PaginationPrevious>
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className={`
                    cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110 border-2 border-blue-600"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md hover:scale-105"
                    }
                    `}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          );
                        }
                      }}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-semibold",
                        currentPage === totalPages
                          ? "pointer-events-none border-gray-200 bg-gray-100 text-gray-400"
                          : "border-blue-500 bg-white text-blue-600 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:scale-105"
                      )}
                      aria-disabled={currentPage === totalPages}
                      tabIndex={currentPage === totalPages ? -1 : undefined}
                    >
                      <span className="hidden sm:inline">Sau</span>
                      <ChevronRight className="h-4 w-4" />
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* No Results */}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14-4H5m14-4H5m14-4H5"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Không tìm thấy công ty nào
              </h3>
              <p className="text-gray-500 text-sm">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
