import { Briefcase, BookOpen, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

interface JobDescriptionCardProps {
    description?: string;
    education?: string;
    experience?: string;
    job_level?: string;
    skill_tags: string[];
    benefit?: string;
    working_time?: string;
    job_type?: string;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    updated_at?: string;
}

export function JobDescriptionCard({
    description,
    education,
    experience,
    job_level,
    skill_tags,
    benefit,
    working_time,
    job_type,
    start_date,
    end_date,
    created_at,
    updated_at,
}: JobDescriptionCardProps) {
    const formatEducation = (edu: string) => {
        switch (edu) {
            case "bachelor":
                return "Cử nhân";
            case "master":
                return "Thạc sĩ";
            case "phd":
                return "Tiến sĩ";
            case "highschool_graduate":
                return "Tốt nghiệp THPT";
            case "others":
                return "Khác";
            default:
                return edu || "Không yêu cầu";
        }
    };

    const formatJobType = (type: string) => {
        switch (type) {
            case "remote":
                return "Làm việc từ xa";
            case "part_time":
                return "Bán thời gian";
            case "full_time":
                return "Toàn thời gian";
            case "others":
                return "Khác";
            default:
                return type;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Chi tiết tin tuyển dụng
                </h2>

                {description && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Mô tả công việc</h3>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Requirements */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Yêu cầu ứng viên
                    </h3>
                    <div className="space-y-3">
                        {education && (
                            <div>
                                <span className="font-medium text-gray-600">Học vấn: </span>
                                <span>{formatEducation(education)}</span>
                            </div>
                        )}
                        {experience && (
                            <div>
                                <span className="font-medium text-gray-600">Kinh nghiệm: </span>
                                <span>{experience}</span>
                            </div>
                        )}
                        {job_level && (
                            <div>
                                <span className="font-medium text-gray-600">Cấp bậc: </span>
                                <span>{job_level}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                {skill_tags.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Kỹ năng cần có</h3>
                            <div className="flex flex-wrap gap-2">
                                {skill_tags.map((skill, i) => (
                                    <Badge key={i} variant="secondary">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Benefits */}
                {benefit && benefit !== "Không xác định" && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Quyền lợi</h3>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{benefit}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Working Conditions */}
                {(working_time || job_type) && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Thời gian làm việc
                            </h3>
                            <div className="space-y-2">
                                {working_time && working_time !== "Không xác định" && (
                                    <div>
                                        <span className="font-medium text-gray-600">Giờ làm việc: </span>
                                        <span>{working_time}</span>
                                    </div>
                                )}
                                {job_type && (
                                    <div>
                                        <span className="font-medium text-gray-600">Hình thức: </span>
                                        <span>{formatJobType(job_type)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Job Timeline */}
                {(start_date || end_date || created_at || updated_at) && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Thông tin tuyển dụng
                            </h3>
                            <div className="space-y-2">
                                {start_date && (
                                    <div>
                                        <span className="font-medium text-gray-600">Ngày bắt đầu: </span>
                                        <span>{formatDate(start_date)}</span>
                                    </div>
                                )}
                                {end_date && (
                                    <div>
                                        <span className="font-medium text-gray-600">Hạn nộp hồ sơ: </span>
                                        <span>{formatDate(end_date)}</span>
                                    </div>
                                )}
                                {created_at && (
                                    <div>
                                        <span className="font-medium text-gray-600">Ngày đăng tin: </span>
                                        <span>{formatDateTime(created_at)}</span>
                                    </div>
                                )}
                                {updated_at && created_at !== updated_at && (
                                    <div>
                                        <span className="font-medium text-gray-600">Cập nhật cuối: </span>
                                        <span>{formatDateTime(updated_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}