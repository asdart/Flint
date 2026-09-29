import { Navigate, useParams } from "react-router-dom";
import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { postBySlug, type PostWithRefs } from "../content";
import { useInteractions } from "../ix/useInteractions";
import ArticleBody from "../sections/ArticleBody";
import ArticleHero from "../sections/ArticleHero";
import Newsletter from "../sections/Newsletter";
import RelatedPosts from "../sections/RelatedPosts";

// The Posts CMS template page at /blog/{slug}. The current item is resolved here and handed to the
// sections (the template's current-Post context). Keyed by slug so clicking a related card remounts
// the template and re-runs the interactions (same pattern as PostIndex's key in BlogPage.tsx).
export default function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? postBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;
  return <PostTemplate key={post.slug} post={post} />;
}

function PostTemplate({ post }: { post: PostWithRefs }) {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main>
        <ArticleHero post={post} />
        <ArticleBody post={post} />
        <Newsletter variant="stacked" />
        <RelatedPosts post={post} />
      </main>
      <Footer />
    </div>
  );
}
