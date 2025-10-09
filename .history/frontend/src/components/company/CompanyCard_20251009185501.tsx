import { Building2, MapPin, Users, Briefcase } from "lucide-react";
import type { CompanySummary } from "../../types/company";

interface CompanyCardProps {
  company: CompanySummary;
  onClick?: () => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const { users, company_type, _count } = company;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200 overflow-hidden group"
    >
      <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 relative">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      <div className="p-6 -mt-12 relative">
        <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 border-4 border-white">
          {users?.avatar_url ? (
            <img
              src={users.avatar_url}
              alt={users.username}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Building2 className="w-10 h-10 text-blue-600" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {users?.username || "Company Name"}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {users?.address_city ||
              users?.address_country ||
              "Location not specified"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span className="font-medium">{company_type}</span>
          </div>
          {_count?.jobs !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{_count.jobs} jobs</span>
            </div>
          )}
        </div>

        {users?.email && (
          <p className="text-xs text-slate-500 line-clamp-1">{users.email}</p>
        )}
      </div>
    </div>
  );
}
