import BlogPostCard from "./BlogPostCard";
import type { BlogPost } from "./posts";

type RelatedInsightsProps = {
  posts: BlogPost[];
};

export default function RelatedInsights({ posts }: RelatedInsightsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="w-full p-4">
      <div className="flex w-full flex-col items-center rounded-[24px] bg-brand-light p-6 md:p-12 lg:p-20">
        <div className="flex w-full max-w-[1200px] flex-col gap-8 md:gap-12">
          <div className="flex w-full flex-col gap-2">
            <h2
              data-reveal
              className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]"
            >
              Related Insights
            </h2>
            <p data-reveal className="text-[16px] leading-6 text-subtle">
              More guides on nursing careers, US immigration, and healthcare staffing.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
