// Company Details Page - Minimal Clean Layout Concept 2
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Briefcase,
  Globe,
  Mail,
  ExternalLink,
  Building2,
  Star,
  Share2,
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useCompanyStore } from "../../store/company.store";
import { CompanyDetailSkeleton } from "../../components/company";

export default function CompanyDetailsPageMinimal() {
  const { companyId } = useParams<{ companyId: string }>();
  const { companyDetail, isLoading, fetchCompanyDetail } = useCompanyStore();

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetail(companyId);
    }
  }, [companyId, fetchCompanyDetail]);

  if (isLoading || !companyDetail) {
    return (
      <Layout>
        s
        <CompanyDetailSkeleton />
      </Layout>
    );
  }

  const { users, description, employees, jobs, _count } = companyDetail;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/companies"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Companies
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Star className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Company Header */}
          <div className="flex items-start gap-6 mb-12">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border">
              {users?.avatar_url ? (
                <img
                  src={users.avatar_url}
                  alt={users.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-light text-slate-900 mb-3">
                {users?.username || "Company Name"}
              </h1>

              <div className="flex items-center gap-6 text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{users?.address_city || "Location"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{employees || "N/A"} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{jobs?.length || 0} open roles</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to={`/companies/${companyId}/jobs`}>
                  <Button>View Jobs ({jobs?.length || 0})</Button>
                </Link>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 py-8 border-y">
            <div className="text-center">
              <div className="text-2xl font-light text-slate-900 mb-1">
                {_count?.followedCompanies || 0}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">
                Followers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-slate-900 mb-1">
                {employees || "N/A"}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">
                Team Size
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-slate-900 mb-1">
                {jobs?.length || 0}
              </div>
              <div className="text-sm text-slate-500 uppercase tracking-wide">
                Open Roles
              </div>
            </div>
          </div>

          {/* About */}
          <section className="mb-12">
            <h2 className="text-2xl font-light text-slate-900 mb-6">About</h2>
            <div className="prose prose-slate prose-lg max-w-none">
              <p className="text-slate-700 leading-relaxed">
                {description || "No description available for this company."}
              </p>
            </div>
          </section>

          {/* Open Positions */}
          {jobs && jobs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-slate-900">
                  Open Positions
                </h2>
                <Link to={`/companies/${companyId}/jobs`}>
                  <Button variant="ghost">
                    View all {jobs.length} jobs
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                {jobs.slice(0, 5).map((job, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between py-4 px-0 hover:bg-slate-50 hover:px-4 rounded-lg transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.job_title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>
                          {job.jobCategories?.job_category || "Full-time"}
                        </span>
                        <span>•</span>
                        <span>
                          {job.salary && job.salary.length > 0
                            ? `${job.salary[0]} ${job.currency || "USD"}`
                            : "Competitive salary"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {job.status || "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Information */}
          <section className="border-t pt-12">
            <h2 className="text-2xl font-light text-slate-900 mb-6">
              Get in Touch
            </h2>
            <div className="flex flex-col sm:flex-row gap-8">
              {users?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <a
                    href={`mailto:${users.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {users.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
