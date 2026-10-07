import { useParams } from "react-router-dom";
import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import { blogIndexSchema } from "../content/schema";
import { useInteractions } from "../ix/useInteractions";
import BlogHero from "../sections/BlogHero";
import Newsletter from "../sections/Newsletter";
import PostIndex from "../sections/PostIndex";

// Blog at /blog, and the Blog category template at /categories/:slug (same sections, the feed
// filtered to the category).
export default function BlogPage() {
  const { slug } = useParams();
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <BlogHero />
        <Newsletter />
        <PostIndex key={slug ?? "all"} category={slug} />
      </main>
      <Footer />
      {!slug && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogIndexSchema()) }} />}
    </div>
  );
}
