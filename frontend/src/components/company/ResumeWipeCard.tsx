import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { X, Check, Mail, Phone, MapPin, MessageSquare, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { getApplicantByID, updateApplicantStatus, compareCvAndJobStats, type ComparisonStats } from '@/api/company_api';
import type { Resume as ResumeType, ResumeUserAvatar } from '@/types/resume';
import { Resume } from '../resume/resume';
import type { Applicant, ApplicantSummary } from '@/types/applicant';
import { CVJobComparisonChart } from './CVJobComparisonChart';

interface ResumeSwipeCardProps {
    jobId: string;
    applicantsData: Applicant<ApplicantSummary>[];
    onClose?: () => void;
    initialStatus?: 'pending' | 'approved' | 'rejected'; // Add this
}

export const ResumeSwipeCard = ({ jobId, applicantsData, onClose, initialStatus = 'pending' }: ResumeSwipeCardProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'approve' | 'reject' | null>(null);
    const [overlayOpacity, setOverlayOpacity] = useState(0);
    const [currentApplicant, setCurrentApplicant] = useState<Applicant<ResumeType & ResumeUserAvatar> | null>(null);
    const [feedback, setFeedback] = useState('');
    const [comparisonData, setComparisonData] = useState<ComparisonStats | null>(null);
    const [loadingComparison, setLoadingComparison] = useState(false);

    const x = useMotionValue(0);
    const cardRef = useRef(null);
    const controls = useAnimation();

    // Check if current status allows interactions
    const isInteractive = initialStatus === 'pending';

    const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    useEffect(() => {
        if (applicantsData.length === 0) return;
        (async () => {
            try {
                await getApplicantByID(applicantsData[currentIndex].cv_id, initialStatus, jobId).then((data) => {
                    if (data) {
                        setCurrentApplicant(data);
                        setFeedback('');
                    }
                });
            } catch (error) {
                console.error("Error setting current applicant:", error);
            }
        })();
    }, [currentIndex, applicantsData, jobId, initialStatus]);

    useEffect(() => {
        if (!isInteractive) return; // Don't set up swipe listeners for non-pending

        const unsubscribe = x.on('change', (latest) => {
            const absValue = Math.abs(latest);
            const overlayValue = Math.min(absValue / 150, 1);
            setOverlayOpacity(overlayValue);

            if (latest > 50) {
                setSwipeDirection('approve');
            } else if (latest < -50) {
                setSwipeDirection('reject');
            } else {
                setSwipeDirection(null);
            }
        });

        return () => unsubscribe();
    }, [x, isInteractive]);

    // Update the handleDecision function
    const handleDecision = useCallback(async (decision: 'approve' | 'reject') => {
        if (!isInteractive) return; // Prevent actions for non-pending

        const applicant = currentApplicant;
        if (!applicant) return;

        try {
            const status = decision === 'approve' ? 'approved' : 'rejected';

            const result = await updateApplicantStatus([{
                applicant_id: applicant.cv_id,
                job_id: jobId,
                feedback: feedback,
                status: status
            }]);

            if (result.success) {
                if (decision === 'approve') {
                    toast.success(`${applicant.cvs.fullname} đã được chấp nhận!`, {
                        description: `Hồ sơ đã được chấp nhận cho vị trí ${applicant.cvs.apply_job}.`,
                    });
                } else {
                    toast.error(`${applicant.cvs.fullname} đã bị từ chối`, {
                        description: 'Hồ sơ đã được chuyển vào danh sách từ chối.',
                    });
                }

                setTimeout(() => {
                    if (currentIndex < applicantsData.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        controls.set({ x: 0, opacity: 1 });
                        setSwipeDirection(null);
                        setOverlayOpacity(0);
                        setFeedback('');
                    } else {
                        toast.info('Đã xem xét tất cả hồ sơ!', {
                            description: 'Bạn đã xem xét tất cả ứng viên.',
                        });
                        onClose?.();
                    }
                }, 300);
            }
        } catch (error) {
            toast.error('Lỗi khi xử lý quyết định', {
                description: 'Vui lòng thử lại.',
            });
        }
    }, [currentApplicant, jobId, feedback, currentIndex, applicantsData, controls, onClose, isInteractive]);

    const animateSwipe = useCallback(async (direction: 'approve' | 'reject') => {
        if (!isInteractive) return; // Prevent animation for non-pending

        const exitX = direction === 'approve' ? 1000 : -1000;

        await controls.start({
            x: exitX,
            opacity: 0,
            transition: { duration: 0.4, ease: 'easeInOut' },
        });

        handleDecision(direction);
    }, [controls, handleDecision, isInteractive]);

    const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!isInteractive) return; // Prevent drag for non-pending

        const threshold = 150;

        if (Math.abs(info.offset.x) > threshold) {
            const direction = info.offset.x > 0 ? 'approve' : 'reject';
            await animateSwipe(direction);
        } else {
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
            setSwipeDirection(null);
            setOverlayOpacity(0);
        }
    };

    const handleApprove = useCallback(() => {
        if (!currentApplicant || !isInteractive) return;
        animateSwipe('approve');
    }, [animateSwipe, currentApplicant, isInteractive]);

    const handleReject = useCallback(() => {
        if (!currentApplicant || !isInteractive) return;
        animateSwipe('reject');
    }, [animateSwipe, currentApplicant, isInteractive]);

    const handleCompare = async () => {
        if (!currentApplicant) return;

        setLoadingComparison(true);
        try {
            const data = await compareCvAndJobStats(currentApplicant.cv_id, jobId);
            if (data) {
                setComparisonData(data);
            } else {
                toast.error('Không thể tải dữ liệu so sánh');
            }
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu so sánh');
        } finally {
            setLoadingComparison(false);
        }
    };

    // Navigation for non-pending statuses
    const handleNext = useCallback(() => {
        if (currentIndex < applicantsData.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setComparisonData(null);
        }
    }, [currentIndex, applicantsData.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setComparisonData(null);
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isInteractive) {
                // For non-pending, allow arrow navigation
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePrevious();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleNext();
                }
                return;
            }

            // For pending, use Ctrl + arrows for approve/reject
            if (e.ctrlKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                handleReject();
            } else if (e.ctrlKey && e.key === 'ArrowRight') {
                e.preventDefault();
                handleApprove();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleApprove, handleReject, handleNext, handlePrevious, isInteractive]);

    if (!currentApplicant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
                <div className="text-center">
                    <Check className="size-16 text-primary mx-auto mb-6" />
                    <h2 className="text-xl font-bold mb-4">Không có ứng viên nào!</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Bạn đã xem xét tất cả các ứng viên cho vị trí này.
                    </p>
                </div>
            </div>
        );
    }

    // Get status badge component
    const getStatusBadge = () => {
        const statusConfig = {
            pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
            approved: { label: "Đã chấp nhận", className: "bg-green-100 text-green-700 border-green-300" },
            rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-700 border-red-300" }
        };

        const config = statusConfig[initialStatus];
        return (
            <Badge className={`${config.className} border-2 text-sm px-3 py-1`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="flex flex-col h-[95vh]">
            {/* Header */}
            <div className="flex-none py-2">
                <div className="flex items-center justify-center gap-4">
                    <Badge variant="secondary" className="text-md px-4 py-2">
                        {currentIndex + 1} / {applicantsData.length}
                    </Badge>
                    {getStatusBadge()}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-4 overflow-x-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="relative flex items-center justify-center mb-4">
                        {/* Background card */}
                        {currentIndex + 1 < applicantsData.length && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Card className="w-full max-w-3xl h-[550px] transform scale-95 opacity-50" />
                            </div>
                        )}

                        {/* Main Card */}
                        <motion.div
                            ref={cardRef}
                            drag={isInteractive ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={isInteractive ? 0.7 : 0}
                            onDragEnd={isInteractive ? handleDragEnd : undefined}
                            animate={controls}
                            style={{ x, rotate: isInteractive ? rotate : 0, opacity }}
                            className={`w-full max-w-5xl ${isInteractive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                        >
                            <Card className="relative h-full shadow-elegant hover:shadow-hover transition-smooth flex flex-col">
                                {/* Overlays - Only show for pending */}
                                {isInteractive && (
                                    <>
                                        <motion.div
                                            className="absolute inset-0 bg-destructive/90 z-10 flex items-center justify-center pointer-events-none"
                                            style={{ opacity: swipeDirection === 'reject' ? overlayOpacity : 0 }}
                                        >
                                            <div className="transform -rotate-12">
                                                <div className="border-8 border-white rounded-2xl px-12 py-6">
                                                    <X className="w-32 h-32 text-white" strokeWidth={4} />
                                                </div>
                                                <p className="text-white text-4xl font-bold mt-4 text-center">TỪ CHỐI</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="absolute inset-0 bg-green-500/90 z-10 flex items-center justify-center pointer-events-none"
                                            style={{ opacity: swipeDirection === 'approve' ? overlayOpacity : 0 }}
                                        >
                                            <div className="transform rotate-12">
                                                <div className="border-8 border-white rounded-2xl px-12 py-6">
                                                    <Check className="w-32 h-32 text-white" strokeWidth={4} />
                                                </div>
                                                <p className="text-white text-4xl font-bold mt-4 text-center">CHẤP NHẬN</p>
                                            </div>
                                        </motion.div>
                                    </>
                                )}

                                <CardContent className="p-0 flex-1">
                                    <div className="grid md:grid-cols-3 h-full">
                                        {/* Resume */}
                                        <div className="col-span-2 bg-muted/30 border-r p-0">
                                            <div className="flex items-center justify-center min-h-full resume-container">
                                                <Resume
                                                    resume={currentApplicant.cvs}
                                                    avatar_url={currentApplicant.cvs.users.avatar_url}
                                                />
                                            </div>
                                        </div>

                                        {/* Info Panel */}
                                        <div className="col-span-1 p-6 md:p-8 sticky top-0 self-start bg-background h-fit overflow-y-auto">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-1">
                                                        {currentApplicant.cvs.fullname}
                                                    </h2>
                                                    <p className="text-lg text-primary font-semibold">
                                                        {currentApplicant.cvs.apply_job}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Mail className="w-5 h-5 text-primary" />
                                                    <span className="text-sm">{currentApplicant.cvs.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Phone className="w-5 h-5 text-primary" />
                                                    <span className="text-sm">{currentApplicant.cvs.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                    <span className="text-sm">{currentApplicant.cvs.address}</span>
                                                </div>

                                                {/* Feedback - Only for pending */}
                                                {isInteractive && (
                                                    <div
                                                        className="pt-4 border-t"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onTouchStart={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MessageSquare className="w-5 h-5 text-primary" />
                                                            <h4 className="font-semibold text-foreground">Phản hồi</h4>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Nhập phản hồi cho ứng viên (tùy chọn)&#10;Ví dụ: Kỹ năng phù hợp với vị trí, cần cải thiện về..."
                                                            value={feedback}
                                                            onChange={(e) => setFeedback(e.target.value)}
                                                            className="min-h-[120px] resize-none"
                                                            maxLength={500}
                                                        />
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {feedback.length}/500 ký tự
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Show existing feedback for approved/rejected */}
                                                {!isInteractive && currentApplicant.feedback && (
                                                    <div className="pt-4 border-t">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MessageSquare className="w-5 h-5 text-primary" />
                                                            <h4 className="font-semibold text-foreground">Phản hồi đã gửi</h4>
                                                        </div>
                                                        <div className="bg-muted/50 p-3 rounded-lg">
                                                            <p className="text-sm text-foreground">{currentApplicant.feedback}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t">
                                                    {/* Compare Button */}
                                                    <Button
                                                        onClick={handleCompare}
                                                        disabled={loadingComparison}
                                                        className="w-full text-sm sha hover:scale-none cursor-pointer mb-4"
                                                    >
                                                        <BarChart3 className="w-4 h-4 mr-2" />
                                                        {loadingComparison ? 'Đang tải...' : 'So sánh CV với Công việc'}
                                                    </Button>
                                                    {comparisonData && (
                                                        <CVJobComparisonChart
                                                            cvStats={comparisonData.cv}
                                                            jobStats={comparisonData.job}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex-none mt-4">
                {isInteractive ? (
                    // Pending status - show approve/reject buttons
                    <>
                        <div className="flex items-center justify-center gap-8">
                            <Button
                                onClick={handleReject}
                                variant="custom"
                                className="size-16 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X className="size-8 text-white" />
                            </Button>

                            <div className="text-center px-8">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Giữ và kéo sang trái hoặc phải
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Hoặc <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> / <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd>
                                </p>
                            </div>

                            <Button
                                onClick={handleApprove}
                                className="size-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:scale-110 transition-transform"
                            >
                                <Check className="size-8 text-white" />
                            </Button>
                        </div>
                    </>
                ) : (
                    // Approved/Rejected status - show navigation buttons
                    <div className="flex items-center justify-center gap-8">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            variant="outline"
                            className="size-16 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <X className="size-8 rotate-180" />
                        </Button>

                        <div className="text-center px-8">
                            <p className="text-sm text-muted-foreground mb-1">
                                Duyệt qua các ứng viên
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd> / <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> để điều hướng
                            </p>
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={currentIndex === applicantsData.length - 1}
                            variant="outline"
                            className="size-16 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Check className="size-8" />
                        </Button>
                    </div>
                )}

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex gap-2 justify-center">
                        {applicantsData.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all ${idx < currentIndex
                                    ? 'w-8 bg-primary'
                                    : idx === currentIndex
                                        ? 'w-12 bg-primary'
                                        : 'w-8 bg-muted'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeSwipeCard;
