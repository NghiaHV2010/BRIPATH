import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase.config';
import toast from 'react-hot-toast';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload an avatar image to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user ID for folder organization
 * @returns Promise with upload result containing success status and URL
 */
export const uploadAvatarToFirebase = async (
    file: File,
    userId: string
): Promise<UploadResult> => {
    try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: 'Chỉ hỗ trợ các định dạng: JPG, JPEG, PNG, WEBP'
            };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'Kích thước file không được vượt quá 5MB'
            };
        }

        // Create unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `avatar_${timestamp}.${fileExtension}`;

        // Create storage reference
        const avatarRef = ref(storage, `avatars/${userId}/${fileName}`);

        // Upload file
        const snapshot = await uploadBytes(avatarRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            success: true,
            url: downloadURL
        };

    } catch (error) {
        console.error('Error uploading avatar:', error);
        return {
            success: false,
            error: 'Có lỗi xảy ra khi tải lên ảnh đại diện'
        };
    }
};

/**
 * Handle avatar upload with progress feedback
 * @param file - The image file to upload
 * @param userId - The user ID for folder organization
 * @param onSuccess - Callback function when upload succeeds
 * @param onError - Callback function when upload fails
 */
export const handleAvatarUpload = async (
    file: File,
    userId: string,
    onSuccess: (url: string) => void,
    onError: (error: string) => void
) => {
    const loadingToast = toast.loading('Đang tải lên ảnh đại diện...');

    try {
        const result = await uploadAvatarToFirebase(file, userId);

        toast.dismiss(loadingToast);

        if (result.success && result.url) {
            toast.success('Tải lên ảnh đại diện thành công!');
            onSuccess(result.url);
        } else {
            toast.error(result.error || 'Có lỗi xảy ra khi tải lên');
            onError(result.error || 'Upload failed');
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Có lỗi xảy ra khi tải lên ảnh đại diện');
        onError('Upload failed');
    }
};

