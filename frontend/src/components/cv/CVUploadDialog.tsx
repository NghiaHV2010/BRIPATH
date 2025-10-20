import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadUserCV } from "../../api/cv_api";

interface CVUploadDialogProps {
    trigger?: React.ReactNode;
    onUploadSuccess?: () => void;
    disabled?: boolean;
}

export function CVUploadDialog({
    trigger,
    onUploadSuccess,
    disabled = false
}: CVUploadDialogProps) {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    // Add CSS animation for scanning effect
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scanning {
                0% {
                    transform: translateY(-4px);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(600px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const resetUploadState = () => {
        setUploadFile(null);
        setUploadError("");
        setUploadLoading(false);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
    };

    // Clean up object URL when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const validateFile = (file: File): string | null => {
        if (!file.name.match(/\.(pdf|docx?)$/i)) {
            return "Chỉ chấp nhận file PDF, DOC hoặc DOCX";
        }

        if (file.size > 10 * 1024 * 1024) {
            return "File quá lớn (>10MB). Vui lòng chọn file nhỏ hơn.";
        }

        return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }

        // Clean up previous URL if exists
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
        }

        // Create preview URL for PDF files
        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        }

        setUploadFile(file);
        setUploadError("");
    };

    const handleUpload = async () => {
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
            onUploadSuccess?.();
        } catch (err) {
            const error = err as {
                response?: {
                    data?: { message?: string };
                };
            };
            setUploadError(
                error.response?.data?.message || "Upload thất bại"
            );
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDialogClose = () => {
        setShowUploadDialog(false);
        resetUploadState();
    };

    const handleDialogOpenChange = (open: boolean) => {
        // Prevent closing dialog during upload
        if (!open && uploadLoading) {
            return; // Don't close if uploading
        }

        if (!open) {
            handleDialogClose();
        } else {
            setShowUploadDialog(open);
        }
    };

    return (
        <Dialog open={showUploadDialog} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        disabled={disabled}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="min-w-3xl min-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className={uploadLoading ? 'text-blue-600' : ''}>
                        {uploadLoading ? 'Đang phân tích CV...' : 'Tải CV lên'}
                    </DialogTitle>
                    <DialogDescription>
                        {uploadLoading
                            ? 'Vui lòng đợi trong khi hệ thống phân tích CV của bạn'
                            : 'Chọn file CV của bạn để tải lên hệ thống'
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 max-h-[calc(95vh-120px)] overflow-y-auto">{uploadFile && filePreviewUrl && uploadFile.type === "application/pdf" ? (
                    // PDF view layout
                    <div className="space-y-4">
                        {/* File info header */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{uploadFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setUploadFile(null);
                                    setUploadError("");
                                    if (filePreviewUrl) {
                                        URL.revokeObjectURL(filePreviewUrl);
                                        setFilePreviewUrl(null);
                                    }
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* PDF Preview with scanning animation */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                                {uploadLoading ? (
                                    <>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        Hệ thống đang phân tích CV của bạn...
                                    </>
                                ) : (
                                    "Xem trước CV:"
                                )}
                            </h4>
                            <div className="relative bg-white rounded overflow-hidden shadow-inner">
                                <iframe
                                    src={filePreviewUrl}
                                    width="100%"
                                    height="600px"
                                    style={{ border: "none" }}
                                    title="CV Preview"
                                />

                                {/* Vertical scanning animation overlay */}
                                {uploadLoading && (
                                    <>
                                        {/* Scanning line */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <div
                                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"
                                                style={{
                                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
                                                    animation: 'scanning 3s ease-in-out infinite',
                                                    animationDirection: 'normal'
                                                }}
                                            ></div>
                                        </div>

                                        {/* Analysis status overlay */}
                                        <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-10">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-sm font-medium">Đang phân tích thông tin từ CV...</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Upload controls */}
                        <div className="flex gap-2">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                                disabled={uploadLoading}
                                onClick={handleUpload}
                            >
                                {uploadLoading ? "Đang phân tích và tải lên..." : "Tải lên và phân tích CV"}
                            </Button>
                            <Button variant="outline" onClick={handleDialogClose} disabled={uploadLoading}>
                                {uploadLoading ? "Đang xử lý..." : "Hủy"}
                            </Button>
                        </div>
                    </div>
                ) : !uploadFile ? (
                    <div
                        className="border-2 border-dashed h-100 flex flex-col items-center justify-center border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => document.getElementById("cv-upload")?.click()}
                    >
                        <input
                            id="cv-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-md font-medium mb-2">Chọn file CV</h3>
                        <p className="text-sm text-gray-500">
                            Nhấp để chọn file (PDF, DOC, DOCX - Max 10MB)
                        </p>
                    </div>
                ) : (
                    // Non-PDF files (DOC, DOCX)
                    <div className="space-y-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{uploadFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setUploadFile(null);
                                    setUploadError("");
                                    if (filePreviewUrl) {
                                        URL.revokeObjectURL(filePreviewUrl);
                                        setFilePreviewUrl(null);
                                    }
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
                                onClick={handleUpload}
                            >
                                {uploadLoading ? "Đang tải..." : "Tải lên"}
                            </Button>
                            <Button variant="outline" onClick={handleDialogClose} disabled={uploadLoading}>
                                {uploadLoading ? "Đang xử lý..." : "Hủy"}
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
    );
}