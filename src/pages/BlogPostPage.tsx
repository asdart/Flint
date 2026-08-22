import { Navigate, useParams } from "react-router-dom";
import { useStaggerReveal } from "../hooks/useStaggerReveal";
import Footer from "../sections/Footer";
import ArticleContent from "../sections/blog/ArticleContent";
import ArticleHero from "../sections/blog/ArticleHero";
import RelatedInsights from "../sections/blog/RelatedInsights";
import {
  FEATURED_ARTICLE,
  FEATURED_TOC,
  type ArticleBlock,
  type TocItem,
} from "../sections/blog/featuredArticle";
import {
  FEATURED_POST,
  getPostBySlug,
  getRelatedPosts,
  type BlogPost,
} from "../sections/blog/posts";

function fallbackArticle(post: BlogPost): { article: ArticleBlock[]; toc: TocItem[] } {
  return {
    toc: [{ id: "overview", label: post.title }],
    article: [
      { type: "quick-answer", title: "Quick Answer", body: post.excerpt },
      {
        type: "section",
        id: "overview",
        heading: post.title,
        paragraphs: [post.excerpt],
      },
      { type: "newsletter" },
    ],
  };
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const revealRef = useStaggerReveal<HTMLDivElement>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug);
  const { article, toc } =
    post.slug === FEATURED_POST.slug
      ? { article: FEATURED_ARTICLE, toc: FEATURED_TOC }
      : fallbackArticle(post);

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <ArticleHero post={post} />
      <ArticleContent article={article} toc={toc} />
      <RelatedInsights posts={related} />
      <Footer />
    </div>
  );
}
