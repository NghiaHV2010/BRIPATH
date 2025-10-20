import { useEffect, useState } from 'react';
import type { Resume as ResumeType, ResumeResponse } from '../../types/resume';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    Mail,
    Phone,
    MapPin,
    Award,
    GraduationCap,
    Briefcase,
    Trophy,
    FileText,
    Globe,
    Target,
    Lightbulb,
    User,
} from 'lucide-react';
import { format } from 'date-fns';
import axiosConfig from '../../config/axios.config';

interface ResumeProps {
    cvId: number;
    avatar_url?: string | null;
}

export function Resume({ cvId, avatar_url }: ResumeProps) {
    const [resume, setResume] = useState<ResumeType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosConfig.get<ResumeResponse>(
                    `/cv/${cvId}`
                );

                if (response.data.success) {
                    setResume(response.data.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch resume');
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, [cvId]);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!resume) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MM/yyyy');
        } catch {
            return dateString;
        }
    };

    const filterUndefined = (value: string | null | undefined) => {
        if (!value || value === 'undefined' || value === 'null') return null;
        return value;
    };

    return (
        <div className="w-full mx-auto bg-white shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                <div className="flex items-center justify-start gap-6 mb-2">
                    <Avatar className="size-32 border-4 border-white shadow-lg">
                        {avatar_url ? (
                            <AvatarImage src={avatar_url} alt={resume.fullname} className='object-cover' />
                        ) : (
                            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                                {resume.fullname?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex flex-col">
                        <div className='flex-1'>
                            <h1 className="text-4xl font-bold">{resume.fullname}</h1>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm mt-4">
                            {resume.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{resume.email}</span>
                                </div>
                            )}
                            {resume.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{resume.phone}</span>
                                </div>
                            )}
                            {resume.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{resume.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 p-8">
                {/* Main Content - Left Side */}
                <div className="flex-1 space-y-8">
                    {filterUndefined(resume.career_goal) && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">MỤC TIÊU NGHỀ NGHIỆP</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{resume.career_goal}</p>
                        </section>
                    )}

                    {filterUndefined(resume.introduction) && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">GIỚI THIỆU BẢN THÂN</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{resume.introduction}</p>
                        </section>
                    )}

                    {resume.experiences && resume.experiences.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">KINH NGHIỆM LÀM VIỆC</h2>
                            </div>
                            <div className="space-y-6">
                                {resume.experiences.map((exp) => (
                                    <div key={exp.id} className="border-l-2 border-blue-600 pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="">
                                                <h3 className="font-semibold text-lg text-gray-900">{exp.title}</h3>
                                                <p className="text-blue-600 font-medium">{exp.company_name}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {formatDate(exp?.start_date || null)}{exp?.start_date && exp?.end_date && ` - `}{exp?.end_date && `${formatDate(exp.end_date)}`}
                                            </p>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.educations && resume.educations.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">HỌC VẤN</h2>
                            </div>
                            <div className="space-y-4">
                                {resume.educations.map((edu) => (
                                    <div key={edu.id} className="border-l-2 border-blue-600 pl-4">
                                        <div className="flex justify-between items-start mb-1 gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">{edu.school}</h3>
                                                <p className="text-gray-700">{edu.graduated_type}</p>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(edu?.start_date || null)}{edu?.start_date && edu?.end_date && ` - `}{edu?.end_date && `${formatDate(edu.end_date)}`}
                                            </p>
                                        </div>
                                        {edu.gpa && <p className="text-gray-700">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.projects && resume.projects.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">DỰ ÁN</h2>
                            </div>
                            <div className="grid gap-4">
                                {resume.projects.map((project) => (
                                    <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">{project.title}</h3>
                                            <span className="text-gray-500 text-sm">
                                                {formatDate(project?.start_date || null)}{project?.start_date && project?.end_date && ` - `}{project?.end_date && `${formatDate(project.end_date)}`}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{project.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.certificates && resume.certificates.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">CHỨNG CHỈ</h2>
                            </div>
                            <div className="space-y-3">
                                {resume.certificates.map((cert) => (
                                    <div key={cert.id} className="border-l-2 border-blue-600 pl-4">
                                        <div className="flex justify-between gap-4 items-start mb-1">
                                            <h3 className="flex-1 font-semibold text-gray-900">{cert.title}</h3>
                                            <span className="text-gray-500 text-sm">
                                                {formatDate(cert?.start_date || null)}{cert?.start_date && cert?.end_date && ` - `}{cert?.end_date && `${formatDate(cert.end_date)}`}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{cert.description}</p>
                                        {filterUndefined(cert.link) && (
                                            <a
                                                href={cert.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Xem chứng chỉ
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.awards && resume.awards.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">GIẢI THƯỞNG</h2>
                            </div>
                            <div className="space-y-3">
                                {resume.awards.map((award) => (
                                    <div key={award.id} className="border-l-2 border-blue-600 pl-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900">{award.title}</h3>
                                            <span className="text-gray-500 text-sm">
                                                {formatDate(award?.start_date || null)}{award?.start_date && award?.end_date && ` - `}{award?.end_date && `${formatDate(award.end_date)}`}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{award.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar - Right Side */}
                <div className="lg:w-60 space-y-6">
                    {resume.primary_skills && resume.primary_skills.length > 0 && (
                        <section className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">KỸ NĂNG CHUYÊN MÔN</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {resume.primary_skills.map((skill, index) => (
                                    <Badge key={index} variant="default" className="text-sm text-green-700 bg-green-100 hover:bg-green-100">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.soft_skills && resume.soft_skills.length > 0 && (
                        <section className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">KỸ NĂNG MỀM</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {resume.soft_skills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-sm">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.languages && resume.languages.length > 0 && (
                        <section className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">NGÔN NGỮ</h2>
                            </div>
                            <div className="space-y-3">
                                {resume.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{lang.name}</span>
                                        <Badge variant="secondary">{lang.level}</Badge>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {resume.references && resume.references.length > 0 && (
                        <section className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900">NGƯỜI THAM CHIẾU</h2>
                            </div>
                            <div className="space-y-4">
                                {resume.references.map((ref) => (
                                    <Card key={ref.id} className="p-4 bg-white">
                                        <h3 className="font-semibold text-gray-900">{ref?.name}</h3>
                                        <Separator className="my-2" />
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>{ref?.phone}</p>
                                            <p>{ref?.email}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
