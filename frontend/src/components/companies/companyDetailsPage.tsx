import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

// Interface cho Company
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
  // Thêm fields mở rộng cho company details
  foundedYear?: number;
  employees?: string;
  culture?: string[];
  workingHours?: string;
  offices?: string[];
}

// Interface cho Job (để hiển thị jobs của company)
interface Job {
  id: number;
  title: string;
  company: {
    name: string;
    logo: string;
  };
  location: string;
  type: string;
  level: string;
  salary: string;
  description: string;
  postedDate: string;
  industry: string;
  skills: string[];
  isUrgent: boolean;
  isRemote: boolean;
}

// Mock data companies - mở rộng từ companiesPage
const mockCompanies: Company[] = [
  {
    id: 12,
    name: "Sendo",
    logo: "https://via.placeholder.com/80x80?text=SENDO",
    industry: "Thương mại điện tử",
    location: "TP. Hồ Chí Minh",
    description:
      "Sàn thương mại điện tử C2C hàng đầu Việt Nam, kết nối người mua và người bán trực tiếp. Sendo được thành lập với sứ mệnh democratize commerce - tạo cơ hội cho mọi người tham gia vào nền kinh tế số một cách dễ dàng nhất. Với hơn 700,000 nhà bán hàng và hàng triệu sản phẩm, Sendo đang là một trong những nền tảng thương mại điện tử phát triển nhanh nhất Việt Nam.",
    rating: 4.0,
    reviewCount: 250,
    size: "100-500 nhân viên",
    website: "sendo.vn",
    benefits: [
      "Bảo hiểm y tế cao cấp",
      "Du lịch hàng năm",
      "Học tập và phát triển",
      "Bonus theo performance",
      "Flexible working",
      "Free lunch",
    ],
    experienceRequired: "1-3 năm",
    salaryRange: "15-25 triệu",
    foundedYear: 2012,
    employees: "500+",
    culture: [
      "Innovation",
      "Customer First",
      "Teamwork",
      "Ownership",
      "Growth Mindset",
    ],
    workingHours: "8:30 - 17:30 (Thứ 2 - Thứ 6)",
    offices: ["TP. Hồ Chí Minh", "Hà Nội"],
  },
  {
    id: 11,
    name: "VNPAY",
    logo: "https://via.placeholder.com/80x80?text=VNPAY",
    industry: "Fintech",
    location: "Hà Nội",
    description:
      "VNPAY là công ty công nghệ thanh toán hàng đầu Việt Nam, cung cấp các giải pháp thanh toán điện tử toàn diện cho cá nhân và doanh nghiệp. Với hệ sinh thái thanh toán đa dạng, VNPAY phục vụ hàng triệu giao dịch mỗi ngày và được tin tưởng bởi hơn 60 ngân hàng trong nước. Chúng tôi đang tiến tới trở thành super app tài chính số đầu tiên tại Việt Nam.",
    rating: 4.4,
    reviewCount: 380,
    size: "500-1000 nhân viên",
    website: "vnpay.vn",
    benefits: [
      "Lương tháng 13",
      "Bảo hiểm premium",
      "Gym miễn phí",
      "Stock options",
      "Training ngành nghề",
      "Môi trường quốc tế",
    ],
    experienceRequired: "2-5 năm",
    salaryRange: "20-40 triệu",
    foundedYear: 2007,
    employees: "1000+",
    culture: [
      "Excellence",
      "Innovation",
      "Integrity",
      "Customer Focus",
      "Teamwork",
    ],
    workingHours: "8:00 - 17:00 (Thứ 2 - Thứ 6)",
    offices: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"],
  },
];

