// import { useState, useEffect } from "react";
// import { Button } from "../ui/button";
// import { JobCarousel } from "../ui";

// interface Job {
//   id: number;
//   title: string;
//   company: {
//     name: string;
//     logo: string;
//   };
//   location: string;
//   type: string; // Full-time, Part-time, Remote, Hybrid
//   level: string; // Junior, Mid, Senior, Lead
//   salary: string;
//   description: string;
//   requirements: string[];
//   benefits: string[];
//   postedDate: string;
//   industry: string;
//   skills: string[];
//   isUrgent: boolean;
//   isRemote: boolean;
// }

// type JobFilterState = {
//   searchTerm: string;
//   locationInput: string;
//   industryInput: string;
//   selectedType: string;
//   selectedLevel: string;
//   sortBy: string;
// };

// const createDefaultJobFilters = (): JobFilterState => ({
//   searchTerm: "",
//   locationInput: "",
//   industryInput: "",
//   selectedType: "",
//   selectedLevel: "",
//   sortBy: "default",
// });

// // Mock data - sắp xếp ngược theo ID (job mới đăng hiện lên trước)
// const mockJobs: Job[] = [
//   {
//     id: 15,
//     title: "Senior Flutter Developer",
//     company: {
//       name: "Sendo",
//       logo: "https://via.placeholder.com/80x80?text=SENDO",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Senior",
//     salary: "25-35 triệu",
//     description:
//       "Phát triển ứng dụng mobile Flutter cho nền tảng thương mại điện tử hàng đầu Việt Nam.",
//     requirements: [
//       "3+ năm kinh nghiệm Flutter",
//       "Dart, Provider/Bloc",
//       "RESTful APIs",
//     ],
//     benefits: ["Lương cạnh tranh", "Bảo hiểm y tế", "Du lịch hàng năm"],
//     postedDate: "2 giờ trước",
//     industry: "Thương mại điện tử",
//     skills: ["Flutter", "Dart", "Provider", "REST API"],
//     isUrgent: true,
//     isRemote: false,
//   },
//   {
//     id: 14,
//     title: "DevOps Engineer",
//     company: {
//       name: "VNPAY",
//       logo: "https://via.placeholder.com/80x80?text=VNPAY",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "20-30 triệu",
//     description:
//       "Quản lý hạ tầng cloud, CI/CD pipeline và monitoring cho hệ thống thanh toán.",
//     requirements: ["AWS/Azure", "Docker, Kubernetes", "Jenkins/GitLab CI"],
//     benefits: ["Stock options", "Bảo hiểm premium", "Flexible working"],
//     postedDate: "4 giờ trước",
//     industry: "Fintech",
//     skills: ["AWS", "Docker", "Kubernetes", "Jenkins"],
//     isUrgent: false,
//     isRemote: true,
//   },
//   {
//     id: 13,
//     title: "Frontend React Developer",
//     company: {
//       name: "Tiki Corporation",
//       logo: "https://via.placeholder.com/80x80?text=TIKI",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Junior",
//     salary: "15-22 triệu",
//     description:
//       "Xây dựng giao diện người dùng cho website thương mại điện tử với React và TypeScript.",
//     requirements: ["1-2 năm React", "TypeScript", "HTML/CSS/JavaScript"],
//     benefits: ["Learning budget", "Free lunch", "Modern workspace"],
//     postedDate: "6 giờ trước",
//     industry: "Thương mại điện tử",
//     skills: ["React", "TypeScript", "HTML", "CSS"],
//     isUrgent: false,
//     isRemote: false,
//   },
//   {
//     id: 12,
//     title: "Full Stack Developer (.NET)",
//     company: {
//       name: "Techcombank",
//       logo: "https://via.placeholder.com/80x80?text=TCB",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "22-35 triệu",
//     description: "Phát triển các ứng dụng ngân hàng số với .NET Core và React.",
//     requirements: [".NET Core", "Entity Framework", "SQL Server", "React"],
//     benefits: ["Lương tháng 13", "Bonus theo KPI", "Đào tạo quốc tế"],
//     postedDate: "8 giờ trước",
//     industry: "Ngân hàng",
//     skills: [".NET Core", "React", "SQL Server", "Entity Framework"],
//     isUrgent: true,
//     isRemote: false,
//   },
//   {
//     id: 11,
//     title: "Product Manager",
//     company: {
//       name: "Grab Vietnam",
//       logo: "https://via.placeholder.com/80x80?text=GRAB",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Senior",
//     salary: "35-50 triệu",
//     description:
//       "Quản lý sản phẩm cho các dịch vụ siêu ứng dụng Grab tại thị trường Việt Nam.",
//     requirements: ["3+ năm PM", "Analytics tools", "Agile/Scrum"],
//     benefits: ["Stock options", "Free Grab rides", "International exposure"],
//     postedDate: "1 ngày trước",
//     industry: "Giao thông vận tải",
//     skills: ["Product Management", "Analytics", "Agile", "Scrum"],
//     isUrgent: false,
//     isRemote: true,
//   },
//   {
//     id: 10,
//     title: "Backend Java Developer",
//     company: {
//       name: "VNG Corporation",
//       logo: "https://via.placeholder.com/80x80?text=VNG",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "25-40 triệu",
//     description:
//       "Phát triển backend cho các sản phẩm Zalo, ZaloPay với Java Spring Boot.",
//     requirements: ["Java 8+", "Spring Boot", "MySQL/PostgreSQL", "Redis"],
//     benefits: ["Top salary", "Premium healthcare", "Flexible time"],
//     postedDate: "1 ngày trước",
//     industry: "Công nghệ thông tin",
//     skills: ["Java", "Spring Boot", "MySQL", "Redis"],
//     isUrgent: false,
//     isRemote: false,
//   },
//   {
//     id: 9,
//     title: "UI/UX Designer",
//     company: {
//       name: "Momo",
//       logo: "https://via.placeholder.com/80x80?text=MOMO",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "18-28 triệu",
//     description:
//       "Thiết kế giao diện và trải nghiệm người dùng cho ứng dụng ví điện tử hàng đầu.",
//     requirements: ["2+ năm UI/UX", "Figma", "Design system", "User research"],
//     benefits: ["Creative environment", "Free meals", "Design tools budget"],
//     postedDate: "2 ngày trước",
//     industry: "Fintech",
//     skills: ["UI/UX Design", "Figma", "Sketch", "Prototyping"],
//     isUrgent: false,
//     isRemote: true,
//   },
//   {
//     id: 8,
//     title: "Data Analyst",
//     company: {
//       name: "Shopee Vietnam",
//       logo: "https://via.placeholder.com/80x80?text=SPE",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Junior",
//     salary: "15-25 triệu",
//     description:
//       "Phân tích dữ liệu thương mại điện tử để hỗ trợ ra quyết định kinh doanh.",
//     requirements: ["SQL", "Python/R", "Excel", "Statistics"],
//     benefits: ["MacBook Pro", "Free snacks", "Learning opportunities"],
//     postedDate: "3 ngày trước",
//     industry: "Thương mại điện tử",
//     skills: ["SQL", "Python", "Excel", "Statistics"],
//     isUrgent: false,
//     isRemote: false,
//   },
//   {
//     id: 7,
//     title: "Mobile iOS Developer",
//     company: {
//       name: "FPT Software",
//       logo: "https://via.placeholder.com/80x80?text=FPT",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Senior",
//     salary: "30-45 triệu",
//     description: "Phát triển ứng dụng iOS cho các dự án outsourcing quốc tế.",
//     requirements: ["Swift 5+", "iOS SDK", "Core Data", "MVVM"],
//     benefits: [
//       "Overseas opportunities",
//       "FPTCare insurance",
//       "Training budget",
//     ],
//     postedDate: "3 ngày trước",
//     industry: "Công nghệ thông tin",
//     skills: ["iOS", "Swift", "Core Data", "MVVM"],
//     isUrgent: true,
//     isRemote: false,
//   },
//   {
//     id: 6,
//     title: "QA Automation Engineer",
//     company: {
//       name: "Vingroup",
//       logo: "https://via.placeholder.com/80x80?text=VIN",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "20-30 triệu",
//     description:
//       "Thiết lập và duy trì hệ thống test automation cho các sản phẩm công nghệ.",
//     requirements: ["Selenium", "TestNG/JUnit", "Java/Python", "CI/CD"],
//     benefits: [
//       "Thăng tiến nhanh",
//       "Đào tạo chuyên nghiệp",
//       "Môi trường quốc tế",
//     ],
//     postedDate: "4 ngày trước",
//     industry: "Đa ngành",
//     skills: ["Selenium", "TestNG", "Java", "Automation"],
//     isUrgent: false,
//     isRemote: true,
//   },
//   {
//     id: 5,
//     title: "Business Analyst",
//     company: {
//       name: "Vietcombank",
//       logo: "https://via.placeholder.com/80x80?text=VCB",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "18-25 triệu",
//     description:
//       "Phân tích nghiệp vụ và đề xuất giải pháp cải tiến quy trình ngân hàng.",
//     requirements: [
//       "Business analysis",
//       "Process mapping",
//       "SQL",
//       "Documentation",
//     ],
//     benefits: ["Ổn định lâu dài", "Bảo hiểm toàn diện", "Nghỉ phép nhiều"],
//     postedDate: "5 ngày trước",
//     industry: "Ngân hàng",
//     skills: ["Business Analysis", "Process Mapping", "SQL", "Documentation"],
//     isUrgent: false,
//     isRemote: false,
//   },
//   {
//     id: 4,
//     title: "Security Engineer",
//     company: {
//       name: "BIDV",
//       logo: "https://via.placeholder.com/80x80?text=BIDV",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Senior",
//     salary: "28-40 triệu",
//     description:
//       "Bảo mật hệ thống và ứng dụng ngân hàng, phòng chống tấn công mạng.",
//     requirements: [
//       "Cybersecurity",
//       "Penetration testing",
//       "CISSP/CEH",
//       "Network security",
//     ],
//     benefits: [
//       "High security clearance",
//       "Specialized training",
//       "Competitive salary",
//     ],
//     postedDate: "6 ngày trước",
//     industry: "Ngân hàng",
//     skills: [
//       "Cybersecurity",
//       "Penetration Testing",
//       "Network Security",
//       "CISSP",
//     ],
//     isUrgent: true,
//     isRemote: false,
//   },
//   {
//     id: 3,
//     title: "Marketing Digital Specialist",
//     company: {
//       name: "Tiki Corporation",
//       logo: "https://via.placeholder.com/80x80?text=TIKI",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Junior",
//     salary: "12-18 triệu",
//     description:
//       "Thực hiện các chiến dịch marketing digital cho nền tảng thương mại điện tử.",
//     requirements: [
//       "Google Ads",
//       "Facebook Ads",
//       "Analytics",
//       "Content marketing",
//     ],
//     benefits: ["Creative freedom", "Learning budget", "Young team"],
//     postedDate: "1 tuần trước",
//     industry: "Thương mại điện tử",
//     skills: ["Digital Marketing", "Google Ads", "Facebook Ads", "Analytics"],
//     isUrgent: false,
//     isRemote: true,
//   },
//   {
//     id: 2,
//     title: "Machine Learning Engineer",
//     company: {
//       name: "VNG Corporation",
//       logo: "https://via.placeholder.com/80x80?text=VNG",
//     },
//     location: "TP. Hồ Chí Minh",
//     type: "Full-time",
//     level: "Senior",
//     salary: "40-60 triệu",
//     description:
//       "Phát triển mô hình ML cho recommendation system và AI features trên các sản phẩm VNG.",
//     requirements: [
//       "Python",
//       "TensorFlow/PyTorch",
//       "Machine Learning",
//       "Statistics",
//     ],
//     benefits: [
//       "Top-tier salary",
//       "Research opportunities",
//       "International conferences",
//     ],
//     postedDate: "1 tuần trước",
//     industry: "Công nghệ thông tin",
//     skills: ["Machine Learning", "Python", "TensorFlow", "PyTorch"],
//     isUrgent: false,
//     isRemote: false,
//   },
//   {
//     id: 1,
//     title: "Scrum Master",
//     company: {
//       name: "FPT Software",
//       logo: "https://via.placeholder.com/80x80?text=FPT",
//     },
//     location: "Hà Nội",
//     type: "Full-time",
//     level: "Mid-level",
//     salary: "22-32 triệu",
//     description:
//       "Hỗ trợ team development áp dụng Agile/Scrum methodology hiệu quả.",
//     requirements: [
//       "Scrum certification",
//       "Agile coaching",
//       "Team leadership",
//       "Communication",
//     ],
//     benefits: [
//       "Leadership development",
//       "Agile training",
//       "International projects",
//     ],
//     postedDate: "2 tuần trước",
//     industry: "Công nghệ thông tin",
//     skills: ["Scrum", "Agile", "Leadership", "Communication"],
//     isUrgent: false,
//     isRemote: true,
//   },
// ];

