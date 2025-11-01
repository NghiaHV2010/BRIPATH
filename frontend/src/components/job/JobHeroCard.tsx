import { Calendar, DollarSign, MapPin, Trophy, Users, Heart, Tag } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface JobHeroCardProps {
    job_title: string;
    salary: string;
    location: string;
    experience: string;
    quantity: number;
    end_date?: string;
    jobCategories?: { job_category: string };
    jobLabels?: { label_name?: "Việc gấp" | "Việc Hot" | "Việc chất" | undefined; };
    isApplied: boolean;
    isSaved: boolean;
    applicants?: Array<{ apply_date: string; description?: string }>;
    onApply: () => void;
    onSave: () => void;
}

export function JobHeroCard({
    job_title,
    salary,
    location,
    experience,
    quantity,
    end_date,
    jobCategories,
    jobLabels,
    isApplied,
    isSaved,
    applicants = [],
    onApply,
    onSave,
}: JobHeroCardProps) {
    const formatDeadline = () => {
        if (!end_date) return "Không giới hạn";
        return new Date(end_date).toLocaleDateString("vi-VN");
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">{job_title}</h2>

                    {/* Job Category and Label */}
                    <div className="flex flex-wrap gap-2">
                        {jobCategories && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Tag className="w-3 h-3 mr-1" />
                                {jobCategories.job_category}
                            </Badge>
                        )}
                        {jobLabels && (
                            <Badge
                                variant="secondary"
                                className={
                                    jobLabels.label_name === "Việc gấp"
                                        ? "bg-red-100 text-red-700 border-red-200"
                                        : jobLabels.label_name === "Việc Hot"
                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                            : "bg-green-100 text-green-700 border-green-200"
                                }
                            >
                                {jobLabels.label_name}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                            <div className="text-sm text-gray-500">Mức lương</div>
                            <div className="font-semibold">{salary}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div>
                            <div className="text-sm text-gray-500">Địa điểm</div>
                            <div className="font-semibold">{location}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <div>
                            <div className="text-sm text-gray-500">Kinh nghiệm</div>
                            <div className="font-semibold">{experience}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                            <div className="text-sm text-gray-500">Số lượng</div>
                            <div className="font-semibold">{quantity} người</div>
                        </div>
                    </div>
                </div>

                {/* Deadline */}
                {end_date && (
                    <div className="flex items-center gap-2 text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Hạn nộp hồ sơ: {formatDeadline()}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    {isApplied ? (
                        <div className="relative group flex-1">
                            <Button
                                disabled
                                className="w-full bg-emerald-600 text-white cursor-not-allowed opacity-80 hover:bg-emerald-700"
                            >
                                ✓ Đã ứng tuyển
                            </Button>
                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block z-50">
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                {applicants.map((a, idx) => {
                                    const applyDate = new Date(a.apply_date);
                                    const date = applyDate.toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    });
                                    const time = applyDate.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <div
                                            key={idx}
                                            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 min-w-[280px] border border-gray-200 hover:border-gray-300"
                                        >
                                            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm">
                                                        <span className="text-gray-500">Ngày ứng tuyển:</span>{" "}
                                                        <strong className="text-gray-900 font-semibold">{date}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm">
                                                        <span className="text-gray-500">Thời gian:</span>{" "}
                                                        <strong className="text-gray-900 font-semibold">{time}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                            {a.description && (
                                                <div className="pt-4">
                                                    <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                        Cover letter:
                                                    </div>
                                                    <div className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                                        {a.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <Button onClick={onApply} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Ứng tuyển ngay
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onSave}
                        className={isSaved ? "border-red-500 text-red-500" : ""}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}