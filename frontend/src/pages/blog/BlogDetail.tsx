import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "@/api/blog_api";
import type { BlogPost } from "@/api/blog_api";
import { getPostContentFromFirebase } from "@/utils/posts";
import { Layout } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showHeading, setShowHeading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        if (!id) return;
        const resp = await getBlogById(Number(id));
        if (resp.success && resp.data) {
          setPost(resp.data);
          const html = await getPostContentFromFirebase(resp.data.description_url);
          setContent(html);

          // If the title already appears very early in content, hide separate heading
          const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (resp.data.title) {
            const idx = plain.toLowerCase().indexOf(resp.data.title.trim().toLowerCase());
            setShowHeading(!(idx > -1 && idx < 80));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title skeleton */}
          <Skeleton className="h-10 w-3/4 mb-4" />

          {/* Meta info skeleton */}
          <div className="flex my-4 items-center justify-between w-full">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>

          <Skeleton className="h-px w-full mb-4" />

          {/* Content skeletons */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />

            <div className="py-2" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            <div className="py-2" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />

            <div className="py-2" />

            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {showHeading && (
          <h1 className="text-2xl! md:text-3xl! font-bold">{post.title}</h1>
        )}
        <div className="flex my-4 items-center text-sm text-gray-500 justify-between w-full">
          <span>Bởi BRIPATH</span>
          <span>{new Date(post.created_at || "").toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <hr className="w-full mb-4" />
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </Layout>
  );
}


