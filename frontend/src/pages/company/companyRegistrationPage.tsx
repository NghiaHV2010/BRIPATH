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
import { Textarea } from "../../components/ui/textarea";

import { useNavigate } from "react-router-dom";
import {
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
} from "lucide-react";
import {
  CompanyType,
  type CompanyRegistrationForm,
  type CompanyFormErrors,
} from "../../types/company";
import { createCompany, uploadCompanyFile } from "../../api/company_api";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

const STEPS = [
  {
    id: 1,
    title: "Thông tin cơ bản",
    description: "Tên công ty và địa chỉ liên hệ",
  },
  {
    id: 2,
    title: "Chi tiết công ty",
    description: "Loại hình và quy mô doanh nghiệp",
  },
  {
    id: 3,
    title: "Thông tin bổ sung",
    description: "Mô tả và hình ảnh công ty",
  },
];

export default function CompanyRegistrationPage() {
  const navigate = useNavigate();
  const { authUser, checkAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<CompanyFormErrors>({});

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState({
    business_certificate: false,
    logo: false,
    background: false,
  });

  const [formData, setFormData] = useState<CompanyRegistrationForm>({
    company_name: "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    address_street: "",
    address_ward: "",
    address_city: "",
    address_country: "Việt Nam",
    company_website: "",
    company_type: CompanyType.BUSINESS_HOUSEHOLD,
    employees: undefined,
    fax_code: "",
    business_certificate: "",
    description: "",
    logo_url: "",
    background_url: "",
  });

  const handleInputChange = (
    field: keyof CompanyRegistrationForm,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof CompanyFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    file: File,
    fileType: "business_certificate" | "logo" | "background",
    fieldName: keyof CompanyRegistrationForm
  ) => {
    try {
      setUploadingFiles((prev) => ({ ...prev, [fileType]: true }));

      // Validate file size (5MB for documents, 2MB for images)
      const maxSize =
        fileType === "business_certificate" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeMB = fileType === "business_certificate" ? "5MB" : "2MB";
        toast.error(`Kích thước file không được vượt quá ${sizeMB}!`);
        return;
      }

      // Validate file type
      const allowedTypes =
        fileType === "business_certificate"
          ? [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]
          : ["image/jpeg", "image/png", "image/gif", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        const typeText =
          fileType === "business_certificate"
            ? "PDF, JPG, PNG hoặc DOCX"
            : "JPG, PNG, GIF hoặc WEBP";
        toast.error(`Vui lòng chọn file ${typeText}!`);
        return;
      }

      // Upload file
      const result = await uploadCompanyFile(file, fileType);

      // Update form data with the returned URL
      setFormData((prev) => ({ ...prev, [fieldName]: result.url }));

      // Clear any existing error
      if (errors[fieldName as keyof CompanyFormErrors]) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }

      toast.success("Tải file lên thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Có lỗi xảy ra khi tải file lên. Vui lòng thử lại.");
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: CompanyFormErrors = {};

    if (step === 1) {
      if (!formData.company_name.trim()) {
        newErrors.company_name = "Tên công ty là bắt buộc";
      } else if (formData.company_name.length < 3) {
        newErrors.company_name = "Tên công ty phải có ít nhất 3 ký tự";
      } else if (formData.company_name.length > 150) {
        newErrors.company_name = "Tên công ty không được vượt quá 150 ký tự";
      }

      if (!formData.email?.trim()) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email =
          "Email không đúng định dạng (ví dụ: contact@company.com)";
      } else if (formData.email.length > 50) {
        newErrors.email = "Email không được vượt quá 50 ký tự";
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = "Số điện thoại là bắt buộc";
      } else {
        const cleanPhone = formData.phone.replace(/\D/g, "");
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
          newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
        } else if (!/^(0[3|5|7|8|9])[0-9]{8,9}$/.test(cleanPhone)) {
          newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam";
        }
      }

      if (!formData.address_street.trim()) {
        newErrors.address_street = "Địa chỉ đường phố là bắt buộc";
      } else if (formData.address_street.length > 50) {
        newErrors.address_street = "Địa chỉ không được vượt quá 50 ký tự";
      }

      if (!formData.address_ward.trim()) {
        newErrors.address_ward = "Phường/xã là bắt buộc";
      } else if (formData.address_ward.length > 50) {
        newErrors.address_ward = "Phường/xã không được vượt quá 50 ký tự";
      }

      if (!formData.address_city.trim()) {
        newErrors.address_city = "Tỉnh/thành phố là bắt buộc";
      }
    }

    if (step === 2) {
      // Website là bắt buộc
      if (!formData.company_website?.trim()) {
        newErrors.company_website = "Website công ty là bắt buộc";
      } else {
        const websiteRegex =
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
        if (!websiteRegex.test(formData.company_website)) {
          newErrors.company_website =
            "Website không đúng định dạng (ví dụ: https://www.company.com)";
        }
      }

      // Số lượng nhân viên là bắt buộc
      if (!formData.employees || formData.employees <= 50) {
        newErrors.employees =
          "Số lượng nhân viên là bắt buộc và phải lớn hơn 50";
      }

      // Mã số thuế là bắt buộc
      if (!formData.fax_code?.trim()) {
        newErrors.fax_code = "Mã số thuế là bắt buộc";
      } else {
        const cleanFax = formData.fax_code.replace(/\D/g, "");
        if (cleanFax.length < 6 || cleanFax.length > 10) {
          newErrors.fax_code = "Mã số thuế phải có 6-10 chữ số";
        } else if (!/^[0-9]{6,10}$/.test(cleanFax)) {
          newErrors.fax_code = "Mã số thuế chỉ được chứa số";
        }
      }

      // Giấy phép kinh doanh là bắt buộc
      if (!formData.business_certificate?.trim()) {
        newErrors.business_certificate = "Giấy phép kinh doanh là bắt buộc";
      } else if (formData.business_certificate.length > 255) {
        newErrors.business_certificate =
          "Thông tin giấy phép không được vượt quá 255 ký tự";
      }
    }

    if (step === 3) {
      // Mô tả công ty là bắt buộc
      if (!formData.description?.trim()) {
        newErrors.description = "Mô tả công ty là bắt buộc";
      } else if (formData.description.length < 10) {
        newErrors.description = "Mô tả công ty phải có ít nhất 10 ký tự";
      } else if (formData.description.length > 1000) {
        newErrors.description = "Mô tả công ty không được vượt quá 1000 ký tự";
      }

      // Logo URL là bắt buộc
      if (!formData.logo_url?.trim()) {
        newErrors.logo_url = "Logo công ty là bắt buộc";
      } else {
        const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
        if (!urlRegex.test(formData.logo_url)) {
          newErrors.logo_url =
            "Logo phải là URL hợp lệ (.jpg, .png, .gif, .svg, .webp)";
        }
      }

      // Background URL là bắt buộc
      if (!formData.background_url?.trim()) {
        newErrors.background_url = "Ảnh bìa là bắt buộc";
      } else {
        const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
        if (!urlRegex.test(formData.background_url)) {
          newErrors.background_url =
            "Ảnh bìa phải là URL hợp lệ (.jpg, .png, .gif, .svg, .webp)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setIsValidating(true);

    // Add small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      // Success toast for completed step
      toast.success(`Bước ${currentStep} hoàn thành!`);
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin và thử lại.");
    }

    setIsValidating(false);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);

      const submissionData = {
        ...formData,
        employees: formData.employees || undefined,
      };

      await createCompany(submissionData);

      toast.success(
        "Đăng ký công ty thành công! Chúng tôi sẽ xem xét và phê duyệt trong 1-2 ngày làm việc."
      );

      // Refresh auth to get updated user data with new role
      await checkAuth();

      // Redirect to profile or company dashboard
      navigate("/profile");
    } catch (error: unknown) {
      console.error("Company registration error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Có lỗi xảy ra khi đăng ký công ty. Vui lòng thử lại.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label
                  htmlFor="company_name"
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Tên công ty *
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  placeholder="VD: Công ty TNHH ABC"
                  className={errors.company_name ? "border-red-500" : ""}
                />
                {errors.company_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email liên hệ *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@company.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0123456789"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="address_street"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Địa chỉ đường phố *
                </Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) =>
                    handleInputChange("address_street", e.target.value)
                  }
                  placeholder="123 Đường ABC"
                  className={errors.address_street ? "border-red-500" : ""}
                />
                {errors.address_street && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address_street}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address_ward">Phường/Xã *</Label>
                <Input
                  id="address_ward"
                  value={formData.address_ward}
                  onChange={(e) =>
                    handleInputChange("address_ward", e.target.value)
                  }
                  placeholder="Phường ABC"
                  className={errors.address_ward ? "border-red-500" : ""}
                />
                {errors.address_ward && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address_ward}
                  </p>
                )}
              </div>

              {/* Tỉnh/Thành phố và Quốc gia cùng 1 hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_city">Tỉnh/Thành phố *</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) =>
                      handleInputChange("address_city", e.target.value)
                    }
                    placeholder="TP. Hồ Chí Minh"
                    className={errors.address_city ? "border-red-500" : ""}
                  />
                  {errors.address_city && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address_city}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address_country">Quốc gia *</Label>
                  <Input
                    id="address_country"
                    value={formData.address_country}
                    onChange={(e) =>
                      handleInputChange("address_country", e.target.value)
                    }
                    placeholder="Việt Nam"
                    className={errors.address_country ? "border-red-500" : ""}
                  />
                  {errors.address_country && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address_country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="company_website"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Website công ty *
                </Label>
                <Input
                  id="company_website"
                  value={formData.company_website}
                  onChange={(e) =>
                    handleInputChange("company_website", e.target.value)
                  }
                  placeholder="https://www.company.com"
                  className={errors.company_website ? "border-red-500" : ""}
                />
                {errors.company_website && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.company_website}
                  </p>
                )}
              </div>

              <div>
                <Label>Loại hình doanh nghiệp *</Label>
                <Select
                  value={formData.company_type}
                  onValueChange={(value) =>
                    handleInputChange("company_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CompanyType.BUSINESS_HOUSEHOLD}>
                      Hộ kinh doanh
                    </SelectItem>
                    <SelectItem value={CompanyType.BUSINESS}>
                      Doanh nghiệp
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Số lượng nhân viên *
                </Label>
                <Input
                  type="text"
                  inputMode="numeric" // hiện bàn phím số trên mobile
                  pattern="[0-9]*"
                  min="50"
                  minLength={2}
                  maxLength={6}
                  value={formData.employees || ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value);
                    handleInputChange("employees", value || 0);
                  }}
                  placeholder="VD: 50"
                  className={errors.employees ? "border-red-500" : ""}
                />
                {errors.employees && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.employees}
                  </p>
                )}
              </div>

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
                  placeholder="123456789"
                  className={errors.fax_code ? "border-red-500" : ""}
                />
                {errors.fax_code && (
                  <p className="text-sm text-red-500 mt-1">{errors.fax_code}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="business_certificate">
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
                        handleFileUpload(
                          file,
                          "business_certificate",
                          "business_certificate"
                        );
                      }
                    }}
                    className={
                      errors.business_certificate ? "border-red-500" : ""
                    }
                    disabled={uploadingFiles.business_certificate}
                  />
                  {uploadingFiles.business_certificate && (
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
                    Chấp nhận: PDF, JPG, PNG, DOCX
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Mô tả công ty</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Mô tả ngắn về công ty, lĩnh vực hoạt động, tầm nhìn..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Logo công ty *
                </Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    id="logo_url"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, "logo", "logo_url");
                      }
                    }}
                    className={errors.logo_url ? "border-red-500" : ""}
                    disabled={uploadingFiles.logo}
                  />
                  {uploadingFiles.logo && (
                    <p className="text-sm text-blue-600">Đang tải ảnh lên...</p>
                  )}
                  {formData.logo_url && (
                    <p className="text-sm text-green-600">
                      ✓ Logo đã được tải lên thành công
                    </p>
                  )}
                  {errors.logo_url && (
                    <p className="text-sm text-red-500">{errors.logo_url}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Chấp nhận: JPG, PNG, GIF, WEBP (tối đa 2MB)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="background_url">Ảnh bìa *</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    id="background_url"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, "background", "background_url");
                      }
                    }}
                    className={errors.background_url ? "border-red-500" : ""}
                    disabled={uploadingFiles.background}
                  />
                  {uploadingFiles.background && (
                    <p className="text-sm text-blue-600">Đang tải ảnh lên...</p>
                  )}
                  {formData.background_url && (
                    <p className="text-sm text-green-600">
                      ✓ Ảnh bìa đã được tải lên thành công
                    </p>
                  )}
                  {errors.background_url && (
                    <p className="text-sm text-red-500">
                      {errors.background_url}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Chấp nhận: JPG, PNG, GIF, WEBP (tối đa 2MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Xác nhận thông tin
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • Tên công ty:{" "}
                  <span className="font-medium">{formData.company_name}</span>
                </p>
                <p>
                  • Email: <span className="font-medium">{formData.email}</span>
                </p>
                <p>
                  • Địa chỉ:{" "}
                  <span className="font-medium">
                    {formData.address_street}, {formData.address_ward},{" "}
                    {formData.address_city}, {formData.address_country}
                  </span>
                </p>
                <p>
                  • Loại hình:{" "}
                  <span className="font-medium">
                    {formData.company_type === CompanyType.BUSINESS_HOUSEHOLD
                      ? "Hộ kinh doanh"
                      : "Doanh nghiệp"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng ký tuyển dụng
            </h1>
            <p className="text-gray-600">
              Trở thành nhà tuyển dụng và tìm kiếm ứng viên tài năng
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl">
                Bước {currentStep}: {STEPS[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting || isValidating}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={isValidating || isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 min-w-[120px]"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Kiểm tra...
                      </>
                    ) : (
                      <>
                        Tiếp tục
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isValidating}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center gap-2 min-w-[200px]"
                  >
                    {isSubmitting ? (
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
                )}
              </div>
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
