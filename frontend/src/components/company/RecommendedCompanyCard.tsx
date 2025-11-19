import { Building2, Briefcase, MapPin, Star, CircleChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";

interface RecommendedCompany {
    id: string;
    company_type: string;
    is_verified: boolean;
    username: string;
    avatar_url: string | null;
    address_street: string | null;
    address_ward: string | null;
    address_city: string | null;
    address_country: string | null;
    field_name: string | null;
    jobs_count: number;
    companyTags: Array<{ label_name: string }> | null;
    followed_companies: Array<{
        user_id: string;
        followed_at: string;
        is_notified: boolean;
    }> | null;
}

interface RecommendedCompaniesCardProps {
    companies: RecommendedCompany[];
    isLoading?: boolean;
}

export const RecommendedCompaniesCard: React.FC<RecommendedCompaniesCardProps> = ({
    companies,
    isLoading = false
}) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Card className="bg-white shadow-lg rounded-2xl">
                <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Công ty đề xuất
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!companies || companies.length === 0) {
        return null;
    }

    return (
        <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 pb-4">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Công ty đề xuất
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {companies.map((company) => {
                    const address = [
                        company.address_city,
                        company.address_country
                    ].filter(Boolean).join(", ");

                    return (
                        <div
                            key={company.id}
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className="flex gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group border border-transparent hover:border-blue-200"
                        >
                            {/* Company Logo */}
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                                    {company.avatar_url ? (
                                        <img
                                            src={company.avatar_url}
                                            alt={company.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center bg-slate-100 h-full">
                                            <Building2 className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                {company.is_verified && (
                                    <div className="absolute -top-1 -right-2 bg-cyan-400 rounded-full p-0.5">
                                        <CircleChevronDown className="size-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Company Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate text-sm mb-1">
                                    {company.username}
                                </h3>

                                {address && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{address}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <Briefcase className="w-3 h-3 shrink-0 text-green-600" />
                                    <span className="font-medium text-green-700">
                                        {company.jobs_count} việc làm
                                    </span>
                                </div>

                                {/* Tags */}
                                {company.companyTags && company.companyTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {company.companyTags.slice(0, 2).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                            >
                                                {tag.label_name}
                                            </span>
                                        ))}
                                        {company.companyTags.length > 2 && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                                                +{company.companyTags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};