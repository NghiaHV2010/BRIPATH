import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Briefcase, Code, Scan, User, Mail, Phone, MapPin } from 'lucide-react';

export const CVPreview = () => {
    const containerRef = React.useRef(null);
    const isInView = useInView(containerRef, { amount: 0.3, once: true });

    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (isInView && scanStatus === 'idle') {
            const timer = setTimeout(() => {
                setScanStatus('scanning');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isInView, scanStatus]);

    useEffect(() => {
        if (scanStatus === 'scanning') {
            const timer = setTimeout(() => {
                setScanStatus('complete');
                setTimeout(() => setIsFlipped(true), 500);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [scanStatus]);

    return (
        // Added aspect-[9/16] and max-w-sm to constrain the shape
        <div ref={containerRef} className="relative w-full h-full perspective-1000">
            <motion.div
                className="relative w-full h-full transition-all duration-1000 transform-style-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* Front Side: Raw CV */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl overflow-hidden shadow-inner flex flex-col text-xs md:text-sm">
                    {/* CV Header */}
                    <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600 relative p-6 text-white flex items-end shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">NGUYỄN VĂN A</h2>
                            <p className="text-sm opacity-90">Senior Frontend Engineer</p>
                        </div>
                    </div>

                    {/* CV Body - Adjusted layout for vertical ratio */}
                    <div className="p-6 flex flex-col gap-6 flex-1 bg-gray-50 overflow-hidden">
                        {/* Contact Info */}
                        <div className="space-y-4 border-b border-gray-200 pb-4">
                            <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                                <User size={14} /> LIÊN HỆ
                            </h3>
                            <div className="text-xs space-y-1.5 text-gray-600">
                                <p className="flex items-center gap-2"><Phone size={12} /> 0123456789</p>
                                <p className="flex items-center gap-2"><Mail size={12} /> email@example.com</p>
                                <p className="flex items-center gap-2"><MapPin size={12} /> TP. Hồ Chí Minh</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2 border-b border-gray-200 pb-4">
                            <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                                <Code size={14} /> KỸ NĂNG
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind'].map(skill => (
                                    <span key={skill} className="text-[10px] px-2 py-0.5 bg-blue-100 rounded text-blue-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-2 flex-1">
                            <h3 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                                <Briefcase size={14} /> KINH NGHIỆM
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-sm">FPT Software</h4>
                                    <p className="text-[10px] text-gray-500 mb-1">Senior Dev • 2022 - Nay</p>
                                    <ul className="list-disc list-inside text-[10px] text-gray-600 space-y-0.5">
                                        <li>Phát triển ứng dụng React</li>
                                        <li>Tối ưu hiệu suất 40%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scanner Overlay */}
                    {scanStatus === 'scanning' && (
                        <div className="absolute inset-0 z-20 rounded-xl overflow-hidden pointer-events-none">
                            <motion.div
                                className="absolute left-0 w-full h-2 bg-cyan-400 shadow-[0_0_30px_5px_rgba(34,211,238,0.8)]"
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ duration: 2.2, ease: "easeInOut" }}
                            />

                            <motion.div
                                className="absolute top-6 left-6 text-cyan-600 bg-cyan-50 px-3 py-1 rounded text-xs font-mono flex items-center gap-2"
                            >
                                <Scan size={14} className="animate-spin" /> ĐANG PHÂN TÍCH...
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Back Side: AI Analysis */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 rounded-xl overflow-hidden rotate-y-180 flex flex-col">
                    <div className="bg-slate-800 p-6 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                                    NA
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Hồ Sơ Ứng Viên</h3>
                                    <p className="text-sm text-blue-400 flex items-center gap-1">
                                        <CheckCircle size={12} /> Đã xác thực bởi BRIPATH AI
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-1 bg-green-500/10 text-green-400 text-sm rounded-full font-bold">
                                95% Phù hợp
                            </div>
                        </div>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto space-y-6 text-gray-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-500 mb-2">VỊ TRÍ PHÁT HIỆN</p>
                                <p className="text-white font-bold flex items-center gap-2">
                                    <Code size={20} className="text-blue-500" /> Frontend Lead
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                <p className="text-xs text-slate-500 mb-2">KINH NGHIỆM</p>
                                <p className="text-white font-bold flex items-center gap-2">
                                    <Briefcase size={20} className="text-purple-500" /> 5+ Năm
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 mb-3">NĂNG LỰC CHÍNH</p>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'TypeScript', 'Next.js', 'Micro-frontends', 'CI/CD'].map((skill, i) => (
                                    <motion.span
                                        key={skill}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.05) }}
                                        className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-sm rounded-md border border-blue-500/20"
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 mb-3">PHÂN TÍCH AI</p>
                            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                                <p className="text-sm leading-relaxed">
                                    <span className="text-blue-400 font-bold">Đánh giá BRIPATH:</span> Ứng viên có quỹ đạo phát triển xuất sắc.
                                    Kỹ năng công nghệ phù hợp cao với nhu cầu thị trường hiện tại.
                                </p>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                            Xem Công Việc Phù Hợp
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};