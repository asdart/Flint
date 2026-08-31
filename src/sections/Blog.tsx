import { Link } from "react-router-dom";
import BlurReveal from "../components/BlurReveal";
import BlogPostCard from "./blog/BlogPostCard";
import { HOME_POSTS } from "./blog/posts";

export default function Blog() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center rounded-[24px] bg-brand-light p-6 md:p-12 lg:p-20">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-8 md:gap-12">
          <BlurReveal className="flex w-full max-w-[436px] flex-col items-center gap-2 text-center">
            <h2 className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">
              The Flint blog
            </h2>
            <p className="text-[16px] leading-6 text-subtle">
              More guides on nursing careers, US immigration, and healthcare staffing.
            </p>
            <span className="inline-flex pt-4">
              <Link
                to="/blog"
                className="relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-[#0a0a0a] shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98]"
              >
                See all posts
              </Link>
            </span>
          </BlurReveal>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_POSTS.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