// const JOBS_PER_PAGE = 10;

// export default function JobsPage() {
//   const [jobs] = useState<Job[]>(mockJobs);
//   const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filter states
//   const [locationInput, setLocationInput] = useState("");
//   const [industryInput, setIndustryInput] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [selectedLevel, setSelectedLevel] = useState("");
//   const [sortBy, setSortBy] = useState("default");
//   const [appliedFilters, setAppliedFilters] = useState<JobFilterState>(() =>
//     createDefaultJobFilters()
//   );

//   const handleApplyFilters = () => {
//     setAppliedFilters({
//       searchTerm,
//       locationInput,
//       industryInput,
//       selectedType,
//       selectedLevel,
//       sortBy,
//     });
//   };

//   const handleClearFilters = () => {
//     const defaults = createDefaultJobFilters();
//     setSearchTerm("");
//     setLocationInput("");
//     setIndustryInput("");
//     setSelectedType("");
//     setSelectedLevel("");
//     setSortBy(defaults.sortBy);
//     setAppliedFilters(defaults);
//   };

//   // Get unique values for filter options
//   const locations = Array.from(new Set(jobs.map((j) => j.location)));
//   const industries = Array.from(new Set(jobs.map((j) => j.industry)));
//   const jobTypes = Array.from(new Set(jobs.map((j) => j.type)));

