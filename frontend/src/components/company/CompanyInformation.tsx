import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Globe, Users, FileText, Building2 } from "lucide-react";
import type { UserProfile } from "@/types/profile";

const companyTypeMap = {
    business: "Doanh nghiệp",
    business_househole: "Hộ kinh doanh",
};

interface CompanyInformationProps {
    userProfileData: UserProfile;
    isEditing?: boolean;
    companyFormData?: {
        company_website: string;
        description: string;
        employees: number;
    };
    onCompanyInputChange?: (field: string, value: string | number) => void;
}

export function CompanyInformation({
    userProfileData,
    isEditing = false,
    companyFormData,
    onCompanyInputChange
}: CompanyInformationProps) {
    const company = userProfileData.companies;

    if (!company) {
        return null;
    }

    const formData = isEditing && companyFormData ? companyFormData : {
        company_website: company.company_website || "",
        description: company.description || "",
        employees: company.employees || 0,
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Thông tin doanh nghiệp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Trạng thái
                    </Label>
                    <p className={`py-2 font-medium ${company.status === 'approved'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                        }`}>
                        {company.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </p>
                </div>

                {/* Company Type */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4" />
                        Loại hình
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600 capitalize">
                        {companyTypeMap[company.company_type as keyof typeof companyTypeMap] || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Tax Code */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Mã số thuế
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {company.fax_code || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Business Certificate */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Giấy phép kinh doanh
                    </Label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {company.business_certificate || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Employees */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4" />
                        Số lượng nhân viên
                    </Label>
                    {isEditing && onCompanyInputChange ? (
                        <Input
                            type="number"
                            min="0"
                            value={formData.employees}
                            onChange={(e) => onCompanyInputChange("employees", parseInt(e.target.value) || 0)}
                            className="focus:ring-blue-500"
                        />
                    ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                            {formData.employees || "Chưa cập nhật"} nhân viên
                        </p>
                    )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-4 h-4" />
                        Website
                    </Label>
                    {isEditing && onCompanyInputChange ? (
                        <Input
                            type="url"
                            value={formData.company_website}
                            onChange={(e) => onCompanyInputChange("company_website", e.target.value)}
                            placeholder="https://example.com"
                            className="focus:ring-blue-500"
                        />
                    ) : (
                        <a
                            href={company.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-50 rounded-md border border-blue-200 text-blue-600 hover:text-blue-700 block truncate"
                        >
                            {company.company_website || "Chưa cập nhật"}
                        </a>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4" />
                        Lĩnh vực
                    </Label>
                    <p
                        className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600"
                    >
                        {company.fields?.field_name || "Chưa cập nhật"}
                    </p>
                </div>

                {/* Company Tags */}

                <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-700">Huy hiệu</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {company.companyTags && company.companyTags.length > 0 ? (

                            company.companyTags.map((tag, index) => (
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
                    {isEditing && onCompanyInputChange ? (
                        <Textarea
                            value={formData.description}
                            onChange={(e) => onCompanyInputChange("description", e.target.value)}
                            placeholder="Nhập mô tả về công ty..."
                            className="focus:ring-blue-500 min-h-[120px]"
                            rows={5}
                        />
                    ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600 whitespace-pre-wrap">
                            {formData.description || "Chưa có mô tả"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}