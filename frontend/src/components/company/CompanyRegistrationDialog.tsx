import { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  Briefcase,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { getCompanyFields, registerCompany } from "@/api/company_api";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type {
  CompanyField,
  CompanyRegisterResponse,
  CompanyRegistrationPayload,
} from "@/types/company";
import { storage } from "@/config/firebase.config";
import "react-photo-view/dist/react-photo-view.css";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

interface CompanyRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (res: CompanyRegisterResponse) => void;
}

export default function CompanyRegistrationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CompanyRegistrationDialogProps) {
  const [fields, setFields] = useState<CompanyField[]>([]);
  const [formData, setFormData] = useState<CompanyRegistrationPayload>({
    fax_code: null,
    business_certificate: null,
    company_type: null,
    field: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [error, setError] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (open) loadFields();
  }, [open]);

  const loadFields = async () => {
    setIsLoadingFields(true);
    try {
      const fields = await getCompanyFields();
      setFields(fields);
    } catch (err) {
      setError("Không thể tải danh sách lĩnh vực");
      console.error(err);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleInputChange = (
    field: keyof CompanyRegistrationPayload,
    value: string | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setError("Kích thước tệp vượt quá giới hạn 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // Luu theo ma fax
      const storageRef = ref(
        storage,
        `business_certificate/${formData.fax_code || "temp"}/${Date.now()}_${
          file.name
        }`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          setError("Tải lên thất bại, vui lòng thử lại.");
          setIsUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prev) => ({ ...prev, business_certificate: url }));
          setIsUploading(false);
          setUploadProgress(100);
          setError("");
        }
      );
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải tệp lên Firebase.");
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, business_certificate: null }));
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_type?.trim()) {
      setError("Vui lòng chọn loại hình doanh nghiệp");
      return;
    }
    if (!formData.field?.trim()) {
      setError("Vui lòng chọn lĩnh vực doanh nghiệp");
      return;
    }
    if (!formData.fax_code?.trim()) {
      setError("Vui lòng nhập mã fax");
      return;
    }
    if (!formData.business_certificate?.trim()) {
      setError("Vui lòng tải lên giấy phép kinh doanh");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response: CompanyRegisterResponse = await registerCompany(formData);
      setFormData({
        fax_code: null,
        business_certificate: null,
        company_type: null,
        field: null,
      });
      onSuccess?.(response);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký doanh nghiệp thất bại");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Đăng ký doanh nghiệp
          </DialogTitle>
          <DialogDescription>
            Điền thông tin doanh nghiệp của bạn để hoàn tất đăng ký.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Company Type & Field */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Loại hình doanh nghiệp
              </label>
              <Select
                value={formData.company_type ?? ""}
                onValueChange={(value) =>
                  handleInputChange("company_type", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Doanh nghiệp</SelectItem>
                  <SelectItem value="business_househole">
                    Hộ kinh doanh
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Lĩnh vực doanh nghiệp
              </label>
              <Select
                value={formData.field ?? ""}
                onValueChange={(value) => handleInputChange("field", value)}
                disabled={isLoading || isLoadingFields}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingFields ? "Đang tải..." : "Chọn lĩnh vực"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={String(f.field_name)}>
                      {f.field_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fax Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mã fax
            </label>
            <Input
              type="text"
              value={formData.fax_code ?? ""}
              onChange={(e) =>
                handleInputChange("fax_code", e.target.value ?? null)
              }
              placeholder="Nhập mã fax của doanh nghiệp"
              disabled={isLoading}
            />
          </div>

          {/* Business Certificate Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Giấy phép kinh doanh
            </label>
            {!formData.business_certificate ? (
              <label
                className={`border-2 border-dashed rounded-lg w-full flex flex-col items-center justify-center p-6 cursor-pointer ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600 text-sm mt-2">
                  Chọn file giấy phép kinh doanh
                </span>
                <span className="text-gray-600 text-sm mt-2">
                  (nên chọn định dạng PDF hoặc ảnh)
                </span>
                <input
                  type="file"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                {isUploading && (
                  <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </label>
            ) : (
              <div className="relative border rounded-lg p-2 flex items-center justify-between">
                {formData.business_certificate?.endsWith(".pdf") ? (
                  <div
                    onClick={() =>
                      window.open(formData.business_certificate!, "_blank")
                    }
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition"
                  >
                    <FileText className="w-6 h-6 text-red-500" />
                    <span className="text-sm text-gray-700 truncate max-w-[120px]">
                      Xem giấy phép (PDF)
                    </span>
                  </div>
                ) : (
                  <img
                    width={80}
                    height={80}
                    src={formData.business_certificate!}
                    alt="Business certificate"
                    className="rounded-md object-cover"
                  />
                )}
                <Button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-500 hover:text-red-500"
                  variant="ghost"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium ${
                isLoading || isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isUploading}
              variant="outline"
              className={
                isLoading || isUploading ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              Hủy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
