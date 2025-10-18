import type { ResumeListItem } from '@/types/resume';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
    Calendar,
    Globe,
    UserCheck,
    FileBadge2,
    Briefcase,
    Award,
    GraduationCap,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ResumeCardSummaryProps {
    resume: ResumeListItem;
    onViewDetails?: () => void;
    onClick?: (cvId: number) => void;
    isSelected?: boolean;
}

export function ResumeCard({ resume, onViewDetails, onClick, isSelected }: ResumeCardSummaryProps) {
    const filterUndefined = (value: string | null | undefined) => {
        if (!value || value === 'undefined' || value === 'null') return null;
        return value;
    };

    const topSkills = resume.primary_skills.slice(0, 5);
    const applyJob = filterUndefined(resume.apply_job);

    return (
        <Card
            className={`w-110 h-80 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border bg-gradient-to-br from-white via-gray-50 to-blue-50 cursor-pointer ${isSelected
                ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
                }`}
            onClick={() => onClick?.(resume.id)}
        >
            {/* Header - Giống phần tiêu đề thư xin việc */}
            <CardHeader className="bg-blue-600 text-white px-6 py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-1">{resume.fullname}</h3>
                        {applyJob && (
                            <p className="text-sm italic opacity-90">
                                Ứng tuyển vị trí: <span className="font-semibold">{applyJob}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-80">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(resume.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </CardHeader>

            {/* Nội dung chính - Tóm tắt kinh nghiệm và kỹ năng */}
            <CardContent className="p-6 space-y-5">
                {/* Tổng quan */}
                <div className="text-gray-800 leading-relaxed">
                    <p className="text-base">
                        Ứng viên có tổng cộng{' '}
                        <span className="font-semibold">{resume._count.experiences}</span> kinh nghiệm, tham gia{' '}
                        <span className="font-semibold">{resume._count.projects}</span> dự án, với{' '}
                        <span className="font-semibold">{resume._count.educations}</span> bằng cấp và{' '}
                        <span className="font-semibold">{resume._count.awards}</span> giải thưởng.
                    </p>
                </div>

                {/* Kỹ năng chính */}
                {topSkills.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Kỹ năng nổi bật:</h4>
                        <div className="flex gap-2 overflow-hidden">
                            {topSkills.map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs line-clamp-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                >
                                    {skill}
                                </Badge>
                            ))}
                            {resume.primary_skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                    +{resume.primary_skills.length - 5} thêm
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <Separator className="my-2" />

                {/* Chứng chỉ / Ngôn ngữ / Người tham chiếu */}
                <div className="flex flex-wrap gap-3 text-sm">
                    {resume._count.certificates > 0 && (
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md text-blue-700 font-medium">
                                <FileBadge2 className="w-4 h-4" /> {resume._count.certificates} chứng chỉ
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{`${resume._count.certificates} chứng chỉ chuyên môn`}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {resume._count.languages > 0 && (
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 bg-green-50 border border-green-200 px-3 py-1 rounded-md text-green-700 font-medium">
                                <Globe className="w-4 h-4" /> {resume._count.languages} ngôn ngữ
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{`${resume._count.languages} ngôn ngữ mà ứng viên sử dụng`}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {resume._count.references > 0 && (
                        <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 bg-purple-50 border border-purple-200 px-3 py-1 rounded-md text-purple-700 font-medium">
                                <UserCheck className="w-4 h-4" /> {resume._count.references} người tham chiếu
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{`${resume._count.references} người tham chiếu xác nhận năng lực`}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
