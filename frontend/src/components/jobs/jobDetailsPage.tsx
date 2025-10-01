import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

// Sử dụng lại interface Job từ jobsPage
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
  requirements: string[];
  benefits: string[];
  postedDate: string;
  industry: string;
  skills: string[];
  isUrgent: boolean;
  isRemote: boolean;
}

// Mock data - trong thực tế sẽ fetch từ API
const mockJobs: Job[] = [
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
    description:
      "Phát triển ứng dụng mobile Flutter cho nền tảng thương mại điện tử hàng đầu Việt Nam. Bạn sẽ tham gia vào việc xây dựng các tính năng mới, tối ưu hóa performance và đảm bảo chất lượng code. Team Flutter của chúng tôi đang phát triển các ứng dụng với hàng triệu người dùng.",
    requirements: [
      "3+ năm kinh nghiệm Flutter/Dart",
      "Hiểu biết sâu về State Management (Provider/Bloc)",
      "Kinh nghiệm với RESTful APIs và GraphQL",
      "Familiar với Git, CI/CD",
      "Có kinh nghiệm với Firebase và các third-party integrations",
    ],
    benefits: [
      "Lương cạnh tranh + bonus theo performance",
      "Bảo hiểm y tế cao cấp cho cả gia đình",
      "Du lịch công ty hàng năm",
      "Training budget 10 triệu/năm",
      "Flexible working time",
      "MacBook Pro + Setup tại nhà",
    ],
    postedDate: "2 giờ trước",
    industry: "Thương mại điện tử",
    skills: ["Flutter", "Dart", "Provider", "REST API", "Firebase"],
    isUrgent: true,
    isRemote: false,
  },
  // Thêm các job khác để test related jobs
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
    description:
      "Quản lý hạ tầng cloud, CI/CD pipeline và monitoring cho hệ thống thanh toán.",
    requirements: ["AWS/Azure", "Docker, Kubernetes", "Jenkins/GitLab CI"],
    benefits: ["Stock options", "Bảo hiểm premium", "Flexible working"],
    postedDate: "4 giờ trước",
    industry: "Fintech",
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins"],
    isUrgent: false,
    isRemote: true,
  },
  {
    id: 13,
    title: "Frontend React Developer",
    company: {
      name: "Tiki Corporation",
      logo: "https://via.placeholder.com/80x80?text=TIKI",
    },
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    level: "Junior",
    salary: "15-22 triệu",
    description:
      "Xây dựng giao diện người dùng cho website thương mại điện tử với React và TypeScript.",
    requirements: ["1-2 năm React", "TypeScript", "HTML/CSS/JavaScript"],
    benefits: ["Learning budget", "Free lunch", "Modern workspace"],
    postedDate: "6 giờ trước",
    industry: "Thương mại điện tử",
    skills: ["React", "TypeScript", "HTML", "CSS"],
    isUrgent: false,
    isRemote: false,
  },
];

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  // State để lưu job hiện tại và related jobs
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [sameCompanyJobs, setSameCompanyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch job details khi component mount
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);

        // Trong thực tế sẽ call API: await fetchJobById(jobId)
        const currentJob = mockJobs.find((j) => j.id === Number(jobId));

        if (!currentJob) {
          navigate("/jobs"); // Redirect nếu không tìm thấy job
          return;
        }

        setJob(currentJob);

        // Tìm các job liên quan (cùng industry hoặc cùng level)
        const related = mockJobs
          .filter(
            (j) =>
              j.id !== Number(jobId) &&
              (j.industry === currentJob.industry ||
                j.level === currentJob.level)
          )
          .slice(0, 3);

        // Tìm các job khác của cùng công ty
        const sameCompany = mockJobs
          .filter(
            (j) =>
              j.id !== Number(jobId) &&
              j.company.name === currentJob.company.name
          )
          .slice(0, 3);

        setRelatedJobs(related);
        setSameCompanyJobs(sameCompany);
      } catch (error) {
        console.error("Error fetching job details:", error);
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  // Không tìm thấy job
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy việc làm
          </h2>
          <Button onClick={() => navigate("/jobs")}>
            Quay lại danh sách việc làm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/jobs")}
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
            <span>Quay lại danh sách việc làm</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </h1>
                    <p className="text-lg text-gray-700 mb-1">
                      {job.company.name}
                    </p>
                    <p className="text-gray-500">{job.location}</p>
                  </div>
                </div>

                {/* Urgent Badge */}
                {job.isUrgent && (
                  <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full font-medium">
                    Tuyển gấp
                  </span>
                )}
              </div>

              {/* Job Info Tags */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span className="font-medium">{job.salary}</span>
                </div>

                <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    />
                  </svg>
                  <span>{job.type}</span>
                </div>

                <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span>{job.level}</span>
                </div>

                {job.isRemote && (
                  <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-2 rounded-lg">
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Remote OK</span>
                  </div>
                )}
              </div>

              {/* Posted Date */}
              <p className="text-sm text-gray-500">
                Đăng {job.postedDate} • {job.industry}
              </p>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Mô tả công việc
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Yêu cầu công việc
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quyền lợi
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Kỹ năng yêu cầu
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg mb-4">
                Ứng tuyển ngay
              </Button>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Hạn nộp hồ sơ:</span>
                  <span className="font-medium">30/10/2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Số lượng tuyển:</span>
                  <span className="font-medium">2-3 người</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hình thức làm việc:</span>
                  <span className="font-medium">{job.type}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  💾 Lưu việc làm
                </Button>
                <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  📤 Chia sẻ
                </Button>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Về công ty
              </h3>
              <div className="text-center mb-4">
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-20 h-20 rounded-lg object-cover border mx-auto mb-3"
                />
                <h4 className="font-bold text-gray-900">{job.company.name}</h4>
                <p className="text-gray-600 text-sm">{job.industry}</p>
              </div>

              <Button
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={() =>
                  navigate(
                    `/companies/${job.company.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`
                  )
                }
              >
                Xem trang công ty
              </Button>
            </div>
          </div>
        </div>

        {/* Related Jobs Sections - Sẽ implement trong bước tiếp theo */}
        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Việc làm liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relatedJob) => (
                <div
                  key={relatedJob.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${relatedJob.id}`)}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <img
                      src={relatedJob.company.logo}
                      alt={relatedJob.company.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                        {relatedJob.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {relatedJob.company.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium text-sm mb-2">
                    {relatedJob.salary}
                  </p>
                  <p className="text-gray-500 text-sm">{relatedJob.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sameCompanyJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Việc làm khác tại {job.company.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sameCompanyJobs.map((companyJob) => (
                <div
                  key={companyJob.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${companyJob.id}`)}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <img
                      src={companyJob.company.logo}
                      alt={companyJob.company.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                        {companyJob.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {companyJob.company.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium text-sm mb-2">
                    {companyJob.salary}
                  </p>
                  <p className="text-gray-500 text-sm">{companyJob.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
