import { Briefcase, MapPin, DollarSign, Building2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";

interface RecommendedJob {
    id: string;
    job_title: string;
    salary: number[];
    currency: string;
    location: string;
    status: string;
    job_category: string;
    label_name: string | null;
    avatar_url: string | null;
    username: string;
}

interface RecommendedJobsCardProps {
    jobs: RecommendedJob[];
    isLoading?: boolean;
}

export const RecommendedJobsCard: React.FC<RecommendedJobsCardProps> = ({
    jobs,
    isLoading = false
}) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Card className="bg-white shadow-lg rounded-2xl">
                <CardHeader className="bg-linear-to-r from-yellow-50 to-orange-50 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Việc làm đề xuất
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!jobs || jobs.length === 0) {
        return null;
    }

    const formatSalary = (salary: number[], currency: string) => {
        if (!salary || salary.length === 0) return "Thỏa thuận";
        if (salary.length === 1) return `${salary[0].toLocaleString()} ${currency}`;
        return `${salary[0].toLocaleString()} - ${salary[1].toLocaleString()} ${currency}`;
    };

    return (
        <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-yellow-50 to-orange-50 pb-4">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Việc làm đề xuất
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="p-4 rounded-xl hover:bg-linear-to-r hover:from-yellow-50 hover:to-orange-50 transition-all cursor-pointer group border border-transparent hover:border-yellow-200 hover:shadow-md"
                    >
                        {/* Job Header */}
                        <div className="flex items-start gap-3 mb-3">
                            {/* Company Logo */}
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border-2 border-slate-100 group-hover:border-yellow-200 transition-colors shrink-0">
                                {job.avatar_url ? (
                                    <img
                                        src={job.avatar_url}
                                        alt={job.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center bg-slate-100 h-full">
                                        <Building2 className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Job Title & Company */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 group-hover:text-yellow-600 transition-colors text-sm mb-1 line-clamp-2">
                                    {job.job_title}
                                </h3>
                                <p className="text-xs text-slate-600 truncate">{job.username}</p>
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-2">
                            {/* Salary */}
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <DollarSign className="w-3.5 h-3.5 shrink-0 text-green-600" />
                                <span className="font-medium text-green-700">
                                    {formatSalary(job.salary, job.currency)}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{job.location}</span>
                            </div>

                            {/* Category */}
                            {job.job_category && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{job.job_category}</span>
                                </div>
                            )}
                        </div>

                        {/* Label Badge */}
                        {job.label_name && (
                            <div className="mt-3">
                                <Badge
                                    variant="outline"
                                    className="bg-linear-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200 text-xs"
                                >
                                    <Star className="w-3 h-3 mr-1 fill-orange-500 text-orange-500" />
                                    {job.label_name}
                                </Badge>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};