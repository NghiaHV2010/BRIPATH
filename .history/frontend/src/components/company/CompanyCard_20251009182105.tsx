import { Building, MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanySummary } from "@/types/company";

interface CompanyCardProps {
  company: CompanySummary;
  onClick?: (companyId: string) => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const handleClick = () => {
    onClick?.(company.id);
  };

  // Get company display name
  const companyName = company.users?.username || "Company";
  const companyAvatar = company.users?.avatar_url;
  const location = company.users?.address_city || company.users?.address_country;
  const jobCount = company._count?.jobs || 0;

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

  // Get company initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 border-gray-200 hover:border-blue-300"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="h-12 w-12 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            {companyAvatar ? (
              <img src={companyAvatar} alt={companyName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-blue-700 font-semibold text-sm">
                {getInitials(companyName)}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-blue-700 transition-colors">
              {companyName}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {getCompanyTypeDisplay(company.company_type)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-3">
          {/* Location */}
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Job Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
              <span>{jobCount} việc làm</span>
            </div>
            
            {/* Company Icon */}
            <div className="flex items-center text-xs text-gray-500">
              <Building className="h-4 w-4" />
            </div>
          </div>
        </div>

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