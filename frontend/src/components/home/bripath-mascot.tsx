import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';

export const BripathMascot = () => {
    const navigate = useNavigate();
    const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
    const roadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // GSAP stagger bounce animation for letters
        gsap.fromTo(
            lettersRef.current.filter(Boolean),
            {
                y: 100,
                opacity: 0,
                scale: 0.5,
                rotation: -10,
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: {
                    amount: 0.6,
                    from: "start",
                },
            }
        );

        // Continuous bounce effect
        gsap.to(lettersRef.current.filter(Boolean), {
            y: -15,
            duration: 0.6,
            ease: "power1.inOut",
            stagger: {
                amount: 0.4,
                repeat: -1,
                yoyo: true,
                from: "start",
            },
            delay: 1.5,
        });

        // Road animation
        if (roadRef.current) {
            gsap.fromTo(
                roadRef.current,
                {
                    y: 100,
                    opacity: 0,
                    scale: 0.5,
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.3,
                }
            );
        }
    }, []);

    const letters = ['B', 'R', 'I', 'P', 'A', 'T', 'H'];

    return (
        <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-visible mb-8">

            {/* Central Animated Logo */}
            <div className="relative z-20 flex flex-col items-center">
                <div className="relative flex items-end justify-center gap-1 md:gap-2">
                    {letters.map((letter, index) => {
                        if (letter === 'I') {
                            // Special 'I' as animated road
                            return (
                                <div
                                    key={index}
                                    ref={roadRef}
                                    // Thay đổi kích thước responsive cho chữ I (con đường)
                                    className="relative w-10 md:w-24 h-14 md:h-30 flex justify-center items-end pb-1"
                                >
                                    {/* The Dot (Sun/Light) */}
                                    <div className="absolute -top-8 md:-top-12 w-8 md:w-14 h-8 md:h-14 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10">
                                        <div className="absolute top-1.5 md:top-2 right-2 md:right-3 w-2 h-2 bg-white/60 rounded-full"></div>
                                    </div>

                                    {/* The Body (Road) */}
                                    <div className="w-full h-full bg-blue-500 relative overflow-hidden" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)' }}>
                                        {/* Road Markings Animation */}
                                        <motion.div
                                            className="absolute left-1/2 -translate-x-1/2 w-1 md:w-2 h-[200%] bg-[linear-gradient(to_bottom,transparent_50%,#ffffff_50%)] bg-[size:100%_25px] md:bg-[size:100%_40px]"
                                            animate={{ translateY: ["0%", "-50%"] }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            );
                        }

                        // Regular letters with same height as road
                        return (
                            <span
                                key={index}
                                ref={(el) => {
                                    if (letter !== 'I') {
                                        lettersRef.current[index] = el;
                                    }
                                }}
                                // Thêm các class responsive: text-[5rem] (mobile) -> md:text-[8rem] (desktop)
                                // Chiều cao h-20 (mobile) -> md:h-32 (desktop) để khớp với chữ I
                                className="font-black text-blue-500 tracking-tighter inline-flex items-end justify-center text-[4rem] sm:text-[6rem] md:text-[10rem] h-20 md:h-32"
                                style={{
                                    lineHeight: 1,
                                    // Đã xóa fontSize và height cố định ở đây
                                }}
                            >
                                {letter}
                            </span>
                        );
                    })}

                    {/* Underline glow */}
                    <motion.div
                        className="absolute -bottom-6 md:-bottom-8 left-0 w-full h-3 bg-blue-500/20 rounded-full blur-lg z-10"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.2, duration: 1 }}
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    // Điều chỉnh kích thước chữ phụ đề responsive
                    className="text-sm md:text-xl font-bold text-gray-400 mt-10 md:mt-14 tracking-[0.3em] uppercase text-center px-4"
                >
                    ỨNG DỤNG TUYỂN DỤNG THÔNG MINH
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8, duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 mt-8"
                >
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white! text-lg rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1"
                        onClick={() => navigate("/quiz")}
                    >
                        Làm trắc nghiệm ngay
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-lg rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-1"
                        onClick={() => navigate("/jobs")}
                    >
                        Khám phá việc làm
                    </Button>
                </motion.div>
            </div>



            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute bottom-0 flex justify-center items-center gap-2 text-sm md:text-base text-gray-400 animate-bounce"
            >
                <ArrowDown size={20} />
                <span>Xem thêm</span>
            </motion.div>
        </div>
    );
};