// Firebase Avatar Upload Utilities
export {
    uploadAvatarToFirebase,
    handleAvatarUpload,
    type UploadResult
} from './firebase-upload';

// Image Cropping Utilities
export {
    cropImage,
    getImageDimensions,
    calculateSquareCropArea,
    type CropArea,
    type ImageDimensions
} from './image-crop';