//   // Filter and sort jobs
//   useEffect(() => {
//     const {
//       searchTerm: appliedSearchTerm,
//       locationInput: appliedLocation,
//       industryInput: appliedIndustry,
//       selectedType: appliedType,
//       selectedLevel: appliedLevel,
//       sortBy: appliedSort,
//     } = appliedFilters;

//     let filtered = [...jobs];

//     if (appliedSearchTerm) {
//       const loweredSearch = appliedSearchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (job) =>
//           job.title.toLowerCase().includes(loweredSearch) ||
//           job.company.name.toLowerCase().includes(loweredSearch) ||
//           job.description.toLowerCase().includes(loweredSearch) ||
//           job.skills.some((skill) =>
//             skill.toLowerCase().includes(loweredSearch)
//           )
//       );
//     }

//     if (appliedLocation) {
//       const loweredLocation = appliedLocation.toLowerCase();
//       filtered = filtered.filter((job) =>
//         job.location.toLowerCase().includes(loweredLocation)
//       );
//     }

//     if (appliedIndustry) {
//       const loweredIndustry = appliedIndustry.toLowerCase();
//       filtered = filtered.filter((job) =>
//         job.industry.toLowerCase().includes(loweredIndustry)
//       );
//     }

//     if (appliedType) {
//       filtered = filtered.filter((job) => job.type === appliedType);
//     }

