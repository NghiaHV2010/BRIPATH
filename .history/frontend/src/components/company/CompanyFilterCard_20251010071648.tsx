import { Building2, MapPin, Briefcase, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { CompanyTypeMap, mapEnumValue } from "../../utils/mapping";
import type { CompanySummary } from "../../types/company";

interface CompanyFilterCardProps {
  company: CompanySummary;
  onClick?: () => void;
}

export default function CompanyFilterCard({ company, onClick }: CompanyFilterCardProps) {
  const { users, company_type, _count } = company;

  const getCompanyTypeDisplay = (type?: string) => {
    return mapEnumValue(CompanyTypeMap, type as keyof typeof CompanyTypeMap);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header với avatar và tên công ty */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {users?.avatar_url ? (
              <img
                src={users.avatar_url}
                alt={users.username || "Company"}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Building2 className="w-5 h-5 text-slate-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-700 transition-colors">
              {users?.username || "Company Name"}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {users?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Company type badge */}
        <div className="mb-3">
          <Badge 
            variant="outline" 
            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
          >
            {getCompanyTypeDisplay(company_type)}
          </Badge>
        </div>

        {/* Info grid */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {users?.address_city || users?.address_country || "Chưa cập nhật"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span>{_count?.jobs || 0} việc làm đang tuyển</span>
          </div>
        </div>

        {/* Action indicator */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 group-hover:text-blue-600 transition-colors">
              Nhấn để xem chi tiết
            </span>
            <div className="w-4 h-4 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-600"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}