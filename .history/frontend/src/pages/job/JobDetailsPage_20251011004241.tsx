import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  Briefcase,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useJobStore } from "../../store/job.store";
import { JobDetailSkeleton } from "../../components/job";

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobDetail, isLoading } = useJobStore();

  useEffect(() => {
    if (jobId) {
      // fetchJobDetail(jobId); - chưa implement
      console.log("Fetching job detail for:", jobId);
    }
  }, [jobId]);

  // Mock data for now
  const mockJobDetail = {
    id: jobId,
    job_title: "Senior Software Engineer",
    description: "We are looking for a passionate Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions that serve millions of users worldwide.\n\nIn this role, you will work closely with cross-functional teams including product managers, designers, and other engineers to deliver exceptional user experiences. You'll have the opportunity to work on cutting-edge technologies and contribute to architectural decisions that shape our platform's future.",
    requirements: [
      "5+ years of experience in software development",
      "Strong proficiency in React, TypeScript, and Node.js",
      "Experience with cloud platforms (AWS, Azure, or GCP)",
      "Knowledge of microservices architecture",
      "Excellent problem-solving and communication skills",
      "Bachelor's degree in Computer Science or related field"
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible working hours and remote work options",
      "Professional development budget",
      "Annual company retreats",
      "State-of-the-art equipment and workspace"
    ],
    location: "Hồ Chí Minh",
    salary: ["25-35 triệu"],
    currency: "VND",
    status: "on_going",
    created_at: "2024-01-15",
    deadline: "2024-02-15",
    jobCategories: {
      job_category: "Software Development"
    },
    company: {
      id: "1",
      users: {
        username: "TechCorp Vietnam",
        avatar_url: null,
        address_city: "Hồ Chí Minh"
      },
      employees: "100-500",
      description: "Leading technology company in Vietnam"
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <JobDetailSkeleton />
      </Layout>
    );
  }

  const job = jobDetail || mockJobDetail;

  const handleApply = () => {
    console.log("Applying to job:", job.id);
    // Implement apply logic
  };

  const handleSave = () => {
    console.log("Saving job:", job.id);
    // Implement save logic
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/jobs"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Job Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-light text-slate-900 mb-4">
                  {job.job_title}
                </h1>
                
                <div className="flex items-center gap-6 text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary && job.salary.length > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-green-600">
                        {job.salary[0]} {job.currency}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.jobCategories?.job_category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Badge variant={job.status === 'on_going' ? 'default' : 'secondary'}>
                    {job.status === 'on_going' ? 'Đang tuyển' : job.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Hết hạn {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 ml-8">
                <Button onClick={handleApply} size="lg" className="bg-green-600 hover:bg-green-700">
                  Apply Now
                </Button>
                <Button variant="outline" onClick={handleSave}>
                  Save Job
                </Button>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border">
                {job.company?.users?.avatar_url ? (
                  <img
                    src={job.company.users.avatar_url}
                    alt={job.company.users.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {job.company?.users?.username}
                </h3>
                <p className="text-slate-600 text-sm mb-2">
                  {job.company?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{job.company?.employees} employees</span>
                  <span>{job.company?.users?.address_city}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Company
              </Button>
            </div>
          </div>

          {/* Job Description */}
          <div className="prose prose-slate max-w-none mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Job Description</h2>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Section */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              Ready to apply?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join our team and help us build amazing products that make a difference. 
              We're looking for passionate individuals who want to grow with us.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleApply} size="lg" className="bg-green-600 hover:bg-green-700">
                Apply for this position
              </Button>
              <Button variant="outline" size="lg" onClick={handleSave}>
                Save for later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}