//     if (appliedLevel) {
//       filtered = filtered.filter((job) => job.level === appliedLevel);
//     }

//     if (appliedSort === "title-asc") {
//       filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
//     } else if (appliedSort === "title-desc") {
//       filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
//     } else if (appliedSort === "company-asc") {
//       filtered = filtered.sort((a, b) =>
//         a.company.name.localeCompare(b.company.name)
//       );
//     } else if (appliedSort === "salary-high") {
//       filtered = filtered.sort((a, b) => {
//         const aMax = parseInt(a.salary.split("-")[1]) || 0;
//         const bMax = parseInt(b.salary.split("-")[1]) || 0;
//         return bMax - aMax;
//       });
//     } else if (appliedSort === "salary-low") {
//       filtered = filtered.sort((a, b) => {
//         const aMax = parseInt(a.salary.split("-")[1]) || 0;
//         const bMax = parseInt(b.salary.split("-")[1]) || 0;
//         return aMax - bMax;
//       });
//     } else if (appliedSort === "newest") {
//       filtered = filtered.sort((a, b) => b.id - a.id);
//     }

//     setFilteredJobs(filtered);
//     setCurrentPage(1);
//   }, [jobs, appliedFilters]);

//   // Pagination
//   const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
//   const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
//   const endIndex = startIndex + JOBS_PER_PAGE;
//   const currentJobs = filteredJobs.slice(startIndex, endIndex);

//   const handleJobClick = (jobId: number) => {
//     console.log(`Clicked job ID: ${jobId}`);
//     // TODO: Navigate to job detail page
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Featured Jobs Carousel */}
//       <JobCarousel jobs={jobs} />

//       <div className="py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-xl font-bold text-gray-900 mb-4">
//               Danh sách việc làm
//             </h1>
//             <p className="text-gray-600 text-base">
//               Tìm kiếm cơ hội nghề nghiệp phù hợp với kỹ năng và mong muốn của
//               bạn
//             </p>
//           </div>

//           {/* Search and Filters */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
//             <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//               {/* Search */}
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Tìm kiếm
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Vị trí, công ty, kỹ năng..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 />
//               </div>

//               {/* Location Filter */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Địa điểm
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Nhập hoặc chọn địa điểm..."
//                   value={locationInput}
//                   onChange={(e) => setLocationInput(e.target.value)}
//                   list="job-locations"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 />
//                 <datalist id="job-locations">
//                   <option value="" />
//                   {locations.map((location) => (
//                     <option key={location} value={location} />
//                   ))}
//                 </datalist>
//               </div>

