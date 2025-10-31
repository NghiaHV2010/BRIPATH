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
  const [showHero, setShowHero] = useState(true);
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
          setShowHero(!hideHero);

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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {showHeading && (
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        )}
        {showHero && (
          <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
            <img
              src={(post.cover_image_url && !post.cover_image_url.includes('via.placeholder.com')) ? post.cover_image_url : "/placeholder.svg"}
              alt={post.title}
              className="w-full h-72 object-cover"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src !== window.location.origin + "/placeholder.svg") {
                  img.src = "/placeholder.svg";
                }
              }}
            />
          </div>
        )}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </Layout>
  );
}


