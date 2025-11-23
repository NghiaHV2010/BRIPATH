"use client";
import { Button } from "../ui/button";

const ICONS_ROW1 = [
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/stX00q7jFuq0zjBmZJoZ1Uy4F8aToDyg_1686647600____b007941aefd4850c00a1488562d03d5c.jpg", // Slack
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-co-phan-cong-nghe-sapo-6166c32089ac7.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/0b1f147c404ef7e945fde4099e77bd34-66a8b04d4dbd3.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-tnhh-kinh-doanh-thuong-mai-htc-viet-nam-73ab0369876b0cb16fd29bd9116aa2af-66b96806cb33d.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/6867591fcbdd31751603487.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/UCZVqcHK9IwoIqFWoyc95iTHsiEWh9Do_1705636005____e3eccc1006851538df734a8d967d7d57.png",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/IWgswbwUnoLOrYkhMlzv0jHNxbWU3kgz_1633685713____cac5f742fc82a09850b270566e892324.jpg",
];

const ICONS_ROW2 = [
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/tina-services-60e577c906541.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-tnhh-dksh-viet-nam-6362281fefdbe.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cty-tnhh-r-techno-viet-nam-d50e5e9e47821a66eb1e8733264810b1-65f0fcaf57bea.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-co-phan-propertyguru-viet-nam-81cb9a75488c53ea55a75f4eac0ce3c5-66f0fc8803457.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-co-phan-vclass-eec1d52f937a78104b7636219621ff0d-672590c20f819.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-tai-chinh-tnhh-mb-shinsei-mcredit-62b9787264bad.jpg",
    "https://cdn-new.topcv.vn/unsafe/140x/https://static.topcv.vn/company_logos/cong-ty-tnhh-thuong-mai-va-dau-tu-srt-mien-trung-16ce20a7043ae8d76b5a40987d5f5cc3-65f00ec2ada1d.jpg",
];

// Utility to repeat icons enough times
const repeatedIcons = (icons: string[], repeat = 4) => Array.from({ length: repeat }).flatMap(() => icons);

export default function IntegrationHero() {
    const navigate = () => {
        window.location.href = "/companies";
    }

    return (
        <section className="mt-10relative py-20 lg:py-32 overflow-hidden bg-white dark:bg-black">

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Các nhà tuyển dụng tin dùng
                </h1>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    Kết nối liền mạch hồ sơ BRIPATH của bạn với hơn 90+ nhà tuyển dụng.
                </p>
                <Button variant="default" className="mt-8 text-lg rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg cursor-pointer" onClick={() => navigate()}>
                    Khám phá ngay
                </Button>

                {/* Carousel */}
                <div className="mt-16 overflow-hidden relative pb-2">
                    {/* Row 1 */}
                    <div className="flex gap-10 whitespace-nowrap animate-scroll-left hover:paused">
                        {repeatedIcons(ICONS_ROW1, 4).map((src, i) => (
                            <div key={i} className="h-20 w-20 shrink-0 rounded-2xl bg-white dark:bg-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                <img src={src} alt="icon" className="h-10 w-10 object-contain" />
                            </div>
                        ))}
                    </div>

                    {/* Row 2 */}
                    <div className="flex gap-10 whitespace-nowrap mt-8 animate-scroll-right hover:paused">
                        {repeatedIcons(ICONS_ROW2, 4).map((src, i) => (
                            <div key={i} className="h-20 w-20 shrink-0 rounded-2xl bg-white dark:bg-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                <img src={src} alt="icon" className="h-10 w-10 object-contain" />
                            </div>
                        ))}
                    </div>

                    {/* Fade overlays */}
                    <div className="absolute left-0 top-0 h-full w-32 bg-linear-to-r from-white dark:from-black to-transparent pointer-events-none z-10" />
                    <div className="absolute right-0 top-0 h-full w-32 bg-linear-to-l from-white dark:from-black to-transparent pointer-events-none z-10" />
                </div>
            </div>

            <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
      `}</style>
        </section>
    );
}