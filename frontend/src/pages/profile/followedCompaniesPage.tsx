import { useEffect, useState } from "react";
import { getFollowedCompanies, unfollowCompanyApi } from "@/api/user_api";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  Eye,
  Globe,
} from "lucide-react";

export default function FollowedCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unfollowing, setUnfollowing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("");
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getFollowedCompanies();
        if (mounted && res.success) {
          setCompanies(res.data);
        } else if (mounted) {
          alert(
            "Không thể tải danh sách công ty đã theo dõi. Vui lòng thử lại."
          );
        }
      } catch (error) {
        console.error("Error loading followed companies:", error);
        if (mounted) {
          alert("Có lỗi xảy ra khi tải danh sách công ty đã theo dõi.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUnfollow = async (companyId: string) => {
    setUnfollowing(companyId);
    try {
      await unfollowCompanyApi(companyId);
      setCompanies(companies.filter((company) => company.id !== companyId));
    } catch (error) {
      console.error("Error unfollowing company:", error);
    s} finally {
      setUnfollowing(null);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = !filterField || company.field === filterField;
    return matchesSearch && matchesField;
  });

  const fields = [
    ...new Set(companies.map((company) => company.field).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              Công ty đã theo dõi
            </h3>
          </div>
          <p className="text-gray-600">
            Quản lý và theo dõi các công ty bạn đã follow. Tìm thấy{" "}
            {companies.length} công ty đã theo dõi.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên công ty, lĩnh vực, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả lĩnh vực</option>
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {companies.length === 0
                  ? "Chưa theo dõi công ty nào"
                  : "Không tìm thấy công ty phù hợp"}
              </h3>
              <p className="text-gray-500 mb-6">
                {companies.length === 0
                  ? "Hãy khám phá và theo dõi những công ty bạn quan tâm để nhận thông báo về việc làm mới."
                  : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy công ty phù hợp."}
              </p>
              {companies.length === 0 && (
                <Link
                  to="/companies"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-white rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Khám phá công ty
                </Link>
              )}
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/company/${company.id}`}
                            className="group block"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {company.name}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            {company.field && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {company.field}
                              </span>
                            )}
                            {company.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{company.location}</span>
                              </div>
                            )}
                            {company.employee_count && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{company.employee_count} nhân viên</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            {company.website && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Globe className="h-4 w-4" />
                                <a
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                            {company.created_at && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Tham gia{" "}
                                  {new Date(
                                    company.created_at
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/company/${company.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Link>
                      <Link
                        to={`/jobs?company=${company.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem việc làm
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={unfollowing === company.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {unfollowing === company.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Bỏ theo dõi
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Bỏ theo dõi công ty
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn bỏ theo dõi công ty "
                              {company.name}"? Bạn sẽ không nhận được thông báo
                              về việc làm mới từ công ty này nữa.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnfollow(company.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            >
                              Bỏ theo dõi
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
