import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cropImage, getImageDimensions, calculateSquareCropArea, type CropArea, type ImageDimensions } from '@/utils/image-crop';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    onCropComplete: (croppedFile: File) => void;
    aspectRatio?: number; // Width/Height ratio (e.g., 1 for square, 16/9 for landscape, 2.35 for ultra-wide)
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    onClose,
    imageFile,
    onCropComplete,
    aspectRatio = 1 // Default to square (1:1)
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isHoveringCrop, setIsHoveringCrop] = useState(false);

    // Calculate initial crop area based on aspect ratio
    const calculateCropArea = useCallback((dimensions: ImageDimensions): CropArea => {
        if (aspectRatio === 1) {
            // Square crop (original logic)
            return calculateSquareCropArea(dimensions);
        }

        // Calculate crop area based on aspect ratio
        let cropWidth: number;
        let cropHeight: number;

        // Determine if image is wider or taller relative to desired aspect ratio
        const imageRatio = dimensions.width / dimensions.height;

        if (imageRatio > aspectRatio) {
            // Image is wider than desired aspect ratio
            // Use full height and calculate width
            cropHeight = dimensions.height;
            cropWidth = cropHeight * aspectRatio;
        } else {
            // Image is taller than desired aspect ratio
            // Use full width and calculate height
            cropWidth = dimensions.width;
            cropHeight = cropWidth / aspectRatio;
        }

        // Center the crop area
        const x = (dimensions.width - cropWidth) / 2;
        const y = (dimensions.height - cropHeight) / 2;

        return {
            x: Math.max(0, x),
            y: Math.max(0, y),
            width: cropWidth,
            height: cropHeight
        };
    }, [aspectRatio]);

    // Load image when file changes
    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImageUrl(url);

            getImageDimensions(imageFile).then((dimensions) => {
                setImageDimensions(dimensions);
                const initialCrop = calculateCropArea(dimensions);
                setCropArea(initialCrop);
                setScale(1); // Reset scale when new image is loaded
            }).catch((error) => {
                console.error('Error getting image dimensions:', error);
                onClose();
            });

            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile, onClose, calculateCropArea]);

    // Draw image and crop overlay on canvas
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageUrl || !imageDimensions) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image = new Image();
        image.onload = () => {
            const canvasSize = 400;
            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // Calculate scale to fit image in canvas
            const imageScale = Math.min(canvasSize / imageDimensions.width, canvasSize / imageDimensions.height);
            const scaledWidth = imageDimensions.width * imageScale;
            const scaledHeight = imageDimensions.height * imageScale;
            const offsetX = (canvasSize - scaledWidth) / 2;
            const offsetY = (canvasSize - scaledHeight) / 2;

            // Clear canvas
            ctx.clearRect(0, 0, canvasSize, canvasSize);

            // Draw image
            ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

            // Draw crop overlay
            const cropX = offsetX + (cropArea.x * imageScale);
            const cropY = offsetY + (cropArea.y * imageScale);
            const cropWidth = cropArea.width * imageScale;
            const cropHeight = cropArea.height * imageScale;

            // Darken areas outside crop
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // Clear crop area
            ctx.clearRect(cropX, cropY, cropWidth, cropHeight);

            // Redraw image in crop area
            ctx.drawImage(
                image,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                cropX, cropY, cropWidth, cropHeight
            );

            // Draw crop border
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

            // Draw corner handles
            const handleSize = 8;
            ctx.fillStyle = '#3b82f6';
            // Top-left
            ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
            // Top-right
            ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
            // Bottom-left
            ctx.fillRect(cropX - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize);
            // Bottom-right
            ctx.fillRect(cropX + cropWidth - handleSize / 2, cropY + cropHeight - handleSize / 2, handleSize, handleSize);

            // Add drag indicator
            ctx.fillStyle = '#3b82f6';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            const centerX = cropX + cropWidth / 2;
            const centerY = cropY + cropHeight / 2;
            ctx.fillText('Kéo để di chuyển', centerX, centerY + 4);
        };
        image.src = imageUrl;
    }, [imageUrl, imageDimensions, cropArea]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Handle keyboard navigation for crop area
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!imageDimensions || !isOpen) return;

            const moveStep = 10; // Move 10 pixels at a time

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCropArea(prev => ({
                        ...prev,
                        x: Math.max(0, prev.x - moveStep)
                    }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCropArea(prev => ({
                        ...prev,
                        x: Math.min(imageDimensions.width - prev.width, prev.x + moveStep)
                    }));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCropArea(prev => ({
                        ...prev,
                        y: Math.max(0, prev.y - moveStep)
                    }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setCropArea(prev => ({
                        ...prev,
                        y: Math.min(imageDimensions.height - prev.height, prev.y + moveStep)
                    }));
                    break;
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [imageDimensions, isOpen]);

    // Handle mouse events for dragging
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageDimensions) return;

        const rect = canvas.getBoundingClientRect();
        const canvasSize = 400;
        const imageScale = Math.min(canvasSize / imageDimensions.width, canvasSize / imageDimensions.height);
        const scaledWidth = imageDimensions.width * imageScale;
        const scaledHeight = imageDimensions.height * imageScale;
        const offsetX = (canvasSize - scaledWidth) / 2;
        const offsetY = (canvasSize - scaledHeight) / 2;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if mouse is within the crop area
        const cropX = offsetX + (cropArea.x * imageScale);
        const cropY = offsetY + (cropArea.y * imageScale);
        const cropWidth = cropArea.width * imageScale;
        const cropHeight = cropArea.height * imageScale;

        if (mouseX >= cropX && mouseX <= cropX + cropWidth &&
            mouseY >= cropY && mouseY <= cropY + cropHeight) {
            setIsDragging(true);
            setDragStart({
                x: mouseX,
                y: mouseY
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !imageDimensions) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;

        const canvasSize = 400;
        const imageScale = Math.min(canvasSize / imageDimensions.width, canvasSize / imageDimensions.height);

        // Convert canvas delta to image delta
        const imageDeltaX = deltaX / imageScale;
        const imageDeltaY = deltaY / imageScale;

        // Calculate new position with bounds checking
        const newX = Math.max(0, Math.min(imageDimensions.width - cropArea.width, cropArea.x + imageDeltaX));
        const newY = Math.max(0, Math.min(imageDimensions.height - cropArea.height, cropArea.y + imageDeltaY));

        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
        setDragStart({ x: currentX, y: currentY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle hover detection for cursor change
    const handleMouseHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageDimensions) return;

        const rect = canvas.getBoundingClientRect();
        const canvasSize = 400;
        const imageScale = Math.min(canvasSize / imageDimensions.width, canvasSize / imageDimensions.height);
        const scaledWidth = imageDimensions.width * imageScale;
        const scaledHeight = imageDimensions.height * imageScale;
        const offsetX = (canvasSize - scaledWidth) / 2;
        const offsetY = (canvasSize - scaledHeight) / 2;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if mouse is within the crop area
        const cropX = offsetX + (cropArea.x * imageScale);
        const cropY = offsetY + (cropArea.y * imageScale);
        const cropWidth = cropArea.width * imageScale;
        const cropHeight = cropArea.height * imageScale;

        const isOverCrop = mouseX >= cropX && mouseX <= cropX + cropWidth &&
            mouseY >= cropY && mouseY <= cropY + cropHeight;

        setIsHoveringCrop(isOverCrop);
    };

    // Handle zoom/scale change
    const handleScaleChange = (newScale: number[]) => {
        if (!imageDimensions) return;

        const scaleValue = newScale[0];

        // Calculate new dimensions based on aspect ratio and scale
        let newWidth: number;
        let newHeight: number;

        if (aspectRatio === 1) {
            // Square crop
            const minSize = Math.min(imageDimensions.width, imageDimensions.height);
            newWidth = newHeight = minSize / scaleValue;
        } else {
            // Non-square crop
            const imageRatio = imageDimensions.width / imageDimensions.height;

            if (imageRatio > aspectRatio) {
                // Image is wider - use height as reference
                newHeight = imageDimensions.height / scaleValue;
                newWidth = newHeight * aspectRatio;
            } else {
                // Image is taller - use width as reference
                newWidth = imageDimensions.width / scaleValue;
                newHeight = newWidth / aspectRatio;
            }
        }

        setCropArea(prev => {
            const centerX = prev.x + prev.width / 2;
            const centerY = prev.y + prev.height / 2;
            const newX = Math.max(0, Math.min(imageDimensions.width - newWidth, centerX - newWidth / 2));
            const newY = Math.max(0, Math.min(imageDimensions.height - newHeight, centerY - newHeight / 2));

            return {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            };
        });
        setScale(scaleValue);
    };

    // Helper functions for positioning crop area
    const moveCropToLeft = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            x: 0
        }));
    };

    const moveCropToCenter = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            x: (imageDimensions.width - prev.width) / 2,
            y: (imageDimensions.height - prev.height) / 2
        }));
    };

    const moveCropToRight = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            x: imageDimensions.width - prev.width
        }));
    };

    // Helper functions for vertical positioning
    const moveCropToTop = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            y: 0
        }));
    };

    const moveCropToBottom = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            y: imageDimensions.height - prev.height
        }));
    };

    const moveCropCenterVertical = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            y: (imageDimensions.height - prev.height) / 2
        }));
    };

    const moveCropCenterHorizontal = () => {
        if (!imageDimensions) return;
        setCropArea(prev => ({
            ...prev,
            x: (imageDimensions.width - prev.width) / 2
        }));
    };

    // Handle crop completion
    const handleCrop = async () => {
        if (!imageFile) return;

        setIsProcessing(true);
        try {
            // For non-square crops, use appropriate output size
            const outputSize = aspectRatio === 1 ? 300 : Math.max(cropArea.width, cropArea.height);
            const croppedFile = await cropImage(imageFile, cropArea, outputSize);
            onCropComplete(croppedFile);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Get aspect ratio label for display
    const getAspectRatioLabel = () => {
        if (aspectRatio === 1) return 'Vuông (1:1)';
        if (aspectRatio === 16 / 9) return 'Phong cảnh (16:9)';
        if (aspectRatio === 2.35) return 'Siêu rộng (2.35:1)';
        if (aspectRatio === 4 / 3) return 'Tiêu chuẩn (4:3)';
        return `Tùy chỉnh (${aspectRatio.toFixed(2)}:1)`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Cắt ảnh - {getAspectRatioLabel()}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Canvas for image preview and cropping */}
                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <canvas
                                ref={canvasRef}
                                className={`border border-gray-300 rounded-lg ${isDragging ? 'cursor-grabbing' :
                                    isHoveringCrop ? 'cursor-grab' : 'cursor-default'
                                    }`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={(e) => {
                                    handleMouseHover(e);
                                    handleMouseMove(e);
                                }}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={() => {
                                    handleMouseUp();
                                    setIsHoveringCrop(false);
                                }}
                            />
                        </div>
                        {/* Keyboard instruction */}
                        <div className="text-xs text-gray-500 text-center">
                            Sử dụng phím mũi tên ←→↑↓ để di chuyển vùng cắt
                        </div>
                    </div>

                    {/* Zoom slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Thu phóng</label>
                        <div className="flex items-center justify-between text-lg font-bold">
                            <p>+</p>
                            <p>-</p>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={scale}
                            onChange={(e) => handleScaleChange([parseFloat(e.target.value)])}
                            className="w-full h-2 bg-gray-300! rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Position controls */}
                    {imageDimensions && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Vị trí cắt</label>

                            {/* Horizontal positioning */}
                            {(imageDimensions.width > cropArea.width) && (
                                <div className="space-y-2">
                                    <div className="text-xs text-gray-600">Ngang:</div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropToLeft}
                                            className="flex-1"
                                        >
                                            Trái
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropCenterHorizontal}
                                            className="flex-1"
                                        >
                                            Giữa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropToRight}
                                            className="flex-1"
                                        >
                                            Phải
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Vertical positioning */}
                            {(imageDimensions.height > cropArea.height) && (
                                <div className="space-y-2">
                                    <div className="text-xs text-gray-600">Dọc:</div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropToTop}
                                            className="flex-1"
                                        >
                                            Trên
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropCenterVertical}
                                            className="flex-1"
                                        >
                                            Giữa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={moveCropToBottom}
                                            className="flex-1"
                                        >
                                            Dưới
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Center button */}
                            {(imageDimensions.width > cropArea.width || imageDimensions.height > cropArea.height) && (
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={moveCropToCenter}
                                        className="px-6"
                                    >
                                        Căn giữa hoàn toàn
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            Hủy
                        </Button>
                        <Button onClick={handleCrop} disabled={isProcessing}>
                            {isProcessing ? 'Đang xử lý...' : 'Cắt ảnh'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};