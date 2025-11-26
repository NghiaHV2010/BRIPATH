import { ContainerScroll } from "../../components/home/container-scroll-animation";
import { BripathMascot } from "../../components/home/bripath-mascot";
import { CVPreview } from "../../components/home/cv-preview";
import { Badge } from "../../components/ui/badge";
import { motion } from "framer-motion";
import { TestimonialsColumn, type Testimonial } from "../../components/home/testimonials-columns";
import IntegrationHero from "../../components/home/integration-hero"; // Import component mới
import { Footer } from "@/components";

const testimonials: Testimonial[] = [
  {
    text: "BRIPATH đã giúp mình định hướng nghề nghiệp cực kỳ rõ ràng. Bài trắc nghiệm AI phân tích rất sát với tính cách của mình.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    name: "Nguyễn Thùy Linh",
    role: "Sinh viên năm cuối",
  },
  {
    text: "Nhờ BRIPATH, tôi đã tìm được công việc Developer ưng ý chỉ sau 1 tuần. Tính năng gợi ý việc làm rất thông minh.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    name: "Trần Minh Tuấn",
    role: "Frontend Developer",
  },
  {
    text: "Giao diện đẹp, dễ sử dụng. Lộ trình phát triển sự nghiệp mà ứng dụng gợi ý giúp tôi biết mình cần học thêm kỹ năng gì.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    name: "Lê Thị Mai",
    role: "Marketing Executive",
  },
  {
    text: "Là một HR, tôi đánh giá cao chất lượng ứng viên từ BRIPATH. Hồ sơ được chuẩn hóa rất chuyên nghiệp.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    name: "Hoàng Văn Nam",
    role: "HR Manager",
  },
  {
    text: "Công cụ tạo CV của BRIPATH rất ấn tượng. Tôi đã nhận được nhiều lời mời phỏng vấn hơn hẳn.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    name: "Phạm Ngọc Anh",
    role: "Business Analyst",
  },
  {
    text: "Cộng đồng chia sẻ kinh nghiệm trên đây rất hữu ích. Tôi học được nhiều tips phỏng vấn hay.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    name: "Đặng Văn Hùng",
    role: "Fresher Designer",
  },
  {
    text: "Hệ thống AI phân tích điểm mạnh điểm yếu rất chính xác. Giúp tôi tự tin hơn khi đi xin việc.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    name: "Vũ Thị Hằng",
    role: "Content Creator",
  },
  {
    text: "Tuyệt vời! Ứng dụng không chỉ giúp tìm việc mà còn là người bạn đồng hành phát triển bản thân.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
    name: "Ngô Thanh Tùng",
    role: "Sales Executive",
  },
  {
    text: "Tốc độ xử lý nhanh, kết quả trả về ngay lập tức. Rất đáng để trải nghiệm.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces",
    name: "Bùi Văn Long",
    role: "Data Analyst",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function HomePage() {
  return (
    <div className="bg-white w-full overflow-y-auto">

      {/* Hero Section with Scroll Animation */}
      <section className="w-full relative bg-white flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col w-full">
          <ContainerScroll
            titleComponent={
              <div className="relative z-10 mb-2 w-full">
                <BripathMascot />
              </div>
            }
          >
            <CVPreview />
          </ContainerScroll>
        </div>
      </section>

      <IntegrationHero />

      {/* Testimonials Section (Replaces Features Section) */}
      <section className="bg-white py-20 relative overflow-hidden">
        <div className="container z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[640px] mx-auto mb-12"
          >
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Đánh giá từ người dùng
              </Badge>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 text-center mb-6">
              Người dùng nói gì về BRIPATH?
            </h2>
            <p className="text-center text-xl text-gray-600">
              Hàng ngàn sinh viên và người đi làm đã tìm thấy hướng đi đúng đắn nhờ BRIPATH.
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
