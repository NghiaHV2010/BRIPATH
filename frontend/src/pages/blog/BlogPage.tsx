import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { getBlogPosts, getFeaturedBlogPosts } from "./mockdataBlog";
import type { BlogPost } from "@/types/blog";
import { Layout } from "@/components";
import { useNavigate } from "react-router";

export function BlogPage() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselItemsPerPage = 4;

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const [featured, all] = await Promise.all([
          getFeaturedBlogPosts(),
          getBlogPosts(),
        ]);
        setFeaturedPosts(featured);
        setAllPosts(all);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  //   const mainFeatured = featuredPosts[0];
  //   const sideFeatured = featuredPosts.slice(1);

  const carouselPosts = allPosts;
  const totalPages = Math.ceil(carouselPosts.length / carouselItemsPerPage);
  const currentCarouselPosts = carouselPosts.slice(
    carouselIndex * carouselItemsPerPage,
    (carouselIndex + 1) * carouselItemsPerPage
  );

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev + 1) % totalPages);
  };

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const mbtiTypes = [
    {
      type: "Đơn giản",
      color: "bg-gradient-to-br from-emerald-200 to-emerald-400",
    },
    {
      type: "Nhanh chóng",
      color: "bg-gradient-to-br from-blue-200 to-blue-400",
    },
    {
      type: "Tiện lợi",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      type: "Phù hợp",
      color: "bg-gradient-to-br from-yellow-200 to-yellow-400",
    },
    {
      type: "Chính xác",
      color: "bg-gradient-to-br from-green-400 to-green-600",
    },
    { type: "Chất lượng", color: "bg-gradient-to-br from-red-400 to-red-600" },
  ];

  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Section Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Bài viết nổi bật
          </h1>

          {/* Featured Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3  gap-6 mb-12">
            {/* Main Featured Post */}
            {mainFeatured && (
              <div className="lg:col-span-2">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0">
                  <div className="relative h-80 w-full overflow-hidden bg-gray-200">
                    <img
                      src={mainFeatured.image || "/placeholder.svg"}
                      alt={mainFeatured.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 min-h-[300px] flex flex-col justify-between">
                    <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {mainFeatured.category}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {mainFeatured.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {mainFeatured.description}
                    </p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                      Xem thêm
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Side Featured Posts */}
            <div className="space-y-4">
              {sideFeatured.length > 0
                ? sideFeatured.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-0 cursor-pointer"
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-emerald-500/80">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                          {post.category}
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
                          {post.title}
                        </h3>
                      </div>
                    </Card>
                  ))
                : // 🧩 Placeholder khi chưa có dữ liệu
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card
                      key={i}
                      className="overflow-hidden border-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 animate-pulse"
                    >
                      <div className="h-32 w-full bg-emerald-300/40"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-3 w-16 bg-white/50 rounded"></div>
                        <div className="h-4 w-3/4 bg-white/60 rounded"></div>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-emerald-600 text-white border-0 p-8 flex items-center justify-between hover:bg-emerald-700 transition-colors duration-300">
              <div>
                <h3 className="text-3xl font-bold mb-2">60.000+</h3>
                <p className="text-emerald-100">Việc làm đang tuyển dụng</p>
              </div>
              <Button
                className="bg-white text-emerald-600 hover:bg-gray-100"
                onClick={() => navigate("/jobs")}
              >
                Tìm việc ngay
              </Button>
            </Card>

            <Card className="bg-emerald-600 text-white border-0 p-8 flex items-center justify-between hover:bg-emerald-700 transition-colors duration-300">
              <div>
                <h3 className="text-3xl font-bold mb-2">100+</h3>
                <p className="text-emerald-100">
                  Công ty hàng đầu các ngành nghề
                </p>
              </div>
              <Button
                className="bg-white text-emerald-600 hover:bg-gray-100"
                onClick={() => navigate("/companies")}
              >
                Trải nghiệm ngay
              </Button>
            </Card>
          </div>

          {/* All Posts Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Danh sách bài viết
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 cursor-pointer group"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-semibold text-emerald-600 mb-2">
                      {post.category}
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            {/* Pagination and Navigation */}
            <div className="flex items-center text-center justify-center gap-4 m-5 ">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCarouselPrev}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === carouselIndex ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <span className="text-sm text-gray-600 mx-2">
                {carouselIndex + 1} / {totalPages} trang
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={handleCarouselNext}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mb-16">
            <div className="bg-emerald-600 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
                {/* Left Content */}
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-semibold">MBTI</span>
                    <span className="text-sm font-semibold">top cv</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    TRẮC NGHIỆM
                    <br />
                    TÍNH CÁCH
                    <br />
                  </h2>
                  <h2 className="text-2xl lg:text-2xl font-bold mb-6 leading-tight">
                    Định hướng nghề nghiệp - Lộ trình rõ ràng
                  </h2>

                  <Button
                    onClick={() => navigate("/quiz")}
                    className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold gap-2"
                  >
                    Làm trắc nghiệm ngay
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Right MBTI Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {mbtiTypes.map((mbti) => (
                    <div
                      key={mbti.type}
                      className={`${mbti.color} rounded-lg p-6 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
                    >
                      {mbti.type}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
