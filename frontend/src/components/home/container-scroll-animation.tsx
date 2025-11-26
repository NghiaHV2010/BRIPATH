"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 1] : [0.85, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translateY = useTransform(scrollYProgress, [0, 1], [200, 0]);
    const translateTitle = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <div
            className="min-h-screen flex items-center justify-center relative p-2 md:p-10"
            ref={containerRef}
        >
            <div
                className="py-10 md:py-20 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translate={translateTitle} titleComponent={titleComponent} />
                <Card
                    rotate={rotate}
                    translateY={translateY}
                    scale={scale}
                    opacity={opacity}
                >
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({
    translate,
    titleComponent
}: {
    translate: MotionValue<number>;
    titleComponent: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className="max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    translateY,
    opacity,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translateY: MotionValue<number>;
    opacity: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                translateY,
                opacity,
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="max-w-3xl mx-auto h-[90vh] w-full border-2 border-[#6C6C6C] p-2 md:p-2 bg-[#222222] rounded-[30px] shadow-2xl"
        >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-2">
                {children}
            </div>
        </motion.div>
    );
};