import { useState } from "react";
import BlogPostCard from "./BlogPostCard";
import { ALL_POSTS } from "./posts";

const PAGES = [1, 2, 3, 4];

export default function AllPosts() {
  const [page, setPage] = useState(1);

  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full flex-col items-center overflow-clip rounded-[24px] bg-brand-light px-20 pb-12 pt-24">
        <div className="flex w-full max-w-[1200px] flex-col">
          <h2
            data-reveal
            className="font-serif text-[40px] leading-[44px] tracking-[-0.8px] text-ink"
          >
            All posts
          </h2>

          <div className="mt-8 grid grid-cols-3 gap-8">
            {ALL_POSTS.map((post, i) => (
              <BlogPostCard key={i} post={post} />
            ))}
          </div>

          <div className="mt-16 flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="flex items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white p-4 transition-colors hover:bg-stone-50"
            >
              <img src="/assets/blog/arrow-left.svg" alt="" className="size-4" />
            </button>

            <div className="flex items-center justify-center gap-2">
              {PAGES.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={active ? "page" : undefined}
                    className={`flex size-12 items-center justify-center rounded-full border border-[#d3d7de] bg-white text-[14px] leading-5 text-ink transition-colors hover:bg-stone-50 ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(PAGES.length, p + 1))}
              aria-label="Next page"
              className="flex items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white p-4 transition-colors hover:bg-stone-50"
            >
              <img src="/assets/blog/arrow-right.svg" alt="" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
