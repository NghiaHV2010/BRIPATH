/**
 * Image cropping utilities for avatar processing
 */

export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Create a cropped image from a canvas
 * @param imageSrc - Source image URL or File
 * @param cropArea - Crop area coordinates
 * @param outputSize - Output size (square for avatar)
 * @returns Promise<File> - Cropped image as File
 */
export const cropImage = async (
    imageSrc: string | File,
    cropArea: CropArea,
    outputSize: number = 300
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            try {
                // Create canvas for cropping
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Set canvas size to output size (square)
                canvas.width = outputSize;
                canvas.height = outputSize;

                // Draw the cropped portion of the image
                ctx.drawImage(
                    image,
                    cropArea.x,
                    cropArea.y,
                    cropArea.width,
                    cropArea.height,
                    0,
                    0,
                    outputSize,
                    outputSize
                );

                // Convert canvas to blob then to File
                canvas.toBlob((blob) => {
                    if (blob) {
                        const timestamp = Date.now();
                        const file = new File([blob], `cropped_avatar_${timestamp}.png`, {
                            type: 'image/png',
                            lastModified: Date.now()
                        });
                        resolve(file);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                }, 'image/png', 0.95);

            } catch (error) {
                reject(error);
            }
        };

        image.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Load image
        if (typeof imageSrc === 'string') {
            image.src = imageSrc;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    image.src = e.target.result as string;
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(imageSrc);
        }
    });
};

/**
 * Get image dimensions from a file
 * @param file - Image file
 * @returns Promise<ImageDimensions>
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight
            });
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        image.src = url;
    });
};

/**
 * Calculate initial crop area for square cropping (1:1 ratio)
 * @param imageDimensions - Original image dimensions
 * @returns CropArea - Centered square crop area
 */
export const calculateSquareCropArea = (imageDimensions: ImageDimensions): CropArea => {
    const { width, height } = imageDimensions;
    const size = Math.min(width, height);

    return {
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size
    };
};