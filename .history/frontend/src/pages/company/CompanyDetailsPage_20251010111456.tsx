// Company Details Page - Modern Card Layout Concept
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Globe, 
  Mail, 
  Phone,
  Heart,
  ExternalLink,
  Building2,
  Calendar,
  Award
} from "lucide-react";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useCompanyStore } from "../../store/company.store";
import { CompanyDetailSkeleton } from "../../components/company";

export default function CompanyDetailsPage() {
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
        <CompanyDetailSkeleton />
      </Layout>
    );
  }

  const { users, description, employees, jobs, _count } = companyDetail;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-80 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
            {companyDetail.background_url ? (
              <img 
                src={companyDetail.background_url} 
                alt="Company Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90" />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Company Profile Card */}
          <div className="max-w-6xl mx-auto px-4 relative -mt-24">
            <Card className="bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Company Logo */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden">
                      {users?.avatar_url ? (
                        <img 
                          src={users.avatar_url} 
                          alt={users.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {users?.username || "Company Name"}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{users?.address_city || users?.address_country || "Location"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Technology</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Heart className="w-4 h-4 mr-2" />
                        Follow Company
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-slate-900">
                      {employees || "N/A"}
                    </div>
                    <div className="text-sm text-slate-600">Employees</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-slate-900">
                      {_count?.followedCompanies || 0}
                    </div>
                    <div className="text-sm text-slate-600">Followers</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-slate-900">
                      {jobs?.length || 0}
                    </div>
                    <div className="text-sm text-slate-600">Open Jobs</div>
                  </CardContent>
                </Card>
              </div>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    About Company
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    {description || "No description available for this company."}
                  </p>
                </CardContent>
              </Card>

              {/* Jobs Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Open Positions ({jobs?.length || 0})
                    </div>
                    <Button variant="outline" size="sm">
                      View All Jobs
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {jobs && jobs.length > 0 ? (
                    <div className="space-y-4">
                      {jobs.slice(0, 3).map((job, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {job.title || "Job Title"}
                            </h3>
                            <Badge variant="secondary">
                              Remote
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-sm mb-3">
                            {job.description?.slice(0, 120)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Posted 2 days ago</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location || "Remote"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No open positions at the moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact & Additional Info */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">{users.email}</span>
                    </div>
                  )}
                  {users?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">{users.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">
                      {users?.address_city || "Location not specified"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Company Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {employees || "N/A"}
                    </div>
                    <p className="text-slate-600">Total Employees</p>
                  </div>
                </CardContent>
              </Card>

              {/* Industry */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Technology</Badge>
                    <Badge>Software</Badge>
                    <Badge>Innovation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}