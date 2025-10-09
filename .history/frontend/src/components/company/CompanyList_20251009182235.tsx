import { Building } from "lucide-react";
import { CompanyCard } from "./CompanyCard";
import { Card, CardContent } from "@/components/ui/card";
import type { CompanySummary } from "@/types/company";

interface CompanyListProps {
  companies: CompanySummary[];
  isLoading?: boolean;
  onCompanyClick?: (companyId: string) => void;
}

export function CompanyList({ companies, isLoading = false, onCompanyClick }: CompanyListProps) {
  const handleCompanyClick = (companyId: string) => {
    onCompanyClick?.(companyId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy công ty nào
            </h3>
            <p className="text-gray-500 mb-4">
              Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onClick={handleCompanyClick}
        />
      ))}
    </div>
  );
}