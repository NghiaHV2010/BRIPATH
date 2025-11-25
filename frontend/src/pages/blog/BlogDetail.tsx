import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "@/api/blog_api";
import type { BlogPost } from "@/api/blog_api";
import { getPostContentFromFirebase } from "@/utils/posts";
import { Layout } from "@/components";
import { Loader2 } from "lucide-react";

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

          // Heuristics: if content starts with an <img>, skip hero image
          const trimmed = html.trim().toLowerCase();
          const startsWithImg = /^<img\b/i.test(trimmed) || /^<p[^>]*>\s*<img\b/i.test(trimmed);
          let hideHero = startsWithImg;
          // If first image in content is same as cover, also hide hero
          const firstImgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
          if (firstImgMatch && resp.data.cover_image_url && firstImgMatch[1] === resp.data.cover_image_url) {
            hideHero = true;
          }

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
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


