import BlogHero from "../sections/blog/BlogHero";
import BlogNewsletter from "../sections/blog/BlogNewsletter";
import AllPosts from "../sections/blog/AllPosts";
import Footer from "../sections/Footer";
import { useStaggerReveal } from "../hooks/useStaggerReveal";

export default function BlogPage() {
  const revealRef = useStaggerReveal<HTMLDivElement>();

  return (
    <div ref={revealRef} className="flex w-full flex-col">
      <BlogHero />
      <BlogNewsletter />
      <AllPosts />
      <Footer />
    </div>
  );
}
