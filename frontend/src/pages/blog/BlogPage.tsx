import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { getAllBlogPosts } from "@/api/blog_api";
import type { BlogPost as ApiBlogPost } from "@/api/blog_api";
import { Layout } from "@/components";
import { useNavigate } from "react-router";

export function BlogPage() {
  const [featuredPosts, setFeaturedPosts] = useState<ApiBlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        const resp = await getAllBlogPosts(page, 12);
        const items = resp.success ? resp.data : [];
        setFeaturedPosts(items.slice(0, 4));
        setAllPosts(items);
        if (resp.totalPages) setTotalPages(resp.totalPages);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-emerald-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  const handleCarouselNext = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCarouselPrev = () => {
    setPage(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mbtiTypes = [
    {
      type: "Đơn giản",
      color: "bg-linear-to-br from-emerald-200 to-emerald-400",
    },
    {
      type: "Nhanh chóng",
      color: "bg-linear-to-br from-blue-200 to-blue-400",
    },
    {
      type: "Tiện lợi",
      color: "bg-linear-to-br from-purple-400 to-purple-600",
    },
    {
      type: "Phù hợp",
      color: "bg-linear-to-br from-yellow-200 to-yellow-400",
    },
    {
      type: "Chính xác",
      color: "bg-linear-to-br from-green-400 to-green-600",
    },
    { type: "Chất lượng", color: "bg-linear-to-br from-red-400 to-red-600" },
  ];

  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1);

  return (
    <Layout>
      <div className="min-h-screen bg-linear-to-b from-white via-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Section Title */}
          <div className="mb-8  sm:mb-10 lg:mb-12">
            <h1 className="text-3xl h-15 sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 bg-linear-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Bài viết nổi bật
            </h1>
            <div className="w-20 h-1 bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full"></div>
          </div>

          {/* Featured Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {/* Main Featured Post */}
            {mainFeatured && (
              <div className="lg:col-span-2">
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 h-full group bg-white">
                  <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-linear-to-br from-emerald-100 to-emerald-50">
                    <img
                      src={
                        mainFeatured.cover_image_url &&
                          !mainFeatured.cover_image_url.includes(
                            "via.placeholder.com"
                          )
                          ? mainFeatured.cover_image_url
                          : "/placeholder.svg"
                      }
                      alt={mainFeatured.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={e => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (
                          img.src !==
                          window.location.origin + "/placeholder.svg"
                        ) {
                          img.src = "/placeholder.svg";
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-5 sm:p-6 lg:p-8 min-h-[250px] sm:min-h-[280px] flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 shadow-md">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Nổi bật
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {mainFeatured.title}
                      </h2>
                      {mainFeatured.created_at && (
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {new Date(mainFeatured.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>
                    <Button
                      className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto font-semibold"
                      onClick={() => navigate(`/blog/${mainFeatured.id}`)}
                    >
                      Xem chi tiết
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Side Featured Posts */}
            <div className="space-y-3 sm:space-y-4 h-full flex flex-col justify-between">
              {sideFeatured.slice(0, 3).map((post, idx) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 cursor-pointer flex-1 group bg-white"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="relative h-20 sm:h-24 w-full overflow-hidden bg-linear-to-br from-emerald-400 to-emerald-600">
                    <img
                      src={
                        post.cover_image_url &&
                          !post.cover_image_url.includes("via.placeholder.com")
                          ? post.cover_image_url
                          : "/placeholder.svg"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      onError={e => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (
                          img.src !==
                          window.location.origin + "/placeholder.svg"
                        ) {
                          img.src = "/placeholder.svg";
                        }
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
                      #{idx + 2}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    {post.created_at && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {new Date(post.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent h-7 sm:h-8 px-3 text-xs w-full transition-all duration-300 font-semibold"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/blog/${post.id}`);
                      }}
                    >
                      Đọc ngay <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <Card className="bg-linear-to-br from-emerald-600 to-emerald-500 text-white border-0 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <h3 className="text-4xl sm:text-5xl font-bold mb-2 bg-white/20 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
                  60.000+
                </h3>
                <p className="text-emerald-50 font-medium mt-3">
                  Việc làm đang tuyển dụng
                </p>
              </div>
              <Button
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                onClick={() => navigate("/jobs")}
              >
                Tìm việc ngay
              </Button>
            </Card>

            <Card className="bg-linear-to-br from-blue-600 to-blue-500 text-white border-0 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <h3 className="text-4xl sm:text-5xl font-bold mb-2 bg-white/20 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
                  100+
                </h3>
                <p className="text-blue-50 font-medium mt-3">
                  Công ty hàng đầu các ngành nghề
                </p>
              </div>
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                onClick={() => navigate("/companies")}
              >
                Khám phá ngay
              </Button>
            </Card>
          </div>

          {/* All Posts Section */}
          <div>
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Tất cả bài viết
              </h2>
              <div className="w-16 h-1 bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {allPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 cursor-pointer group bg-white"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-0">
                    <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-emerald-400 to-emerald-600">
                      <img
                        src={
                          post.cover_image_url &&
                            !post.cover_image_url.includes("via.placeholder.com")
                            ? post.cover_image_url
                            : "/placeholder.svg"
                        }
                        alt={post.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        onError={e => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (
                            img.src !==
                            window.location.origin + "/placeholder.svg"
                          ) {
                            img.src = "/placeholder.svg";
                          }
                        }}
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">
                          Bài viết
                        </div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                          {post.title}
                        </h3>
                        {post.created_at && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {new Date(post.created_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent h-8 px-3 text-xs transition-all duration-300 font-semibold w-full"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/blog/${post.id}`);
                        }}
                      >
                        Đọc ngay <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCarouselPrev}
                disabled={page === 1}
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 w-10 h-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (page <= 3) {
                        pageNum = idx + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = page - 2 + idx;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setPage(pageNum)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${pageNum === page
                            ? "bg-emerald-600 w-8"
                            : "bg-gray-300 hover:bg-emerald-400"
                            }`}
                        />
                      );
                    }
                  )}
                </div>

                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-full">
                  {page} / {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleCarouselNext}
                disabled={page === totalPages}
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 w-10 h-10"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* MBTI Quiz Section */}
          <div className="mt-16 sm:mt-20">
            <div className="bg-linear-to-br from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 lg:p-12 items-center">
                {/* Left Content */}
                <div className="text-white text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                    <span className="text-sm sm:text-base font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      MBTI
                    </span>
                    <span className="text-sm sm:text-base font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      top cv
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                    TRẮC NGHIỆM
                    <br />
                    TÍNH CÁCH
                  </h2>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold mb-8 text-emerald-50">
                    Định hướng nghề nghiệp - Lộ trình rõ ràng
                  </p>

                  <Button
                    onClick={() => navigate("/quiz")}
                    className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold gap-2 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Làm trắc nghiệm ngay
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Right MBTI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {mbtiTypes.map((mbti, idx) => (
                    <div
                      key={mbti.type}
                      className={`${mbti.color} rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-110 hover:-translate-y-2 animate-fade-in`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
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
