import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Check, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { getApplicantByID, updateApplicantStatus } from '@/api/company_api';
import type { Resume as ResumeType, ResumeUserAvatar } from '@/types/resume';
import { Resume } from '../resume/resume';
import type { Applicant, ApplicantSummary } from '@/types/applicant';

interface ResumeSwipeCardProps {
    jobId: string;
    applicantsData: Applicant<ApplicantSummary>[];
}

export const ResumeSwipeCard = ({ jobId, applicantsData }: ResumeSwipeCardProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'approve' | 'reject' | null>(null);
    const [overlayOpacity, setOverlayOpacity] = useState(0);
    const [currentApplicant, setCurrentApplicant] = useState<Applicant<ResumeType & ResumeUserAvatar> | null>(null);

    const x = useMotionValue(0);
    const cardRef = useRef(null);
    const controls = useAnimation();

    const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    useEffect(() => {
        if (applicantsData.length === 0) return;
        (async () => {
            try {
                await getApplicantByID(applicantsData[currentIndex].cv_id, 'pending', jobId).then((data) => {
                    if (data) {
                        setCurrentApplicant(data);
                    }
                });
            } catch (error) {
                console.error("Error setting current applicant:", error);
            }

        })();
    }, [currentIndex, applicantsData]);

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
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
    }, [currentIndex]);

    // Update overlay based on drag
    useEffect(() => {
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
    }, [x]);

    const handleDecision = useCallback(async (decision: 'approve' | 'reject') => {
        const applicant = currentApplicant;
        if (!applicant) return;

        try {
            if (decision === 'approve') {
                await updateApplicantStatus(applicant.cv_id, jobId, '', 'approved');
                toast.success(`${applicant.cvs.fullname} Approved!`, {
                    description: `Resume has been approved for ${applicant.cvs.apply_job}.`,
                });
            } else {
                await updateApplicantStatus(applicant.cv_id, jobId, '', 'rejected');
                toast.error(`${applicant.cvs.fullname} Rejected`, {
                    description: 'Resume has been moved to rejected candidates.',
                });
            }

            // Move to next applicant
            setTimeout(() => {
                if (currentIndex < applicantsData.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    controls.set({ x: 0, opacity: 1 });
                    setSwipeDirection(null);
                    setOverlayOpacity(0);
                } else {
                    toast.info('All resumes reviewed!', {
                        description: 'You have reviewed all applicants.',
                    });
                }
            }, 300);

        } catch (error) {
            toast.error('Error processing decision', {
                description: 'Please try again.',
            });
        }
    }, [currentApplicant, jobId, currentIndex, applicantsData, controls]);

    const animateSwipe = useCallback(async (direction: 'approve' | 'reject') => {
        const exitX = direction === 'approve' ? 1000 : -1000;

        await controls.start({
            x: exitX,
            opacity: 0,
            transition: { duration: 0.4, ease: 'easeInOut' },
        });

        handleDecision(direction);
    }, [controls, handleDecision]);

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const threshold = 150;

        if (Math.abs(info.offset.x) > threshold) {
            const direction = info.offset.x > 0 ? 'approve' : 'reject';
            await animateSwipe(direction);
        } else {
            // Snap back to center
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
            setSwipeDirection(null);
            setOverlayOpacity(0);
        }
    };

    const handleApprove = useCallback(() => {
        if (!currentApplicant) return;
        animateSwipe('approve');
    }, [animateSwipe, currentApplicant]);

    const handleReject = useCallback(() => {
        if (!currentApplicant) return;
        animateSwipe('reject');
    }, [animateSwipe, currentApplicant]);

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
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
    }, [handleApprove, handleReject]);

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

    return (
        <div className="flex flex-col h-[95vh]">
            {/* Header */}
            <div className="flex-none py-2">
                <div className="text-center">
                    <Badge variant="secondary" className="text-md px-4 py-2">
                        {currentIndex + 1} / {applicantsData.length}
                    </Badge>
                </div>
            </div>

            {/* Main Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-4 overflow-x-hidden" >
                <div className="max-w-5xl mx-auto">
                    {/* Swipe Card Container */}
                    <div className="relative flex items-center justify-center mb-4">
                        {/* Background cards (for stacking effect) */}
                        {currentIndex + 1 < applicantsData.length && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Card className="w-full max-w-3xl h-[550px] transform scale-95 opacity-50" />
                            </div>
                        )}

                        {/* Main Swipe Card */}
                        <motion.div
                            ref={cardRef}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            onDragEnd={handleDragEnd}
                            animate={controls}
                            style={{ x, rotate, opacity }}
                            className="w-full max-w-5xl cursor-grab active:cursor-grabbing"
                        >
                            <Card className="relative h-full shadow-elegant hover:shadow-hover transition-smooth flex flex-col">
                                {/* Overlays */}
                                <motion.div
                                    className="absolute inset-0 bg-destructive/90 z-10 flex items-center justify-center"
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
                                    className="absolute inset-0 bg-green-500/90 z-10 flex items-center justify-center"
                                    style={{ opacity: swipeDirection === 'approve' ? overlayOpacity : 0 }}
                                >
                                    <div className="transform rotate-12">
                                        <div className="border-8 border-white rounded-2xl px-12 py-6">
                                            <Check className="w-32 h-32 text-white" strokeWidth={4} />
                                        </div>
                                        <p className="text-white text-4xl font-bold mt-4 text-center">CHẤP NHẬN</p>
                                    </div>
                                </motion.div>

                                {/* Card Content */}
                                <CardContent className="p-0 flex-1">
                                    <div className="grid md:grid-cols-3 h-full">
                                        {/* Left: Resume */}
                                        <div className="col-span-2 bg-muted/30 border-r p-0">
                                            <div className="flex items-center justify-center min-h-full">
                                                <Resume
                                                    resume={currentApplicant.cvs}
                                                    avatar_url={currentApplicant.cvs.users.avatar_url}
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Info */}
                                        <div className="col-span-1 p-6 md:p-8 sticky top-0 self-start bg-background h-fit overflow-y-auto ">
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
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <Briefcase className="w-5 h-5 text-primary" />
                                                    <span className="text-sm">
                                                        {currentApplicant.cvs.experiences?.length} experience
                                                    </span>
                                                </div>

                                                <div className="pt-4 border-t">
                                                    <h4 className="font-semibold mb-3 text-foreground">Education</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {currentApplicant.cvs.educations?.length}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t">
                                                    <h4 className="font-semibold mb-3 text-foreground">Skills</h4>
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
