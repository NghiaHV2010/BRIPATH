import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Loader2 } from "lucide-react";
import { getAllBlogPosts } from "@/api/blog_api";
import type { BlogPost as ApiBlogPost } from "@/api/blog_api";
import { Layout } from "@/components";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function BlogPage() {
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = async (page: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const resp = await getAllBlogPosts(page, 9);
      const items = resp.success ? resp.data : [];

      if (isInitial) {
        setPosts(items);
        // Load featured posts only on first page
        if (page === 1 && items.length > 0) {
          setFeaturedPosts(items.slice(0, 6));
          console.log("Featured posts loaded:", items.slice(0, 6).length);
        }
      } else {
        // Append new posts
        setPosts(prev => [...prev, ...items]);
      }

      if (resp.totalPages) setTotalPages(resp.totalPages);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Save scroll position and state before navigating
  const handlePostClick = (postId: number | undefined) => {
    if (!postId) return;
    sessionStorage.setItem("blogScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("blogCurrentPage", currentPage.toString());
    sessionStorage.setItem("blogPosts", JSON.stringify(posts));
    sessionStorage.setItem("blogFeaturedPosts", JSON.stringify(featuredPosts));
    sessionStorage.setItem("blogTotalPages", totalPages.toString());
    navigate(`/blog/${postId}`);
  };

  // Restore state on mount
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("blogScrollPosition");
    const savedCurrentPage = sessionStorage.getItem("blogCurrentPage");
    const savedPosts = sessionStorage.getItem("blogPosts");
    const savedFeaturedPosts = sessionStorage.getItem("blogFeaturedPosts");
    const savedTotalPages = sessionStorage.getItem("blogTotalPages");

    if (savedScrollPosition && savedPosts && savedCurrentPage) {
      // Restore state
      setPosts(JSON.parse(savedPosts));
      setFeaturedPosts(JSON.parse(savedFeaturedPosts || "[]"));
      setCurrentPage(parseInt(savedCurrentPage));
      setTotalPages(parseInt(savedTotalPages || "1"));
      setLoading(false);

      // Restore scroll position after content is rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        // Clear saved state
        sessionStorage.removeItem("blogScrollPosition");
        sessionStorage.removeItem("blogCurrentPage");
        sessionStorage.removeItem("blogPosts");
        sessionStorage.removeItem("blogFeaturedPosts");
        sessionStorage.removeItem("blogTotalPages");
      }, 100);
    } else {
      fetchBlogs(1, true);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-gray-600">Đang tải bài viết...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Section - Top 6 Posts (Newspaper Style) */}
          {currentPage === 1 && featuredPosts.length > 0 && (
            <div className="mb-16">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-10"
              ></motion.div>

              {/* Featured Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:min-h-[580px]">
                {/* Hero Post - Left Side */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-7 flex"
                >
                  <div
                    className="cursor-pointer group flex flex-col w-full"
                    onClick={() => handlePostClick(featuredPosts[0].id)}
                  >
                    <div className="relative flex-1 min-h-[280px] md:min-h-[350px] lg:min-h-[480px] overflow-hidden rounded-xl border-2 border-gray-200">
                      <img
                        src={
                          featuredPosts[0].cover_image_url &&
                          !featuredPosts[0].cover_image_url.includes(
                            "via.placeholder.com"
                          )
                            ? featuredPosts[0].cover_image_url
                            : "/placeholder.svg"
                        }
                        alt={featuredPosts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                    <div className="mt-4 shrink-0">
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                              {featuredPosts[0].title.split(" ").length > 16
                                ? featuredPosts[0].title
                                    .split(" ")
                                    .slice(0, 16)
                                    .join(" ") + "..."
                                : featuredPosts[0].title}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-3xl bg-gray-900 text-white border-gray-800 px-4 py-3 rounded-lg shadow-xl z-100"
                            sideOffset={8}
                          >
                            <p className="text-sm leading-relaxed wrap-break-word whitespace-normal">
                              {featuredPosts[0].title}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {featuredPosts[0].created_at && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(featuredPosts[0].created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Side Posts - Right Side */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-5 flex flex-col"
                >
                  {featuredPosts.slice(1, 6).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="group cursor-pointer flex-1 py-4 border-b border-gray-200 last:border-0"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex gap-4 h-full">
                        <div className="relative w-28 md:w-32 h-20 md:h-24 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200">
                          <img
                            src={
                              post.cover_image_url &&
                              !post.cover_image_url.includes(
                                "via.placeholder.com"
                              )
                                ? post.cover_image_url
                                : "/placeholder.svg"
                            }
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
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
                        <div className="flex-1 min-w-0 flex flex-col">
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <h4 className="font-bold text-xs md:text-sm text-gray-900 mb-auto line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                                  {post.title.split(" ").length > 16
                                    ? post.title
                                        .split(" ")
                                        .slice(0, 16)
                                        .join(" ") + "..."
                                    : post.title}
                                </h4>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-3xl bg-gray-900 text-white border-gray-800 px-4 py-3 rounded-lg shadow-xl z-100"
                                sideOffset={8}
                              >
                                <p className="text-sm leading-relaxed wrap-break-word whitespace-normal">
                                  {post.title}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {post.created_at && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-2">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Divider before All Blogs - Full Width */}
        <div className="w-full mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-400 text-center">
            Bài viết mới nhất
          </h2>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Blog Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer pb-6 border-b border-gray-200"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex gap-4">
                  <div className="relative w-36 h-28 shrink-0 overflow-hidden rounded-lg border-2 border-gray-200">
                    <img
                      src={
                        post.cover_image_url &&
                        !post.cover_image_url.includes("via.placeholder.com")
                          ? post.cover_image_url
                          : "/placeholder.svg"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
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
                  <div className="flex-1 min-w-0 flex flex-col">
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                            {post.title.split(" ").length > 16
                              ? post.title.split(" ").slice(0, 16).join(" ") +
                                "..."
                              : post.title}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-3xl bg-gray-900 text-white border-gray-800 px-4 py-3 rounded-lg shadow-xl z-100"
                          sideOffset={8}
                        >
                          <p className="text-sm leading-relaxed wrap-break-word whitespace-normal">
                            {post.title}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {post.created_at && (
                      <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 mt-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More Button */}
          {currentPage < totalPages ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  fetchBlogs(nextPage, false);
                }}
                disabled={isLoadingMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm bài viết"
                )}
              </Button>
            </motion.div>
          ) : (
            totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 text-sm py-4"
              >
                Đã hiển thị tất cả {posts.length} bài viết
              </motion.div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
