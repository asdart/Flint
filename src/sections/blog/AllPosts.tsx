import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import BlogPostCard from "./BlogPostCard";
import { ALL_POSTS, POSTS_PER_PAGE } from "./posts";

export default function AllPosts() {
  const [page, setPage] = useState(1);
  const reduceMotion = useReducedMotion();
  const totalPages = Math.ceil(ALL_POSTS.length / POSTS_PER_PAGE);
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const pagePosts = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE;
    return ALL_POSTS.slice(start, start + POSTS_PER_PAGE);
  }, [page]);

  const goTo = (next: number) => {
    setPage(Math.min(totalPages, Math.max(1, next)));
  };

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

          <div className="relative mt-8 min-h-[880px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reduceMotion ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeInOut" }}
                className="grid grid-cols-3 gap-4"
              >
                {pagePosts.map((post) => (
                  <BlogPostCard key={`${page}-${post.title}`} post={post} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-16 flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white p-4 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src="/assets/blog/arrow-left.svg" alt="" className="size-4" />
            </button>

            <div className="flex items-center justify-center gap-2">
              {pages.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goTo(n)}
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
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              className="flex items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white p-4 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src="/assets/blog/arrow-right.svg" alt="" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