// Mock jobs của các companies
const mockCompanyJobs: Job[] = [
  {
    id: 15,
    title: "Senior Flutter Developer",
    company: {
      name: "Sendo",
      logo: "https://via.placeholder.com/80x80?text=SENDO",
    },
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    level: "Senior",
    salary: "25-35 triệu",
    description: "Phát triển ứng dụng mobile Flutter",
    postedDate: "2 giờ trước",
    industry: "Thương mại điện tử",
    skills: ["Flutter", "Dart"],
    isUrgent: true,
    isRemote: false,
  },
  {
    id: 16,
    title: "Backend Java Developer",
    company: {
      name: "Sendo",
      logo: "https://via.placeholder.com/80x80?text=SENDO",
    },
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    level: "Mid-level",
    salary: "20-28 triệu",
    description: "Phát triển API backend với Java Spring",
    postedDate: "1 ngày trước",
    industry: "Thương mại điện tử",
    skills: ["Java", "Spring Boot"],
    isUrgent: false,
    isRemote: false,
  },
  {
    id: 14,
    title: "DevOps Engineer",
    company: {
      name: "VNPAY",
      logo: "https://via.placeholder.com/80x80?text=VNPAY",
    },
    location: "Hà Nội",
    type: "Full-time",
    level: "Mid-level",
    salary: "20-30 triệu",
    description: "Quản lý hạ tầng cloud, CI/CD pipeline",
    postedDate: "4 giờ trước",
    industry: "Fintech",
    skills: ["AWS", "Docker"],
    isUrgent: false,
    isRemote: true,
  },
];

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  // State management
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [relatedCompanies, setRelatedCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);

        // Trong thực tế: await fetchCompanyById(companyId) hoặc fetchCompanyBySlug(companyId)
        // Giả sử companyId có thể là ID số hoặc slug
        let currentCompany = mockCompanies.find(
          (c) => c.id === Number(companyId)
        );

        // Nếu không tìm thấy theo ID, thử tìm theo slug (tên company)
        if (!currentCompany) {
          const companySlug = companyId?.toLowerCase().replace(/-/g, " ");
          currentCompany = mockCompanies.find(
            (c) => c.name.toLowerCase() === companySlug
          );
        }

        if (!currentCompany) {
          navigate("/companies");
          return;
        }

        setCompany(currentCompany);

        // Lấy jobs của company này
        const jobs = mockCompanyJobs.filter(
          (j) => j.company.name === currentCompany!.name
        );
        setCompanyJobs(jobs);

        // Lấy companies cùng ngành
        const related = mockCompanies
          .filter(
            (c) =>
              c.id !== currentCompany!.id &&
              c.industry === currentCompany!.industry
          )
          .slice(0, 3);
        setRelatedCompanies(related);
      } catch (error) {
        console.error("Error fetching company details:", error);
        navigate("/companies");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy công ty
          </h2>
          <Button onClick={() => navigate("/companies")}>
            Quay lại danh sách công ty
          </Button>
        </div>
      </div>
    );
  }

  // Render stars
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/companies")}
            className="flex items-center space-x-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Quay lại danh sách công ty</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start space-x-6 mb-6">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-24 h-24 rounded-xl object-cover border"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {company.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">
                    {company.industry}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(company.rating)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {company.rating}
                    </span>
                    <span className="text-gray-500">
                      ({company.reviewCount} đánh giá)
                    </span>
                  </div>

                  {/* Company Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      </svg>
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <span>{company.size}</span>
                    </div>
                    {company.foundedYear && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                        <span>Thành lập {company.foundedYear}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                        />
                      </svg>
                      <a
                        href={`https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Giới thiệu công ty
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </div>

            {/* Company Culture */}
            {company.culture && company.culture.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Văn hóa công ty
                </h2>
                <div className="flex flex-wrap gap-3">
                  {company.culture.map((value, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Phúc lợi nhân viên
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin làm việc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Giờ làm việc
                  </h4>
                  <p className="text-gray-600">
                    {company.workingHours || "8:00 - 17:00 (Thứ 2 - Thứ 6)"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mức lương</h4>
                  <p className="text-green-600 font-medium">
                    {company.salaryRange}
                  </p>
                </div>
                {company.offices && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Văn phòng
                    </h4>
                    <p className="text-gray-600">
                      {company.offices.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Follow Company */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <Button
                className={`w-full font-semibold py-3 text-lg mb-4 ${
                  isFollowing
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "✓ Đã theo dõi" : "+ Theo dõi công ty"}
              </Button>

              <div className="space-y-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>Việc làm đang tuyển:</span>
                  <span className="font-medium text-green-600">
                    {companyJobs.length} vị trí
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nhân viên:</span>
                  <span className="font-medium">
                    {company.employees || company.size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kinh nghiệm yêu cầu:</span>
                  <span className="font-medium">
                    {company.experienceRequired}
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  📤 Chia sẻ công ty
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Thống kê nhanh
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Đánh giá trung bình</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-yellow-500">
                      {company.rating}
                    </span>
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Số đánh giá</span>
                  <span className="font-medium">{company.reviewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngành nghề</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Jobs */}
        {companyJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Việc làm tại {company.name} ({companyJobs.length} vị trí)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companyJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-base line-clamp-2 flex-1">
                      {job.title}
                    </h4>
                    {job.isUrgent && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full ml-2">
                        Gấp
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-green-600 font-medium">{job.salary}</p>
                    <p className="text-gray-500 text-sm">
                      {job.location} • {job.type}
                    </p>
                    <p className="text-gray-500 text-sm">{job.level}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500">Đăng {job.postedDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Companies */}
        {relatedCompanies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Công ty khác trong ngành {company.industry}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCompanies.map((relatedCompany) => (
                <div
                  key={relatedCompany.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/companies/${relatedCompany.id}`)}
                >
                  <div className="text-center mb-4">
                    <img
                      src={relatedCompany.logo}
                      alt={relatedCompany.name}
                      className="w-16 h-16 rounded-full object-cover border mx-auto mb-3"
                    />
                    <h4 className="font-bold text-gray-900 line-clamp-2">
                      {relatedCompany.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {relatedCompany.industry}
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(relatedCompany.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm font-medium text-gray-600 ml-1">
                      {relatedCompany.rating}
                    </span>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>{relatedCompany.location}</p>
                    <p>{relatedCompany.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
