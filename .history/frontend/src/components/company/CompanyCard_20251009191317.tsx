import { Building2, MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import type { CompanySummary } from "../../types/company";

interface CompanyCardProps {
  company: CompanySummary;
  onClick?: () => void;
}



export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const { users, company_type, _count } = company;

  // Get company type display
  const getCompanyTypeDisplay = (type: string) => {
    switch (type) {
      case "business":
        return "Doanh nghiệp";
      case "business_household":
        return "Hộ kinh doanh";
      default:
        return type;
    }
  };


  

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 border-gray-200 hover:border-blue-300 overflow-hidden"
      onClick={onClick}
    >
      {/* Header Background */}
      <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-600 relative">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      <CardContent className="p-6 -mt-10 relative">
        {/* Company Avatar */}
        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 border-4 border-white mx-auto">
          {users?.avatar_url ? (
            <img
              src={users.avatar_url}
              alt={users.username || "Company"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-blue-600" />
          )}
        </div>

        {/* Company Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors text-center truncate">
          {users?.username || "Company Name"}
        </h3>

        {/* Company Type Badge */}
        <div className="flex justify-center mb-3">
          <Badge
            variant="secondary"
            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            {getCompanyTypeDisplay(company_type)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">
            {users?.address_city || users?.address_country || "Chưa cập nhật"}
          </span>
        </div>

        {/* Job Count */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{_count?.jobs || 0} việc làm</span>
        </div>

        {/* Contact Info */}
        {users?.email && (
          <p className="text-xs text-gray-500 text-center truncate">
            {users.email}
          </p>
        )}

        {/* Hover Effect Indicator */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Xem chi tiết</span>
            <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
