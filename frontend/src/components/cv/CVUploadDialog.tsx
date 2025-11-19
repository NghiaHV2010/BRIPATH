import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, X, CheckCircle2, Loader2, Mail, Phone, MapPin, Briefcase, Award, GraduationCap, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "../ui/card";
import { uploadUserCV } from "../../api/cv_api";

interface CVUploadDialogProps {
    trigger?: React.ReactNode;
    onUploadSuccess?: () => void;
    disabled?: boolean;
}

interface UploadProgress {
    status: 'connected' | 'extracting' | 'formatting' | 'streaming' | 'embedding' | 'saving' | 'complete' | 'error';
    message: string;
    progress: number;
    chunk?: string;
    type?: string;
    data?: any;
}

interface CVData {
    fullname?: string;
    email?: string;
    phone?: string;
    address?: string;
    apply_job?: string;
    career_goal?: string;
    summary?: string;
    primarySkills?: string[];
    softSkills?: string[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    certificates?: any[];
    awards?: any[];
    languages?: any[];
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

    // Real-time progress tracking
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [streamedContent, setStreamedContent] = useState<string>("");
    const [cvData, setCvData] = useState<CVData>({});
    // const [sessionId, setSessionId] = useState<string | null>(null);
    // const [hasParsedCV, setHasParsedCV] = useState(false);
    const [currentStreamingField, setCurrentStreamingField] = useState<string>("");
    const [showCVPreview, setShowCVPreview] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Add CSS animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes shimmer {
                0% {
                    background-position: -1000px 0;
                }
                100% {
                    background-position: 1000px 0;
                }
            }
            
            @keyframes scanningDown {
                0% {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                10% {
                    opacity: 0.8;
                }
                90% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(100vh);
                    opacity: 0;
                }
            }
            
            @keyframes slideInFromRight {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .fade-in-up {
                animation: fadeInUp 0.5s ease-out forwards;
            }
            
            .shimmer {
                animation: shimmer 2s infinite;
                background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                background-size: 1000px 100%;
            }
            
            .scanning-line-down {
                animation: scanningDown 3s ease-in-out infinite;
            }
            
            .slide-in-right {
                animation: slideInFromRight 0.6s ease-out forwards;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Parse streamed JSON progressively and extract current field
    useEffect(() => {
        if (streamedContent) {
            try {
                // Try to detect which field is currently being streamed
                const lastChunk = streamedContent.slice(-100);

                // Detect field names
                if (lastChunk.includes('"fullname"')) setCurrentStreamingField('Họ và tên');
                else if (lastChunk.includes('"email"')) setCurrentStreamingField('Email');
                else if (lastChunk.includes('"phone"')) setCurrentStreamingField('Số điện thoại');
                else if (lastChunk.includes('"address"')) setCurrentStreamingField('Địa chỉ');
                else if (lastChunk.includes('"apply_job"')) setCurrentStreamingField('Vị trí ứng tuyển');
                else if (lastChunk.includes('"primarySkills"')) setCurrentStreamingField('Kỹ năng chính');
                else if (lastChunk.includes('"experiences"')) setCurrentStreamingField('Kinh nghiệm làm việc');
                else if (lastChunk.includes('"educations"')) setCurrentStreamingField('Học vấn');
                else if (lastChunk.includes('"projects"')) setCurrentStreamingField('Dự án');
                else if (lastChunk.includes('"career_goal"')) setCurrentStreamingField('Mục tiêu nghề nghiệp');
                else if (lastChunk.includes('"summary"')) setCurrentStreamingField('Tóm tắt');

                const jsonMatch = streamedContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setCvData(prevData => ({
                        ...prevData,
                        ...parsed
                    }));

                    // Mark as parsed when we have meaningful data
                    // if (parsed.fullname || parsed.email || parsed.apply_job) {
                    //     setHasParsedCV(true);
                    // }
                }
            } catch (error) {
                // Incomplete JSON, wait for more data
                console.log(error);
            }
        }
    }, [streamedContent]);

    const resetUploadState = () => {
        setUploadFile(null);
        setUploadError("");
        setUploadLoading(false);
        setUploadProgress(null);
        setStreamedContent("");
        setCvData({});
        // setSessionId(null);
        // setHasParsedCV(false);
        setCurrentStreamingField("");
        setShowCVPreview(false);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
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

        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
        }

        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        }

        setUploadFile(file);
        setUploadError("");
        setShowCVPreview(false);
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        setUploadLoading(true);
        setUploadError("");
        setStreamedContent("");
        setCvData({});
        // setHasParsedCV(false);
        setCurrentStreamingField("");
        setShowCVPreview(false);

        try {
            // Step 1: Call POST endpoint to start upload
            const uploadResponse = await uploadUserCV(uploadFile);

            // @ts-ignore
            if (!uploadResponse.success) {
                toast.error(uploadResponse.message || "Upload thất bại");
                setUploadError(uploadResponse.message || "Upload thất bại");
                setUploadLoading(false);
                return;
            }

            // @ts-ignore
            const newSessionId = uploadResponse.sessionId;
            // setSessionId(newSessionId);

            // Add a small delay to ensure backend has initialized the session
            await new Promise(resolve => setTimeout(resolve, 850));

            // Step 2: Connect to SSE endpoint for real-time updates
            const token = localStorage.getItem('token');
            const eventSource = new EventSource(
                `${import.meta.env.VITE_BACKEND_URL}/cv/upload/stream?sessionId=${newSessionId}&token=${token}`,
                {
                    withCredentials: true
                }
            );

            eventSourceRef.current = eventSource;

            // Set timeout to prevent hanging connections
            const connectionTimeout = setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    console.error('SSE connection timeout');
                    eventSource.close();
                    setUploadError('Kết nối timeout');
                    toast.error('Kết nối timeout');
                    setUploadLoading(false);
                }
            }, 5 * 60 * 1000); // 5 minutes timeout

            eventSource.onopen = () => {
                console.log('SSE connection opened');
            };

            eventSource.onmessage = (event) => {
                try {
                    const data: UploadProgress = JSON.parse(event.data);
                    console.log('SSE message received:', data.status);
                    setUploadProgress(data);

                    switch (data.status) {
                        case 'connected':
                            console.log('Connected to SSE stream');
                            break;
                        case 'streaming':
                            if (data.chunk) {
                                setStreamedContent(prev => prev + data.chunk);
                            }
                            break;
                        case 'complete':
                            clearTimeout(connectionTimeout);
                            toast.success(data.message);
                            setShowCVPreview(true);
                            setTimeout(() => {
                                setShowUploadDialog(false);
                                resetUploadState();
                                onUploadSuccess?.();
                            }, 3000);
                            eventSource.close();
                            setUploadLoading(false);
                            break;
                        case 'error':
                            clearTimeout(connectionTimeout);
                            setUploadError(data.message);
                            toast.error(data.message);
                            eventSource.close();
                            setUploadLoading(false);
                            break;
                    }
                } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                clearTimeout(connectionTimeout);

                // Only show error if we haven't completed
                if (uploadProgress?.status !== 'complete') {
                    setUploadError('Kết nối bị gián đoạn');
                    toast.error('Kết nối bị gián đoạn');
                }

                eventSource.close();
                setUploadLoading(false);
            };

            // Cleanup function
            return () => {
                clearTimeout(connectionTimeout);
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                }
            };

        } catch (err) {
            const error = err as Error;
            setUploadError(error.message || "Upload thất bại");
            toast.error(error.message || "Upload thất bại");
            setUploadLoading(false);
        }
    };

    const renderCVPreviewCard = () => {
        return (
            <Card className="w-full bg-white shadow-lg slide-in-right">
                <CardContent className="p-6 space-y-4">
                    {/* Success Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-green-200 bg-green-50 -m-6 mb-4 p-4 rounded-t-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-bold text-green-900">Phân tích CV thành công!</h3>
                            <p className="text-sm text-green-700">Dữ liệu đã được trích xuất từ CV của bạn</p>
                        </div>
                    </div>

                    {/* Header Section */}
                    <div className="space-y-2">
                        {cvData.fullname && (
                            <h2 className="text-2xl font-bold text-gray-900 fade-in-up">
                                {cvData.fullname}
                            </h2>
                        )}

                        {cvData.apply_job && (
                            <p className="text-lg text-blue-600 fade-in-up">
                                {cvData.apply_job}
                            </p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {cvData.email && (
                            <div className="flex items-center gap-2 fade-in-up">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{cvData.email}</span>
                            </div>
                        )}

                        {cvData.phone && (
                            <div className="flex items-center gap-2 fade-in-up">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{cvData.phone}</span>
                            </div>
                        )}

                        {cvData.address && (
                            <div className="flex items-center gap-2 fade-in-up">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{cvData.address}</span>
                            </div>
                        )}
                    </div>

                    {/* Career Goal / Summary */}
                    {(cvData.career_goal || cvData.summary) && (
                        <div className="space-y-2 fade-in-up">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Mục tiêu nghề nghiệp</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {cvData.career_goal || cvData.summary}
                            </p>
                        </div>
                    )}

                    {/* Skills */}
                    {cvData.primarySkills && cvData.primarySkills.length > 0 && (
                        <div className="space-y-2 fade-in-up">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                Kỹ năng chính
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {cvData.primarySkills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {cvData.experiences && cvData.experiences.length > 0 && (
                        <div className="space-y-2 fade-in-up">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Kinh nghiệm làm việc
                            </h3>
                            {cvData.experiences.slice(0, 2).map((exp, index) => (
                                <div
                                    key={index}
                                    className="pl-4 border-l-2 border-blue-200 fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <p className="font-medium text-gray-900">{exp.title}</p>
                                    <p className="text-sm text-gray-600">{exp.company}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education */}
                    {cvData.educations && cvData.educations.length > 0 && (
                        <div className="space-y-2 fade-in-up">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-600" />
                                Học vấn
                            </h3>
                            {cvData.educations.slice(0, 2).map((edu, index) => (
                                <div
                                    key={index}
                                    className="pl-4 border-l-2 border-blue-200 fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <p className="font-medium text-gray-900">{edu.school}</p>
                                    <p className="text-sm text-gray-600">{edu.graduate_type}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {cvData.projects && cvData.projects.length > 0 && (
                        <div className="space-y-2 fade-in-up">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Dự án
                            </h3>
                            {cvData.projects.slice(0, 2).map((project, index) => (
                                <div
                                    key={index}
                                    className="pl-4 border-l-2 border-blue-200 fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <p className="font-medium text-gray-900">{project.project_title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog open={showUploadDialog} onOpenChange={(open) => {
            if (!open && uploadLoading) {
                if (!window.confirm('Đang tải lên CV. Bạn có chắc muốn hủy?')) {
                    return;
                }
            }
            setShowUploadDialog(open);
            if (!open) resetUploadState();
        }}>
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
            <DialogContent className="sm:min-w-2xl min-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className={uploadLoading ? 'text-blue-600' : ''}>
                        {uploadLoading ? 'Đang phân tích CV...' : showCVPreview ? 'CV đã được phân tích thành công!' : 'Tải CV lên'}
                    </DialogTitle>
                    <DialogDescription>
                        {uploadLoading
                            ? 'Vui lòng đợi trong khi hệ thống phân tích CV của bạn'
                            : showCVPreview
                                ? 'Xem thông tin đã trích xuất từ CV của bạn'
                                : 'Chọn file CV của bạn để tải lên hệ thống'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {uploadFile ? (
                        <div className="space-y-4 p-4">
                            {/* File info */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{uploadFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                {!uploadLoading && !showCVPreview && (
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
                                )}
                            </div>

                            {/* Progress Bar */}
                            {uploadLoading && uploadProgress && (
                                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-blue-900">Tiến trình xử lý</span>
                                        <span className="text-blue-600">{uploadProgress.progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${uploadProgress.progress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                        {uploadProgress.status === 'complete' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        <span>{uploadProgress.message}</span>
                                    </div>

                                    {/* Streaming message display */}
                                    {uploadProgress.status === 'streaming' && currentStreamingField && (
                                        <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                <p className="text-xs font-medium text-blue-600">
                                                    Đang phân tích: {currentStreamingField}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PDF Preview or CV Preview */}
                            {showCVPreview ? (
                                renderCVPreviewCard()
                            ) : filePreviewUrl ? (
                                <div className="border rounded-lg overflow-hidden bg-white shadow relative">
                                    <iframe
                                        src={filePreviewUrl}
                                        width="100%"
                                        height="500px"
                                        style={{ border: "none" }}
                                        title="CV Preview"
                                    />

                                    {/* Scanning effect overlay */}
                                    {uploadLoading && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            {/* Single scanning line going down */}
                                            <div
                                                className="absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent scanning-line-down"
                                                style={{
                                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
                                                }}
                                            />

                                            {/* Analysis overlay badge */}
                                            <div className="absolute top-4 left-4 right-4 bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-10">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm font-medium flex-1">
                                                    {uploadProgress?.message || 'Đang phân tích CV...'}
                                                </span>
                                                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                                                    {uploadProgress?.progress.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Upload button */}
                            {!showCVPreview && (
                                <div className="flex gap-2">
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                                        disabled={uploadLoading}
                                        onClick={handleUpload}
                                    >
                                        {uploadLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Đang phân tích...
                                            </>
                                        ) : (
                                            "Tải lên và phân tích CV"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed h-96 flex flex-col items-center justify-center border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => document.getElementById("cv-upload")?.click()}
                        >
                            <input
                                id="cv-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Chọn file CV</h3>
                            <p className="text-sm text-gray-500">
                                Nhấp để chọn file (PDF, DOC, DOCX - Max 10MB)
                            </p>
                        </div>
                    )}

                    {uploadError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                            <X className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}