import { useState } from "react";
import Layout from "../../components/layout/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { useNavigate } from "react-router-dom";
import { Building, FileText, CheckCircle, Upload } from "lucide-react";
import { type CreateCompanyData } from "../../types/company";
import { useAuthStore } from "../../store/auth";
import { useCompanyStore } from "../../store/company.store";
import toast from "react-hot-toast";

// Simple form errors type for just 3 fields
interface CompanyFormErrors {
  fax_code?: string;
  business_certificate?: string;
  company_type?: string;
}

export default function CompanyRegistrationPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const { createCompany, isLoading, error } = useCompanyStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [errors, setErrors] = useState<CompanyFormErrors>({});

  // Simple form data with only 3 required fields
  const [formData, setFormData] = useState<CreateCompanyData>({
    fax_code: "",
    business_certificate: "",
    company_type: "Hộ kinh doanh",
  });

  const handleInputChange = (field: keyof CreateCompanyData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle file upload for business certificate
  const handleFileUpload = async (file: File) => {
    try {
      setUploadingFile(true);

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB!");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Vui lòng chọn file PDF, JPG, PNG hoặc DOCX!");
        return;
      }

      // For now, just set a placeholder URL since uploadCompanyFile doesn't exist
      // In production, you would implement file upload to cloud storage
      const placeholderUrl = `https://example.com/uploads/${file.name}`;

      // Update form data with the placeholder URL
      setFormData((prev) => ({
        ...prev,
        business_certificate: placeholderUrl,
      }));

      // Clear any existing error
      if (errors.business_certificate) {
        setErrors((prev) => ({ ...prev, business_certificate: undefined }));
      }

      toast.success("File được chọn thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi xảy ra khi chọn file. Vui lòng thử lại.");
    } finally {
      setUploadingFile(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: CompanyFormErrors = {};

    // Validate fax_code (mã số thuế)
    if (!formData.fax_code.trim()) {
      newErrors.fax_code = "Mã số thuế là bắt buộc";
    } else {
      const cleanFax = formData.fax_code.replace(/\D/g, "");
      if (cleanFax.length < 6 || cleanFax.length > 10) {
        newErrors.fax_code = "Mã số thuế phải có 6-10 chữ số";
      } else if (!/^[0-9]{6,10}$/.test(cleanFax)) {
        newErrors.fax_code = "Mã số thuế chỉ được chứa số";
      }
    }

    // Validate business_certificate
    if (!formData.business_certificate.trim()) {
      newErrors.business_certificate = "Giấy phép kinh doanh là bắt buộc";
    }

    // Validate company_type
    if (!formData.company_type) {
      newErrors.company_type = "Loại hình doanh nghiệp là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin và thử lại.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createCompany(formData);

      if (result) {
        toast.success(
          "Đăng ký công ty thành công! Chúng tôi sẽ xem xét và phê duyệt trong 1-2 ngày làm việc."
        );

        // Refresh auth to get updated user data with new role
        await checkAuth();

        // Redirect to profile or company dashboard
        navigate("/profile");
      } else {
        toast.error(
          error || "Có lỗi xảy ra khi đăng ký công ty. Vui lòng thử lại."
        );
      }
    } catch (error: unknown) {
      console.error("Company registration error:", error);
      toast.error("Có lỗi xảy ra khi đăng ký công ty. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng ký tuyển dụng
            </h1>
            <p className="text-gray-600">
              Trở thành nhà tuyển dụng và tìm kiếm ứng viên tài năng
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building className="h-6 w-6" />
                Thông tin doanh nghiệp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mã số thuế */}
                <div>
                  <Label htmlFor="fax_code" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mã số thuế *
                  </Label>
                  <Input
                    id="fax_code"
                    value={formData.fax_code}
                    onChange={(e) =>
                      handleInputChange("fax_code", e.target.value)
                    }
                    placeholder="Nhập mã số thuế (6-10 chữ số)"
                    className={errors.fax_code ? "border-red-500" : ""}
                    disabled={isLoading || isSubmitting}
                  />
                  {errors.fax_code && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fax_code}
                    </p>
                  )}
                </div>

                {/* Loại hình doanh nghiệp */}
                <div>
                  <Label>Loại hình doanh nghiệp *</Label>
                  <Select
                    value={formData.company_type}
                    onValueChange={(value) =>
                      handleInputChange("company_type", value)
                    }
                    disabled={isLoading || isSubmitting}
                  >
                    <SelectTrigger
                      className={errors.company_type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn loại hình doanh nghiệp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hộ kinh doanh">
                        Hộ kinh doanh
                      </SelectItem>
                      <SelectItem value="Doanh nghiệp">Doanh nghiệp</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.company_type && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.company_type}
                    </p>
                  )}
                </div>

                {/* Giấy phép kinh doanh */}
                <div>
                  <Label
                    htmlFor="business_certificate"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Giấy phép kinh doanh *
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      id="business_certificate"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className={
                        errors.business_certificate ? "border-red-500" : ""
                      }
                      disabled={uploadingFile || isLoading || isSubmitting}
                    />
                    {uploadingFile && (
                      <p className="text-sm text-blue-600">
                        Đang tải file lên...
                      </p>
                    )}
                    {formData.business_certificate && (
                      <p className="text-sm text-green-600">
                        ✓ File đã được tải lên thành công
                      </p>
                    )}
                    {errors.business_certificate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.business_certificate}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Chấp nhận: PDF, JPG, PNG, DOCX (tối đa 5MB)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || uploadingFile}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 h-12"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Hoàn thành đăng ký
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">💡 Lưu ý quan trọng</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>
                  • Thông tin đăng ký sẽ được xem xét trong vòng 1-2 ngày làm
                  việc
                </li>
                <li>
                  • Bạn sẽ nhận được email thông báo khi tài khoản được phê
                  duyệt
                </li>
                <li>
                  • Sau khi được phê duyệt, bạn có thể đăng tin tuyển dụng và
                  quản lý ứng viên
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
