import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useAuthStore } from "../../store/auth";
import { Edit2, Save, X, User, Calendar, MapPin, Mail, Phone, FileText, Loader, BarChart3, Trash2 } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserCVs } from "../../api";
import axiosConfig from "../../config/axios.config";
import { getUserProfile, updateUserProfile, changePassword, type ChangePasswordRequest } from "../../api/user_api";
import { AvatarFallback } from "../../components/ui/avatar";
import { Resume } from "../../components/resume/resume";
import type { UpdateUserProfileRequest, UserProfile } from "@/types/profile";
import type { ResumeListItem } from "@/types/resume";
import { ResumeCard } from "@/components/resume/resumeCard";
import { CVStatsRadarChart } from "@/components/resume/resumeStats";
import FollowedCompanies from "@/components/profile/FollowedCompanies";
import { CVUploadDialog } from "../../components/cv/CVUploadDialog";

export default function ProfilePageWrapper() {

  const user = useAuthStore((state) => state.authUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    avatar_url: user?.avatar_url || "",
    address_street: user?.address_street || "",
    address_ward: user?.address_ward || "",
    address_city: user?.address_city || "",
    address_country: user?.address_country || "",
    gender: user?.gender || "others",  //'male' | 'female' | 'others'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [cvLoading, setCvLoading] = useState(true);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [cvCard, setCvCard] = useState<ResumeListItem[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);

  // Check URL parameters for edit mode
  const [searchParams] = useSearchParams();

  // Set default editing state based on URL parameter
  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserProfileData();
      loadCVData();
    }
  }, [user]);

  const loadUserProfileData = async () => {
    try {
      setIsLoading(true);
      const profileResponse = await getUserProfile();

      if (profileResponse?.success) {
        const userData = profileResponse.data;
        setUserProfileData(userData);

        // Update form data with fetched user data
        setFormData({
          username: userData.username || "",
          avatar_url: userData.avatar_url || "",
          address_street: userData.address_street || "",
          address_ward: userData.address_ward || "",
          address_city: userData.address_city || "",
          address_country: userData.address_country || "",
          gender: userData.gender || "others",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCVData = async () => {
    try {
      setCvLoading(true);
      const data = await fetchUserCVs();
      if (data && data.length > 0) {
        setCvCard(data);
      }
    } catch (error) {
      console.error("Error loading CV:", error);
      toast.error("Không thể tải thông tin CV");
    } finally {
      setCvLoading(false);
    }
  };

  const handleResumeCardClick = (cvId: number) => {
    setSelectedCvId(cvId);
    setShowStats(false); // Reset to show CV by default when switching
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
      username: userProfileData?.username || user?.username || "",
      avatar_url: userProfileData?.avatar_url || user?.avatar_url || "",
      address_street: userProfileData?.address_street || user?.address_street || "",
      address_ward: userProfileData?.address_ward || user?.address_ward || "",
      address_city: userProfileData?.address_city || user?.address_city || "",
      address_country: userProfileData?.address_country || user?.address_country || "",
      gender: userProfileData?.gender || user?.gender || "others",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: userProfileData?.username || user?.username || "",
      avatar_url: userProfileData?.avatar_url || user?.avatar_url || "",
      address_street: userProfileData?.address_street || user?.address_street || "",
      address_ward: userProfileData?.address_ward || user?.address_ward || "",
      address_city: userProfileData?.address_city || user?.address_city || "",
      address_country: userProfileData?.address_country || user?.address_country || "",
      gender: userProfileData?.gender || user?.gender || "others",
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
      setIsLoading(true);

      // Prepare the update request
      const updateRequest: UpdateUserProfileRequest = {
        username: formData.username,
        avatar_url: formData.avatar_url,
        address_street: formData.address_street,
        address_ward: formData.address_ward,
        address_city: formData.address_city,
        address_country: formData.address_country,
        gender: formData.gender as 'male' | 'female' | 'others'
      };

      console.log("Updating profile:", updateRequest);

      // Call the API to update user profile
      const response = await updateUserProfile(updateRequest);

      if (response?.success) {
        // Update local user profile data
        setUserProfileData(response.data);

        // Refresh auth user data
        await checkAuth();

        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
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

    if (passwordData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    try {
      setIsLoading(true);

      const changePasswordRequest: ChangePasswordRequest = {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await changePassword(changePasswordRequest);

      if (response?.success) {
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success(response.message || "Đổi mật khẩu thành công!", {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi đổi mật khẩu!", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
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

  const handleDeleteCV = (id: number) => {
    setCvToDelete(id.toString());
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteCV = async () => {
    if (!cvToDelete) return;

    try {
      setIsLoading(true);

      // Call delete API using axiosConfig
      const response = await axiosConfig.delete(`/cv/${cvToDelete}`);

      // Check for 204 No Content status
      if (response.status === 204) {
        // Remove CV from local state
        setCvCard(prev => prev.filter(cv => cv.id !== parseInt(cvToDelete)));

        // Close dialog if deleted CV was being viewed
        if (selectedCvId === parseInt(cvToDelete)) {
          setSelectedCvId(null);
          setShowStats(false);
        }

      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Không thể xóa CV. Vui lòng thử lại!", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
      setCvToDelete(null);
    }
  };

  return (
    <AccountLayout>
      {/* Container thu hẹp cho trang profile */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base text-gray-900 flex items-center gap-12">
                <div className="flex flex-col items-center">
                  <span className="text-blue-600 text-4xl font-bold">
                    {(() => {
                      const count = userProfileData?._count.savedJobs ?? 0;
                      return count < 10 ? `0${count}` : String(count);
                    })()}
                  </span>
                  Đã lưu
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-blue-600 text-4xl font-bold">
                    {(() => {
                      const count = userProfileData?._count.followedCompanies ?? 0;
                      return count < 10 ? `0${count}` : String(count);
                    })()}
                  </span>
                  Đang theo dõi
                </div>
              </CardTitle>

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
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">

            {/* Form Fields */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add code for user's profile data here */}
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
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <Input
                          id="address_street"
                          type="text"
                          placeholder="Đường..."
                          value={formData.address_street}
                          onChange={(e) =>
                            handleInputChange("address_street", e.target.value)
                          }
                          className="focus:ring-blue-500"
                        />
                        <Input
                          id="address_ward"
                          type="text"
                          placeholder="Phường..."
                          value={formData.address_ward}
                          onChange={(e) =>
                            handleInputChange("address_ward", e.target.value)
                          }
                          className="focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="address_city"
                          type="text"
                          placeholder="Thành phố..."
                          value={formData.address_city}
                          onChange={(e) =>
                            handleInputChange("address_city", e.target.value)
                          }
                          className="focus:ring-blue-500"
                        />
                        <Input
                          id="address_country"
                          type="text"
                          placeholder="Quốc gia..."
                          value={formData.address_country}
                          onChange={(e) =>
                            handleInputChange("address_country", e.target.value)
                          }
                          className="focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )
                    : (
                      <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                        {address || "Chưa cập nhật"}
                      </p>
                    )}
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
            <div className="w-full flex items-center justify-between">
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  CV & Hồ sơ ứng tuyển
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Quản lý thông tin CV và hồ sơ cá nhân của bạn
                </CardDescription>
              </div>
              <div className="flex gap-3 justify-center">
                <CVUploadDialog
                  disabled={cvLoading}
                  onUploadSuccess={loadCVData}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {cvLoading ? (
              // Loading state
              <div className="animate-pulse space-y-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : !cvCard || cvCard.length === 0 ? (
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
                  Chưa có Hồ Sơ nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Đăng tải CV để hoàn thiện hồ sơ của bạn
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvCard.map((cv) => (
                    <div className="relative" key={cv.id}>
                      <ResumeCard
                        resume={cv}
                        onClick={handleResumeCardClick}
                        isSelected={selectedCvId === cv.id}
                      />
                      <Trash2 className="absolute p-2 right-3 bottom-2 size-10 rounded-full text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer" onClick={() => handleDeleteCV(cv.id)} />
                    </div>
                  ))}
                </div>

                {/* Resume Preview Modal */}
                <Dialog
                  open={selectedCvId !== null}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedCvId(null);
                      setShowStats(false); // Reset stats view when closing
                    }
                  }}
                >
                  <DialogContent className="!max-w-5xl w-[95%] max-h-[95vh] overflow-y-auto [&>button]:hidden [&>#dialog-close-button]:block p-4">
                    <div className="flex w-full sticky top-0 justify-between items-center bg-slate-100 shadow-md z-50 px-4 py-2 rounded-xl">
                      <DialogHeader>
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col">
                            <DialogTitle>
                              {showStats ? "Thống kê CV" : "Xem trước CV"}
                            </DialogTitle>
                            <DialogDescription>
                              {showStats ? "Xem chi tiết thống kê kỹ năng của CV" : "Xem trước nội dung CV đã tải lên"}
                            </DialogDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowStats(!showStats)}
                            className="flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            {showStats ? "Xem CV" : "Xem thống kê"}
                          </Button>
                        </div>
                      </DialogHeader>

                      <DialogClose id="dialog-close-button" asChild className="bg-red-100 text-center flex justify-center items-center size-10">
                        <button
                          className="text-red-500 hover:text-red-700 hover:bg-red-200 rounded-full p-2 transition-colors"
                          aria-label="Đóng"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </DialogClose>
                    </div>

                    {selectedCvId && (
                      showStats ? (
                        <CVStatsRadarChart cvId={selectedCvId} />
                      ) : (
                        <Resume cvId={selectedCvId} avatar_url={formData?.avatar_url} />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
        <FollowedCompanies />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa CV</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa CV này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmation(false);
                setCvToDelete(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteCV}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa CV"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