//               {/* Industry Filter */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Ngành nghề
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Nhập hoặc chọn ngành..."
//                   value={industryInput}
//                   onChange={(e) => setIndustryInput(e.target.value)}
//                   list="job-industries"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 />
//                 <datalist id="job-industries">
//                   <option value="" />
//                   {industries.map((industry) => (
//                     <option key={industry} value={industry} />
//                   ))}
//                 </datalist>
//               </div>

//               {/* Job Type Filter */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Loại hình
//                 </label>
//                 <select
//                   value={selectedType}
//                   onChange={(e) => setSelectedType(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 >
//                   <option value="">Tất cả loại hình</option>
//                   {jobTypes.map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Sort */}
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-2">
//                   Sắp xếp
//                 </label>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 >
//                   <option value="default">Mặc định (mới nhất)</option>
//                   <option value="newest">Công việc mới nhất</option>
//                   <option value="title-asc">Tên công việc A-Z</option>
//                   <option value="title-desc">Tên công việc Z-A</option>
//                   <option value="company-asc">Công ty A-Z</option>
//                   <option value="salary-high">Lương cao → thấp</option>
//                   <option value="salary-low">Lương thấp → cao</option>
//                 </select>
//               </div>
//             </div>

//             {/* Search & Clear Buttons */}
//             <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <Button
//                 onClick={handleApplyFilters}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
//               >
//                 🔍 Tìm kiếm
//               </Button>
//               <Button
//                 onClick={handleClearFilters}
//                 className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-xs transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
//               >
//                 🗑️ Xóa bộ lọc
//               </Button>
//             </div>
//           </div>

//           {/* Results Info */}
//           <div className="mb-6">
//             <p className="text-gray-600 text-sm">
//               Hiển thị {startIndex + 1}-
//               {Math.min(endIndex, filteredJobs.length)} trong tổng số{" "}
//               {filteredJobs.length} công việc
//             </p>
//           </div>

//           {/* Jobs Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             {currentJobs.map((job) => (
//               <div
//                 key={job.id}
//                 onClick={() => handleJobClick(job.id)}
//                 className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
//               >
//                 <div className="flex items-start space-x-4">
//                   {/* Company Logo */}
//                   <div className="flex-shrink-0">
//                     <img
//                       src={job.company.logo}
//                       alt={`${job.company.name} logo`}
//                       className="w-12 h-12 rounded-lg object-cover bg-gray-100"
//                     />
//                   </div>

//                   {/* Job Info */}
//                   <div className="flex-1 min-w-0">
//                     {/* Title and Urgent Badge */}
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                           {job.title}
//                           {job.isUrgent && (
//                             <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
//                               🔥 Urgent
//                             </span>
//                           )}
//                         </h3>
//                         <p className="text-sm font-medium text-blue-600">
//                           {job.company.name}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Job Details */}
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
//                         📍 {job.location}
//                       </span>
//                       <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
//                         💰 {job.salary}
//                       </span>
//                       <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                         👨‍💼 {job.level}
//                       </span>
//                       <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
//                         ⏰ {job.type}
//                       </span>
//                       {job.isRemote && (
//                         <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
//                           🏠 Remote OK
//                         </span>
//                       )}
//                     </div>

//                     {/* Description */}
//                     <p className="text-gray-600 text-xs mb-3 line-clamp-2">
//                       {job.description}
//                     </p>

//                     {/* Skills */}
//                     <div className="mb-3">
//                       <div className="flex flex-wrap gap-1">
//                         {job.skills.slice(0, 4).map((skill, index) => (
//                           <span
//                             key={index}
//                             className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full"
//                           >
//                             {skill}
//                           </span>
//                         ))}
//                         {job.skills.length > 4 && (
//                           <span className="text-xs text-gray-500">
//                             +{job.skills.length - 4} khác
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="flex items-center justify-between text-xs text-gray-500">
//                       <span>{job.postedDate}</span>
//                       <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
//                         {job.industry}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center items-center space-x-4">
//               <Button
//                 onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//                 disabled={currentPage === 1}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 ← Trước
//               </Button>

//               <div className="flex space-x-2">
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (page) => (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`px-3 py-2 rounded-md text-xs font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl ${
//                         currentPage === page
//                           ? "bg-blue-600 text-white"
//                           : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   )
//                 )}
//               </div>

//               <Button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 Tiếp →
//               </Button>
//             </div>
//           )}

//           {/* No Results */}
//           {filteredJobs.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-gray-400 mb-4">
//                 <svg
//                   className="w-12 h-12 mx-auto"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-base font-medium text-gray-900 mb-2">
//                 Không tìm thấy công việc nào
//               </h3>
//               <p className="text-gray-500 text-sm">
//                 Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
