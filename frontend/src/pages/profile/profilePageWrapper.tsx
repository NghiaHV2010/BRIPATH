import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { ImageCropModal } from "../../components/ui/ImageCropModal";
import { useAuthStore } from "../../store/auth";
import { Edit2, Save, X, User, Calendar, MapPin, Mail, Phone, FileText, Loader, BarChart3, Trash2, Edit, Bookmark, Building2, Briefcase, Camera, Image as ImageIcon, ZoomIn, Shield } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserCVById, fetchUserCVs } from "../../api";
import axiosConfig from "../../config/axios.config";
import { getUserProfile, updateUserProfile, changePassword, updateUserAvatar, type ChangePasswordRequest } from "../../api/user_api";
import { updateCompanyProfile } from "../../api/company_api";
import { handleAvatarUpload } from "@/utils/firebase-upload";
import { Resume } from "../../components/resume/resume";
import type { UpdateUserProfileRequest, UserProfile } from "@/types/profile";
import type { ResumeListItem } from "@/types/resume";
import { ResumeCard } from "@/components/resume/resumeCard";
import { CVStatsRadarChart } from "@/components/resume/resumeStats";
import { CVUploadDialog } from "../../components/cv/CVUploadDialog";
import CompanyRegistrationDialog from "@/components/company/CompanyRegistrationDialog";
import { CompanyInformation } from "@/components/company/CompanyInformation";
import type { CompanyRegisterResponse } from "@/types/company";
import type { Resume as ResumeType } from "@/types/resume";
import { Switch } from "@/components/ui/switch"; // Add Switch component

