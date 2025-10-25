import { Link } from "react-router-dom";
import { MapPin, Building2, CircleChevronDown } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface CompanyCardProps {
    company: {
        id: string;
        name: string;
        avatar_url?: string;
        field?: string;
        address?: string;
        company_type?: string;
        is_verified?: boolean;
    };
}

export function CompanyCard({ company }: CompanyCardProps) {
    const formatCompanyType = (type?: string) => {
        switch (type) {
            case "business_househole":
                return "Hộ kinh doanh";
            case "corporation":
                return "Công ty cổ phần";
            case "limited_company":
                return "Công ty TNHH";
            case "bussiness":
                return "Doanh nghiệp";
            default:
                return "Công ty";
        }
    };

    return (
        <Link to={`/companies/${company.id}`} className="block">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-6">
                        Thông tin công ty
                    </h3>

                    <div className="space-y-6">
                        {/* Company Header */}
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                    {company.avatar_url ? (
                                        <img
                                            src={company.avatar_url}
                                            alt={company.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                {/* Verification Badge */}
                                {company.is_verified && (
                                    <CircleChevronDown className="size-4 absolute top-0 -right-1 text-white bg-cyan-400 rounded-full z-10" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-2">
                                    {company.name}
                                </h4>
                                {company.field && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2 font-normal">
                                        {company.field}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Company Details */}
                        <div className="space-y-3">
                            {(company.address || company.company_type) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {company.address && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>{company.address}</span>
                                        </div>
                                    )}
                                    {company.company_type && (
                                        <Badge variant="secondary">
                                            {formatCompanyType(company.company_type)}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}