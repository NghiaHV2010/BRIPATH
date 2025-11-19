import { Label } from "@/components/ui/label";
import { Building2, FileCheck, FileText, Users, Globe } from "lucide-react";
import type { UserProfile } from "@/types/profile";

interface CompanyInformationProps {
    userProfileData: UserProfile;
}

const companyTypeMap = {
    business: "Doanh nghiệp",
    business_househole: "Hộ kinh doanh",
};

export const CompanyInformation: React.FC<CompanyInformationProps> = ({ userProfileData }) => {
    if (!userProfileData.companies) return null;

    const { companies } = userProfileData;

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Thông tin doanh nghiệp
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileCheck className="w-4 h-4" />
                        Trạng thái
                    </Label>
                    <p className={`py-2 font-medium ${companies.status === 'approved'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                        }`}>
                        {companies.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </p>
                </div>

                {/* Company Type */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4" />
                        Loại hình
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600 capitalize">
                        {companyTypeMap[companies.company_type as keyof typeof companyTypeMap] || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Mã số thuế
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {companies.fax_code || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Business Certificate */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Giấy phép kinh doanh
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {companies.business_certificate || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Employees */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4" />
                        Số lượng nhân viên
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {companies.employees || "Chưa cập nhật"} nhân viên
                    </p>
                </div>

                {/* Website */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-4 h-4" />
                        Website
                    </Label>
                    <a
                        href={companies.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-50 rounded-md border border-blue-200 text-blue-600 hover:text-blue-700 block truncate"
                    >
                        {companies.company_website || "Chưa cập nhật"}
                    </a>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4" />
                        Lĩnh vực
                    </Label>
                    <p
                        className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600"
                    >
                        {companies.fields?.field_name || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Company Tags */}

                <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-700">Huy hiệu</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {companies.companyTags && companies.companyTags.length > 0 ? (

                            companies.companyTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                >
                                    {tag.tags.label_name}
                                </span>
                            ))

                        ) : (
                            <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                                Không có huy hiệu nào
                            </p>
                        )}
                    </div>
                </div>

                {/* Description (if exists) */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-700">Mô tả công ty</Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {companies.description || "Chưa cập nhật"}
                    </p>
                </div>

            </div>
        </div>
    );
};