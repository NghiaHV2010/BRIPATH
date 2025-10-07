import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AccountLayout from "../../components/layout/accountLayout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useAuthStore } from "../../store/auth";
import {
  Edit2,
  Save,
  X,
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Upload,
  FileText,
  Download,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserCVs } from "../../api";
import { uploadUserCV } from "../../api/cv_api";
import type { CVRecord } from "../../types/cv";

export default function ProfilePageWrapper() {
  const user = useAuthStore((state) => state.authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    avatar_url: user?.avatar_url || null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // CV Management state
  const [cvData, setCvData] = useState<CVRecord | null>(null);
  const [cvLoading, setCvLoading] = useState(true);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cvFormData, setCvFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    apply_job: "",
    introduction: "",
    primary_skills: [] as string[],
    soft_skills: [] as string[],
  });

  // Load CV data
  useEffect(() => {
    if (user) {
      loadCVData();
    }
  }, [user]);

  const loadCVData = async () => {
    try {
      setCvLoading(true);
      const data = await fetchUserCVs<CVRecord[]>();
      if (data && data.length > 0) {
        setCvData(data[0]); // Only one CV per user
        setCvFormData({
          fullname: data[0].fullname || "",
          email: data[0].email || "",
          phone: data[0].phone || "",
          address: data[0].address || "",
          apply_job: data[0].apply_job || "",
          introduction: data[0].introduction || "",
          primary_skills: data[0].primary_skills || [],
          soft_skills: data[0].soft_skills || [],
        });
      }
    } catch (error) {
      console.error("Error loading CV:", error);
      toast.error("Không thể tải thông tin CV");
    } finally {
      setCvLoading(false);
    }
  };

  const resetUploadState = () => {
    setUploadFile(null);
    setUploadError("");
    setUploadLoading(false);
  };

  if (!user) {
    return (
      <AccountLayout title="Thông tin tài khoản">
        <div className="text-center py-16">
          <p className="mb-4 text-gray-500">
            Bạn cần đăng nhập để xem thông tin tài khoản.
          </p>
          <Button asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      </AccountLayout>
    );
  }

  const address = [
    user.address_street,
    user.address_ward,
    user.address_city,
    user.address_country,
  ]
    .filter(Boolean)
    .join(", ");

  const roleMap = {
    1: "Ứng viên",
    2: "Nhà tuyển dụng",
    3: "Quản trị viên",
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user.username || "",
      avatar_url: user.avatar_url || null,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username || "",
      avatar_url: user.avatar_url || null,
    });
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Call API to update user profile
      console.log("Updating profile:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!", {
        duration: 4000,
        position: "top-right",
      });
      console.error("Error updating profile:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    try {
      // TODO: Call API to change password
      console.log("Changing password...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Đổi mật khẩu thành công!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu!", {
        duration: 4000,
        position: "top-right",
      });
      console.error("Error changing password:", error);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 2MB!", {
          duration: 4000,
          position: "top-right",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh (JPG, PNG)!", {
          duration: 4000,
          position: "top-right",
        });
        return;
      }

      // TODO: Upload file to server and get URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({ ...prev, avatar_url: result }));
        toast.success("Tải ảnh lên thành công!", {
          duration: 3000,
          position: "top-right",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AccountLayout>
      {/* Container thu hẹp cho trang profile */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Quản lý thông tin tài khoản của bạn
                </CardDescription>
              </div>

              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar_url || user.avatar_url ? (
                    <img
                      src={formData.avatar_url || user.avatar_url || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </label>
                  </>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Ảnh đại diện</h3>
                <p className="text-sm text-gray-500">
                  Định dạng JPG, PNG. Tối đa 2MB
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Editable Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Tên người dùng
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="focus:ring-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-900">
                      {user.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <p className="py-2 text-gray-500">
                    {roleMap[user.role_id as keyof typeof roleMap] ||
                      "Ứng viên"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Ngày tham gia
                  </Label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("vi-VN")
                      : "Chưa rõ"}
                  </p>
                </div>
              </div>

              {/* Right Column - Read-only Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <X className="w-3 h-3" /> Không thể chỉnh sửa
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </Label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                  <p className="text-xs text-blue-500">Cập nhật từ CV</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </Label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                    {address || "Chưa cập nhật"}
                  </p>
                  <p className="text-xs text-blue-500">Cập nhật từ CV</p>
                </div>
              </div>
            </div>

            {/* Phần đổi mật khẩu - ở cuối */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Bảo mật</h3>
                  <p className="text-sm text-gray-500">
                    Quản lý mật khẩu của bạn
                  </p>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Đổi mật khẩu
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="max-w-md space-y-4">
                    <input
                      type="password"
                      placeholder="Mật khẩu hiện tại"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Mật khẩu mới"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu mới"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleChangePassword}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Cập nhật mật khẩu
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CV Management Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b mb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  CV & Hồ sơ ứng tuyển
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Quản lý thông tin CV và hồ sơ cá nhân của bạn
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {cvLoading ? (
              // Loading state
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ) : !cvData ? (
              // Empty state with animation
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <DotLottieReact
                    src="/animations/Bouncy Fail.json"
                    loop
                    autoplay
                    className="w-32 h-32"
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có CV nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy tạo hoặc tải CV để hoàn thiện hồ sơ của bạn
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setIsEditingCV(true)}
                    disabled={cvLoading || uploadLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Tự tạo CV
                  </Button>

                  <Dialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        disabled={cvLoading || uploadLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tải CV lên</DialogTitle>
                        <DialogDescription>
                          Chọn file CV của bạn để tải lên hệ thống
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-4">
                        {!uploadFile ? (
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
                            onClick={() =>
                              document.getElementById("cv-upload")?.click()
                            }
                          >
                            <input
                              id="cv-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (!file.name.match(/\.(pdf|docx?)$/i)) {
                                  setUploadError(
                                    "Chỉ chấp nhận file PDF, DOC hoặc DOCX"
                                  );
                                  return;
                                }

                                if (file.size > 10 * 1024 * 1024) {
                                  setUploadError(
                                    "File quá lớn (>10MB). Vui lòng chọn file nhỏ hơn."
                                  );
                                  return;
                                }

                                setUploadFile(file);
                                setUploadError("");
                              }}
                              className="hidden"
                            />

                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-md font-medium mb-2">
                              Chọn file CV
                            </h3>
                            <p className="text-sm text-gray-500">
                              Nhấp để chọn file (PDF, DOC, DOCX - Max 10MB)
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center p-3 bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {uploadFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(uploadFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUploadFile(null);
                                  setUploadError("");
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                disabled={uploadLoading}
                                onClick={async () => {
                                  if (!uploadFile) return;

                                  setUploadLoading(true);
                                  setUploadError("");

                                  try {
                                    await uploadUserCV(uploadFile);
                                    toast.success(
                                      "Upload thành công! Hệ thống sẽ tự động điền thông tin từ CV của bạn."
                                    );
                                    setShowUploadDialog(false);
                                    resetUploadState();
                                    loadCVData(); // Reload CV data
                                  } catch (err) {
                                    const error = err as {
                                      response?: {
                                        data?: { message?: string };
                                      };
                                    };
                                    setUploadError(
                                      error.response?.data?.message ||
                                        "Upload thất bại"
                                    );
                                  } finally {
                                    setUploadLoading(false);
                                  }
                                }}
                              >
                                {uploadLoading ? "Đang tải..." : "Tải lên"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowUploadDialog(false);
                                  resetUploadState();
                                }}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        )}

                        {uploadError && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                            {uploadError}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              // CV exists - display full info
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      ✅ Đã có CV
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {isEditingCV ? (
                      <>
                        <Button
                          onClick={() => {
                            // TODO: Save CV changes
                            setIsEditingCV(false);
                            toast.success("Cập nhật CV thành công!");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Lưu
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingCV(false);
                            // Reset form data
                            setCvFormData({
                              fullname: cvData.fullname || "",
                              email: cvData.email || "",
                              phone: cvData.phone || "",
                              address: cvData.address || "",
                              apply_job: cvData.apply_job || "",
                              introduction: cvData.introduction || "",
                              primary_skills: cvData.primary_skills || [],
                              soft_skills: cvData.soft_skills || [],
                            });
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          disabled={cvLoading || uploadLoading}
                          onClick={() => setIsEditingCV(true)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Sửa
                        </Button>

                        <Dialog
                          open={showUploadDialog}
                          onOpenChange={(open) => {
                            setShowUploadDialog(open);
                            if (!open) resetUploadState();
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              disabled={cvLoading || uploadLoading}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload mới
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Tải CV mới</DialogTitle>
                              <DialogDescription>
                                CV mới sẽ thay thế CV hiện tại
                              </DialogDescription>
                            </DialogHeader>
                            <div className="p-4">
                              {!uploadFile ? (
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
                                  onClick={() =>
                                    document
                                      .getElementById("cv-upload-new")
                                      ?.click()
                                  }
                                >
                                  <input
                                    id="cv-upload-new"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      if (!file.name.match(/\.(pdf|docx?)$/i)) {
                                        setUploadError(
                                          "Chỉ chấp nhận file PDF, DOC hoặc DOCX"
                                        );
                                        return;
                                      }

                                      if (file.size > 10 * 1024 * 1024) {
                                        setUploadError(
                                          "File quá lớn (>10MB). Vui lòng chọn file nhỏ hơn."
                                        );
                                        return;
                                      }

                                      setUploadFile(file);
                                      setUploadError("");
                                    }}
                                    className="hidden"
                                  />

                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                  <h3 className="text-md font-medium mb-2">
                                    Chọn file CV mới
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    File mới sẽ thay thế CV hiện tại (PDF, DOC,
                                    DOCX - Max 10MB)
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center p-3 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {uploadFile.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {(
                                          uploadFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setUploadFile(null);
                                        setUploadError("");
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                                      disabled={uploadLoading}
                                      onClick={async () => {
                                        if (!uploadFile) return;

                                        setUploadLoading(true);
                                        setUploadError("");

                                        try {
                                          await uploadUserCV(uploadFile);
                                          toast.success(
                                            "Thay thế CV thành công! Thông tin mới sẽ được cập nhật tự động."
                                          );
                                          setShowUploadDialog(false);
                                          resetUploadState();
                                          loadCVData(); // Reload CV data
                                        } catch (err) {
                                          const error = err as {
                                            response?: {
                                              data?: { message?: string };
                                            };
                                          };
                                          setUploadError(
                                            error.response?.data?.message ||
                                              "Upload thất bại"
                                          );
                                        } finally {
                                          setUploadLoading(false);
                                        }
                                      }}
                                    >
                                      {uploadLoading
                                        ? "Đang tải..."
                                        : "Thay thế CV"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowUploadDialog(false);
                                        resetUploadState();
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {uploadError && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                                  {uploadError}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          disabled={cvLoading || uploadLoading}
                          onClick={() => {
                            // TODO: Export CV to PDF
                            toast.success("Đang tạo file PDF...");
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* CV Information Display/Edit */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4" />
                        Họ tên
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={cvFormData.fullname}
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              fullname: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border">
                          {cvData.fullname || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={cvFormData.email}
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border">
                          {cvData.email || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={cvFormData.phone}
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border">
                          {cvData.phone || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        Địa chỉ
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={cvFormData.address}
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border">
                          {cvData.address || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4" />
                        Vị trí ứng tuyển
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={cvFormData.apply_job}
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              apply_job: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border">
                          {cvData.apply_job || "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        ⚡ Kỹ năng chuyên môn
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={
                            Array.isArray(cvFormData.primary_skills)
                              ? cvFormData.primary_skills.join(", ")
                              : ""
                          }
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              primary_skills: e.target.value.split(", "),
                            }))
                          }
                          placeholder="VD: React, Node.js, TypeScript"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border text-sm">
                          {Array.isArray(cvData.primary_skills) &&
                          cvData.primary_skills.length > 0
                            ? cvData.primary_skills.join(", ")
                            : "Chưa cập nhật"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        🎯 Kỹ năng mềm
                      </Label>
                      {isEditingCV ? (
                        <Input
                          value={
                            Array.isArray(cvFormData.soft_skills)
                              ? cvFormData.soft_skills.join(", ")
                              : ""
                          }
                          onChange={(e) =>
                            setCvFormData((prev) => ({
                              ...prev,
                              soft_skills: e.target.value.split(", "),
                            }))
                          }
                          placeholder="VD: Teamwork, Leadership, Communication"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-md border text-sm">
                          {Array.isArray(cvData.soft_skills) &&
                          cvData.soft_skills.length > 0
                            ? cvData.soft_skills.join(", ")
                            : "Chưa cập nhật"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience & Education Preview */}
                {!isEditingCV && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid md:grid-cols-2 gap-6">
                      {cvData.experiences && cvData.experiences.length > 0 && (
                        <div>
                          <Label className="text-gray-700 font-medium mb-3 block">
                            💼 Kinh nghiệm làm việc
                          </Label>
                          <div className="space-y-3">
                            {cvData.experiences.slice(0, 2).map((exp) => (
                              <div
                                key={exp.id}
                                className="border-l-2 border-blue-200 pl-4"
                              >
                                <p className="font-medium text-sm">
                                  {exp.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {exp.company_name}
                                </p>
                              </div>
                            ))}
                            {cvData.experiences.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{cvData.experiences.length - 2} kinh nghiệm
                                khác
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {cvData.educations && cvData.educations.length > 0 && (
                        <div>
                          <Label className="text-gray-700 font-medium mb-3 block">
                            🎓 Học vấn
                          </Label>
                          <div className="space-y-2">
                            {cvData.educations.slice(0, 2).map((edu) => (
                              <div key={edu.id}>
                                <p className="font-medium text-sm">
                                  {edu.school}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {edu.graduated_type}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* React Hot Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            maxWidth: "400px",
          },
          success: {
            style: {
              background: "#10B981",
              color: "white",
            },
            iconTheme: {
              primary: "white",
              secondary: "#10B981",
            },
          },
          error: {
            style: {
              background: "#EF4444",
              color: "white",
            },
            iconTheme: {
              primary: "white",
              secondary: "#EF4444",
            },
          },
        }}
      />
    </AccountLayout>
  );
}