export default function ProfilePageWrapper() {
  const navigate = useNavigate(); // Initialize hook
  const updateUser = useAuthStore((state) => state.updateUser);
  // const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Background upload states
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null);
  const [showBackgroundCropModal, setShowBackgroundCropModal] = useState(false);

  // Background image preview state
  const [showBackgroundPreview, setShowBackgroundPreview] = useState(false);

  // Company registration dialog
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [hasRegisteredCompany, setHasRegisteredCompany] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    address_street: "",
    address_ward: "",
    address_city: "",
    address_country: "",
    gender: "others",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [cvLoading, setCvLoading] = useState(true);
  const [cvCard, setCvCard] = useState<ResumeListItem[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);

  const [selectedResumeData, setSelectedResumeData] = useState<ResumeType | null>(null);
  const [isLoadingResumeDetail, setIsLoadingResumeDetail] = useState(false);
  const [resumeDetailError, setResumeDetailError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const isCompanyUser = userProfileData?.roles?.role_name === 'Company';

  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userProfileData) {
      loadUserProfileData();
      if (!isCompanyUser) {
        loadCVData();
      }
    }
  }, [userProfileData?.roles?.role_name]);

  const loadUserProfileData = async () => {
    try {
      setIsLoading(true);
      const profileResponse = await getUserProfile();

      if (profileResponse?.success) {
        const userData = profileResponse.data;
        setUserProfileData(userData!);
        setHasRegisteredCompany(!!userData?.company_id);

        setFormData({
          username: userData?.username || "",
          avatar_url: userData?.avatar_url || "",
          address_street: userData?.address_street || "",
          address_ward: userData?.address_ward || "",
          address_city: userData?.address_city || "",
          address_country: userData?.address_country || "",
          gender: userData?.gender || "others",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyRegistrationSuccess = (response: CompanyRegisterResponse) => {
    toast.success(response.message || "Đăng ký doanh nghiệp thành công!", {
      duration: 3000,
      position: "top-right",
    });
    setHasRegisteredCompany(true);
    loadUserProfileData();
    setIsCompanyDialogOpen(false);
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

  const handleResumeCardClick = async (cvId: number) => {
    try {
      setIsLoadingResumeDetail(true);
      const resume = await fetchUserCVById(cvId);
      setSelectedResumeData(resume);
      setSelectedCvId(cvId);
      setShowStats(false);
    } catch (error) {
      setResumeDetailError(typeof error === "string" ? error : (error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải chi tiết CV."));
    } finally {
      setIsLoadingResumeDetail(false);
    }
  };

  const address = [
    userProfileData?.address_street,
    userProfileData?.address_ward,
    userProfileData?.address_city,
    userProfileData?.address_country,
  ]
    .filter(Boolean)
    .join(", ");

  const getTotalPendingApplicants = () => {
    if (!isCompanyUser || !userProfileData?.companies?.jobs) return 0;
    return userProfileData.companies.jobs.reduce((total, job) => total + job._count.applicants, 0);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: userProfileData?.username || "",
      avatar_url: userProfileData?.avatar_url || "",
      address_street: userProfileData?.address_street || "",
      address_ward: userProfileData?.address_ward || "",
      address_city: userProfileData?.address_city || "",
      address_country: userProfileData?.address_country || "",
      gender: userProfileData?.gender || "others",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: userProfileData?.username || "",
      avatar_url: userProfileData?.avatar_url || "",
      address_street: userProfileData?.address_street || "",
      address_ward: userProfileData?.address_ward || "",
      address_city: userProfileData?.address_city || "",
      address_country: userProfileData?.address_country || "",
      gender: userProfileData?.gender || "others",
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

      const updateRequest: UpdateUserProfileRequest = {
        username: formData.username,
        avatar_url: formData.avatar_url,
        address_street: formData.address_street,
        address_ward: formData.address_ward,
        address_city: formData.address_city,
        address_country: formData.address_country,
        gender: formData.gender as 'male' | 'female' | 'others'
      };

      const response = await updateUserProfile(updateRequest);

      if (response?.success) {
        setUserProfileData(response.data!);
        // await checkAuth();
        setIsEditing(false);

        toast.success(
          isCompanyUser
            ? "Cập nhật thông tin công ty thành công! Tọa độ đã được cập nhật."
            : "Cập nhật thông tin thành công!",
          {
            duration: 3000,
            position: "top-right",
          }
        );
      } else {
        throw new Error(response?.message || "Cập nhật thông tin thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin!", {
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

  const handleDeleteCV = (id: number) => {
    setCvToDelete(id.toString());
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteCV = async () => {
    if (!cvToDelete) return;

    try {
      setIsLoading(true);

      const response = await axiosConfig.delete(`/cv/${cvToDelete}`);

      if (response.status === 204) {
        setCvCard(prev => prev.filter(cv => cv.id !== parseInt(cvToDelete)));

        if (selectedCvId === parseInt(cvToDelete)) {
          setSelectedCvId(null);
          setShowStats(false);
        }

        toast.success("Xóa CV thành công!", {
          duration: 3000,
          position: "top-right",
        });
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

  // Avatar upload functions
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfileData) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ các định dạng: JPG, JPEG, PNG, WEBP');
      return;
    }

    // Validate file size (max 10MB before cropping)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Set selected file and show crop modal
    setSelectedImageFile(file);
    setShowCropModal(true);

    // Clear the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!userProfileData) return;

    setIsUploading(true);
    setShowCropModal(false);

    try {
      // Upload the cropped image
      await handleAvatarUpload(
        croppedFile,
        userProfileData.id,
        async (firebaseUrl) => {
          // Update avatar in database
          const result = await updateUserAvatar(firebaseUrl);
          if (result?.success) {
            // Update local auth state
            updateUser({ avatar_url: firebaseUrl });
            // Update form data
            setFormData(prev => ({ ...prev, avatar_url: firebaseUrl }));
            // Update userProfileData if it exists
            if (userProfileData) {
              setUserProfileData(prev => prev ? { ...prev, avatar_url: firebaseUrl } : null);
            }
            toast.success('Cập nhật ảnh đại diện thành công!');
          } else {
            toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
          }
        },
        (error) => {
          toast.error(error);
        }
      );
    } finally {
      setIsUploading(false);
      setSelectedImageFile(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImageFile(null);
  };

  // Background upload functions
  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleBackgroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfileData) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ các định dạng: JPG, JPEG, PNG, WEBP');
      return;
    }

    // Validate file size (max 10MB before cropping)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Set selected file and show crop modal
    setSelectedBackgroundFile(file);
    setShowBackgroundCropModal(true);

    // Clear the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBackgroundCropComplete = async (croppedFile: File) => {
    if (!userProfileData || !userProfileData.company_id) return;

    setIsUploadingBackground(true);
    setShowBackgroundCropModal(false);

    try {
      // Upload the cropped image
      await handleAvatarUpload(
        croppedFile,
        userProfileData.company_id,
        async (firebaseUrl) => {
          // Use the updateCompanyProfile API
          const result = await updateCompanyProfile(userProfileData.company_id!, {
            background_url: firebaseUrl
          });

          if (result?.success) {
            setUserProfileData(prev => prev ? {
              ...prev,
              companies: prev.companies ? { ...prev.companies, background_url: firebaseUrl } : undefined
            } : null);
            toast.success('Cập nhật ảnh bìa thành công!');
          } else {
            toast.error('Có lỗi xảy ra khi cập nhật ảnh bìa');
          }
        },
        (error) => {
          toast.error(error);
        }
      );
    } catch (error: any) {
      console.error('Error updating background:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật ảnh bìa');
    } finally {
      setIsUploadingBackground(false);
      setSelectedBackgroundFile(null);
    }
  };

  const handleBackgroundCropCancel = () => {
    setShowBackgroundCropModal(false);
    setSelectedBackgroundFile(null);
  };

  if (!userProfileData) {
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

  return (
    <AccountLayout>
      {/* Container thu hẹp cho trang profile */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Company Background Banner */}
          {isCompanyUser && (
            <div className="relative w-full h-52 bg-linear-to-r from-blue-600 to-indigo-600 overflow-hidden group">
              {userProfileData.companies?.background_url ? (
                <>
                  <img
                    src={userProfileData.companies.background_url}
                    alt="Company Background"
                    className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setShowBackgroundPreview(true)}
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowBackgroundPreview(true)}
                  >
                    <div className="text-center text-white">
                      <ZoomIn className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Nhấn để xem ảnh</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Chưa có ảnh bìa</p>
                  </div>
                </div>
              )}

              <Button
                size="icon"
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg text-blue-600 z-10"
                onClick={handleBackgroundClick}
                disabled={isUploadingBackground}
              >
                {isUploadingBackground ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>

              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleBackgroundFileChange}
                className="hidden"
              />
            </div>
          )}

          <CardHeader className="bg-linear-to-r from-gray-50 to-indigo-50 border-b">
            <div className="flex justify-between items-center flex-wrap gap-y-4">
              <CardTitle className="text-base text-gray-900 flex items-center gap-8 md:gap-12">

                <div className="xl:hidden">
                  <div className="relative">
                    <Avatar className="size-24 border-4 shadow-md rounded-full flex items-center justify-center">
                      {userProfileData?.avatar_url ? (
                        <AvatarImage
                          src={userProfileData?.avatar_url || undefined}
                          alt={userProfileData?.username}
                          className='object-contain object-center'
                        />
                      ) : (
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xl">
                          {userProfileData.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md text-white"
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Stats based on role */}
                {isCompanyUser ? (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-blue-600 text-4xl font-bold text-center">
                        <Briefcase className="size-8 text-blue-500 block sm:hidden" />
                        {(() => {
                          const count = userProfileData?.companies?.jobs?.length ?? 0;
                          return count < 10 ? `0${count}` : String(count);
                        })()}
                      </span>
                      <p className="hidden sm:block">Tin tuyển dụng</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-orange-600 text-4xl font-bold">
                        <User className="size-8 text-center text-orange-500 block sm:hidden" />
                        {(() => {
                          const count = getTotalPendingApplicants();
                          return count < 10 ? `0${count}` : String(count);
                        })()}
                      </span>
                      <p className="hidden sm:block">Ứng viên chờ</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-blue-600 text-4xl font-bold text-center">
                        <Bookmark className="size-8 text-blue-500 block sm:hidden" />
                        {(() => {
                          const count = userProfileData?._count.savedJobs ?? 0;
                          return count < 10 ? `0${count}` : String(count);
                        })()}
                      </span>
                      <p className="hidden sm:block">Đã lưu</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-blue-600 text-4xl font-bold">
                        <Building2 className="size-8 text-center text-blue-500 block sm:hidden" />
                        {(() => {
                          const count = userProfileData?._count.followedCompanies ?? 0;
                          return count < 10 ? `0${count}` : String(count);
                        })()}
                      </span>
                      <p className="hidden sm:block">Đang theo dõi</p>
                    </div>
                  </>
                )}
              </CardTitle>

              {!isEditing ? (
                <div className="flex gap-2">
                  {!isCompanyUser && (
                    hasRegisteredCompany ? (
                      <Button variant="outline">
                        <Building2 className="w-4 h-4 mr-2" /> Xem thông tin đơn đăng ký
                      </Button>
                    ) : (
                      <Button onClick={() => setIsCompanyDialogOpen(true)}>
                        <Building2 className="w-4 h-4 mr-2" /> Đăng ký doanh nghiệp
                      </Button>
                    )
                  )}
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </div>
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
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    {isCompanyUser ? "Tên công ty" : "Tên người dùng"}
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
                      {userProfileData.username}
                    </p>
                  )}
                </div>

                {/* Modified 2FA Section with proper toggle handling */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-5 h-5 ${userProfileData.is_2fa_enabled ? 'text-green-600' : 'text-gray-500'}`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Xác thực 2 yếu tố (2FA)</p>
                        <p className="text-xs text-gray-500">
                          {userProfileData.is_2fa_enabled ? 'Đang bật - Tài khoản được bảo vệ' : 'Đang tắt - Khuyến nghị bật'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={userProfileData.is_2fa_enabled}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Enable 2FA - Navigate to setup page
                          navigate("/setup-2fa");
                        } else {
                          // Disable 2FA - Navigate to verify page with disable action
                          navigate("/verify-2fa", {
                            state: {
                              action: 'disable',
                              from: '/profile'
                            }
                          });
                        }
                      }}
                    />
                  </div>
                  {userProfileData.is_2fa_enabled && (
                    <p className="text-xs text-green-600 flex items-center gap-1 px-3">
                      <Shield className="w-3 h-3" />
                      Tài khoản của bạn được bảo vệ với lớp bảo mật bổ sung
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Ngày tham gia
                  </Label>
                  <p className="py-2 text-gray-600">
                    {userProfileData.created_at
                      ? new Date(userProfileData.created_at).toLocaleDateString("vi-VN")
                      : "Chưa rõ"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                    {userProfileData.email}
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
                    {userProfileData.phone || "Chưa cập nhật"}
                  </p>
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
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-md border text-gray-600">
                      {address || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Additional Information Component */}
            {isCompanyUser && <CompanyInformation userProfileData={userProfileData} />}

            {/* Password Change Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="hidden sm:block">
                  <h3 className="font-medium text-gray-900">Bảo mật</h3>
                  <p className="text-sm text-gray-500">
                    Quản lý mật khẩu của bạn
                  </p>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-sm bg-blue-600 text-white px-4 py-4 rounded-md hover:bg-blue-700 flex-1 sm:flex-initial"
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

        {/* CV Management Card - Only for regular users */}
        {!isCompanyUser && (
          <Card>
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b mb-4">
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">
                  <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600 hidden sm:block" />
                    Hồ sơ ứng tuyển
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1 hidden sm:block">
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
                        <Trash2
                          className="absolute p-2 right-3 bottom-2 size-10 rounded-full text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer"
                          onClick={() => handleDeleteCV(cv.id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Resume Preview Modal */}
                  <Dialog
                    open={selectedCvId !== null}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedCvId(null);
                        setShowStats(false);
                      }
                    }}
                  >
                    <DialogContent className="max-w-5xl! w-[95%] max-h-[95vh] overflow-y-auto [&>button]:hidden [&>#dialog-close-button]:block p-4">
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

                      {selectedCvId && selectedResumeData && (
                        showStats ? (
                          <CVStatsRadarChart cvId={selectedCvId} />
                        ) : (
                          <Resume
                            resume={selectedResumeData}
                            isLoading={isLoadingResumeDetail}
                            error={resumeDetailError}
                            avatar_url={formData?.avatar_url}
                          />
                        )
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Background Image Preview Dialog */}
      <Dialog open={showBackgroundPreview} onOpenChange={setShowBackgroundPreview}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            <DialogClose asChild>
              <Button
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg text-gray-900 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
            {userProfileData.companies?.background_url && (
              <img
                src={userProfileData.companies.background_url}
                alt="Company Background"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Registration Dialog */}
      <CompanyRegistrationDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        onSuccess={handleCompanyRegistrationSuccess}
      />

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

      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        imageFile={selectedImageFile}
        onCropComplete={handleCropComplete}
      />

      <ImageCropModal
        isOpen={showBackgroundCropModal}
        onClose={handleBackgroundCropCancel}
        imageFile={selectedBackgroundFile}
        onCropComplete={handleBackgroundCropComplete}
        aspectRatio={21 / 9} // Changed from 2.35 to 21/9
      />
    </AccountLayout>
  );
}
