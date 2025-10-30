import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Edit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { handleAvatarUpload } from '@/utils/firebase-upload';
import { updateUserAvatar } from '@/api/user_api';
import { useAuthStore } from '@/store/auth';
import { ImageCropModal } from '../ui/ImageCropModal';
import toast from 'react-hot-toast';

interface CompanyProfileSidebarProps {
    username?: string;
    role?: string;
    avatar?: string;
    navitems?: {
        label: string;
        icon: React.ReactNode;
        href: string;
    }[];
    onLogout?: () => void;
    onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export function ProfileSidebar({
    username = 'Company',
    role = 'Company',
    avatar,
    navitems,
    onLogout,
    onAvatarUpdate,
}: CompanyProfileSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const authUser = useAuthStore((state) => state.authUser);
    const updateUser = useAuthStore((state) => state.updateUser);

    const handleItemClick = (href: string) => {
        navigate(href);
    };

    const isActiveItem = (href: string) => {
        return location.pathname === href;
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !authUser) return;

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
        if (!authUser) return;

        setIsUploading(true);
        setShowCropModal(false);

        try {
            // Upload the cropped image
            await handleAvatarUpload(
                croppedFile,
                authUser.id,
                async (firebaseUrl) => {
                    // Update avatar in database
                    const result = await updateUserAvatar(firebaseUrl);
                    if (result?.success) {
                        // Update local auth state
                        updateUser({ avatar_url: firebaseUrl });
                        // Notify parent component if callback provided
                        onAvatarUpdate?.(firebaseUrl);
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

    return (
        <div className="max-w-64 max-h-[80vh] hidden xl:flex bg-white border rounded-xl border-gray-200 flex-col flex-1 mt-6 sticky top-0 left-0 shadow-sm">
            <div className="p-6 flex flex-col items-center">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4  shadow-md rounded-full">
                        {avatar ? (
                            <AvatarImage src={avatar} alt={username} className='object-contain object-center' />
                        ) : (
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-2xl">
                                {username.charAt(0).toUpperCase()}
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

                <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {username}
                </h2>
                <p className="text-sm text-gray-500 text-center">{role}</p>

                <Button
                    variant='custom'
                    size="default"
                    className="mt-2 text-blue-600 h-auto p-0 hover:scale-none cursor-pointer"
                    onClick={() => navigate('/profile?edit=true')}
                >
                    Chỉnh sửa hồ sơ
                </Button>
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto py-4">
                {navitems?.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => handleItemClick(item.href)}
                        className={cn(
                            'w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                            isActiveItem(item.href)
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <Separator />

            <div className="p-4">
                <Button
                    className="w-full justify-start bg-white text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-none"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                </Button>
            </div>

            {/* Image Crop Modal */}
            <ImageCropModal
                isOpen={showCropModal}
                onClose={handleCropCancel}
                imageFile={selectedImageFile}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
