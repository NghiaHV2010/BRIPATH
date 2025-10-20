import type { BlogPost } from "@/types/blog";
// Mock blog posts data
export const mockdataBlog: BlogPost[] = [
  {
    id: "1",
    title: "Nhân viên kinh doanh/Sales là gì? Từ A đến Z về nghề Sales",
    description:
      "Thực hiện Báo cáo tổng hợp tuyển dụng 2023 & Hình cầu tuyển dụng 2024 từ TopCV, chúng tôi nhận thấy Sales là một trong những vị trí được tìm kiếm nhiều nhất.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/sales-business-professional.jpg",
    author: "TopCV",
    date: "2024-01-15",
    readTime: "5 min",
    featured: true,
  },
  {
    id: "2",
    title: "Ngành IT là gì? Có bao nhiêu ngành IT?",
    description:
      "Ngành IT là gì? Có bao nhiêu ngành IT? Những câu hỏi này luôn được nhiều bạn trẻ quan tâm khi lựa chọn con đường sự nghiệp.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/it-technology-career.jpg",
    author: "TopCV",
    date: "2024-01-10",
    readTime: "4 min",
  },
  {
    id: "3",
    title: "Ngành Marketing là gì? Có gì hấp dẫn?",
    description:
      "Marketing là một trong những ngành được nhiều bạn trẻ lựa chọn. Vậy ngành Marketing là gì? Có gì hấp dẫn?",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/marketing-business-strategy.jpg",
    author: "TopCV",
    date: "2024-01-08",
    readTime: "6 min",
  },
  {
    id: "4",
    title: "Review chuyên gia: Điều gì làm nên sự khác biệt?",
    description:
      "Trong bài viết này, chúng tôi sẽ chia sẻ những điều làm nên sự khác biệt giữa các chuyên gia trong ngành.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/professional-expert-review.jpg",
    author: "TopCV",
    date: "2024-01-05",
    readTime: "7 min",
  },
  {
    id: "5",
    title: "Các kỹ năng cần thiết cho nhân viên HR năm 2025",
    description:
      "Năm 2025, ngành HR đang trải qua những thay đổi lớn. Hãy cùng khám phá những kỹ năng cần thiết.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/hr-human-resources-skills.jpg",
    author: "TopCV",
    date: "2024-01-03",
    readTime: "5 min",
  },
  {
    id: "6",
    title: "TopCV Pro: Nâng cấp hồ sơ chuyên nghiệp",
    description:
      "TopCV Pro giúp bạn tạo hồ sơ chuyên nghiệp và nổi bật hơn trên thị trường lao động.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/professional-cv-resume.jpg",
    author: "TopCV",
    date: "2024-01-01",
    readTime: "4 min",
  },
  {
    id: "7",
    title: "Lương thạc sĩ quản lý kinh doanh năm 2025",
    description:
      "Tìm hiểu về mức lương trung bình của các chuyên gia quản lý kinh doanh trong năm 2025.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/business-management-salary.jpg",
    author: "TopCV",
    date: "2023-12-28",
    readTime: "6 min",
  },
  {
    id: "8",
    title: "Hành trình thành công của các lãnh đạo trẻ",
    description:
      "Khám phá những câu chuyện thành công của các lãnh đạo trẻ trong các ngành khác nhau.",
    category: "ĐỊNH HƯỚNG NGHỀ NGHIỆP",
    image: "/young-leaders-success.jpg",
    author: "TopCV",
    date: "2023-12-25",
    readTime: "8 min",
  },
];

// Mock API functions
export async function getBlogPosts(): Promise<BlogPost[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockdataBlog;
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockdataBlog.filter((post) => post.featured).slice(0, 3);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockdataBlog.find((post) => post.id === id) || null;
}
