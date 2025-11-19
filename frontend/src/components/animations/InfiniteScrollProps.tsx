import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

interface InfiniteScrollItem {
    content: React.ReactNode;
}

interface ResponsiveValue {
    base?: string | number;
    sm?: string | number;
    md?: string | number;
    lg?: string | number;
    xl?: string | number;
    '2xl'?: string | number;
}

interface InfiniteScrollProps {
    width?: ResponsiveValue | string;
    maxHeight?: string;
    negativeMargin?: string;
    items?: InfiniteScrollItem[];
    itemMinHeight?: ResponsiveValue | number;
    itemWidth?: ResponsiveValue | string;
    isTilted?: boolean;
    tiltDirection?: 'left' | 'right';
    autoplay?: boolean;
    autoplaySpeed?: number;
    autoplayDirection?: 'down' | 'up';
    pauseOnHover?: boolean;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
    width = '30rem',
    maxHeight = '100%',
    negativeMargin = '-0.5em',
    items = [],
    itemMinHeight = 250,
    itemWidth,
    isTilted = false,
    tiltDirection = 'left',
    autoplay = false,
    autoplaySpeed = 0.5,
    autoplayDirection = 'down',
    pauseOnHover = false
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentWidth, setCurrentWidth] = useState<string>('30rem');
    const [currentItemHeight, setCurrentItemHeight] = useState<number>(250);
    const [currentItemWidth, setCurrentItemWidth] = useState<string>('100%');

    const getTiltTransform = (): string => {
        if (!isTilted) return 'none';
        return tiltDirection === 'left'
            ? 'rotateX(20deg) rotateZ(-20deg) skewX(20deg)'
            : 'rotateX(20deg) rotateZ(20deg) skewX(-20deg)';
    };

    // Get responsive value based on screen width
    const getResponsiveValue = (value: ResponsiveValue | string | number, isWidth: boolean = false): string | number => {
        if (typeof value === 'string' || typeof value === 'number') {
            return value;
        }

        const screenWidth = window.innerWidth;

        if (screenWidth >= 1536 && value['2xl'] !== undefined) {
            return value['2xl'];
        } else if (screenWidth >= 1280 && value.xl !== undefined) {
            return value.xl;
        } else if (screenWidth >= 1024 && value.lg !== undefined) {
            return value.lg;
        } else if (screenWidth >= 768 && value.md !== undefined) {
            return value.md;
        } else if (screenWidth >= 640 && value.sm !== undefined) {
            return value.sm;
        } else if (value.base !== undefined) {
            return value.base;
        }

        // Fallback
        return isWidth ? '30rem' : 250;
    };

    // Handle responsive updates
    useEffect(() => {
        const updateResponsiveValues = () => {
            const newWidth = getResponsiveValue(width, true);
            const newHeight = getResponsiveValue(itemMinHeight, false);
            const newItemWidth = itemWidth ? getResponsiveValue(itemWidth, true) : newWidth;

            setCurrentWidth(typeof newWidth === 'string' ? newWidth : `${newWidth}px`);
            setCurrentItemHeight(typeof newHeight === 'number' ? newHeight : parseInt(newHeight as string));
            setCurrentItemWidth(typeof newItemWidth === 'string' ? newItemWidth : `${newItemWidth}px`);
        };

        updateResponsiveValues();
        window.addEventListener('resize', updateResponsiveValues);

        return () => window.removeEventListener('resize', updateResponsiveValues);
    }, [width, itemMinHeight, itemWidth]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (items.length === 0) return;

        const divItems = gsap.utils.toArray<HTMLDivElement>(container.children);
        if (!divItems.length) return;

        const firstItem = divItems[0];
        const itemStyle = getComputedStyle(firstItem);
        const itemHeight = firstItem.offsetHeight;
        const itemMarginTop = parseFloat(itemStyle.marginTop) || 0;
        const totalItemHeight = itemHeight + itemMarginTop;
        const totalHeight = itemHeight * items.length + itemMarginTop * (items.length - 1);

        const wrapFn = gsap.utils.wrap(-totalHeight, totalHeight);

        divItems.forEach((child, i) => {
            const y = i * totalItemHeight;
            gsap.set(child, { y });
        });

        const observer = Observer.create({
            target: container,
            type: 'wheel,touch,pointer',
            preventDefault: true,
            onPress: ({ target }) => {
                (target as HTMLElement).style.cursor = 'grabbing';
            },
            onRelease: ({ target }) => {
                (target as HTMLElement).style.cursor = 'grab';
            },
            onChange: ({ deltaY, isDragging, event }) => {
                const d = event.type === 'wheel' ? -deltaY : deltaY;
                const distance = isDragging ? d * 5 : d * 10;
                divItems.forEach(child => {
                    gsap.to(child, {
                        duration: 0.5,
                        ease: 'expo.out',
                        y: `+=${distance}`,
                        modifiers: {
                            y: gsap.utils.unitize(wrapFn)
                        }
                    });
                });
            }
        });

        let rafId: number;
        if (autoplay) {
            const directionFactor = autoplayDirection === 'down' ? 1 : -1;
            const speedPerFrame = autoplaySpeed * directionFactor;

            const tick = () => {
                divItems.forEach(child => {
                    gsap.set(child, {
                        y: `+=${speedPerFrame}`,
                        modifiers: {
                            y: gsap.utils.unitize(wrapFn)
                        }
                    });
                });
                rafId = requestAnimationFrame(tick);
            };

            rafId = requestAnimationFrame(tick);

            if (pauseOnHover) {
                const stopTicker = () => rafId && cancelAnimationFrame(rafId);
                const startTicker = () => {
                    rafId = requestAnimationFrame(tick);
                };

                container.addEventListener('mouseenter', stopTicker);
                container.addEventListener('mouseleave', startTicker);

                return () => {
                    observer.kill();
                    stopTicker();
                    container.removeEventListener('mouseenter', stopTicker);
                    container.removeEventListener('mouseleave', startTicker);
                };
            } else {
                return () => {
                    observer.kill();
                    rafId && cancelAnimationFrame(rafId);
                };
            }
        }

        return () => {
            observer.kill();
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [items, autoplay, autoplaySpeed, autoplayDirection, pauseOnHover, currentItemHeight, currentWidth]);

    return (
        <>
            <style>
                {`
          .infinite-scroll-wrapper {
            max-height: ${maxHeight};
            overflow: hidden;
          }

          .infinite-scroll-container {
            width: ${currentWidth};
            cursor: grab;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }

          .infinite-scroll-item {
            height: ${currentItemHeight}px;
            min-height: ${currentItemHeight}px;
            max-height: ${currentItemHeight}px;
            width: ${currentItemWidth};
            margin-top: ${negativeMargin};
            pointer-events: auto;
            overflow: hidden;
          }

          .infinite-scroll-item > * {
          
            height: 100%;
            width: 100%;
            object-fit: cover;
          }

          @media (max-width: 640px) {
            .infinite-scroll-container {
              transform-origin: center;
            }
          }
        `}
            </style>

            <div className="infinite-scroll-wrapper" ref={wrapperRef}>
                <div
                    className="infinite-scroll-container"
                    ref={containerRef}
                    style={{
                        transform: getTiltTransform(),
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                    }}
                >
                    {items.map((item, i) => (
                        <div className="infinite-scroll-item" key={i}>
                            {item.content}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default InfiniteScroll;