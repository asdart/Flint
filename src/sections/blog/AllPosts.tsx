import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Select from "../../components/Select";
import BlogPostCard from "./BlogPostCard";
import { ALL_POSTS, POSTS_PER_PAGE, POST_CATEGORIES } from "./posts";

export default function AllPosts() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("All");
  const reduceMotion = useReducedMotion();

  const filteredPosts = useMemo(
    () =>
      category === "All"
        ? ALL_POSTS
        : ALL_POSTS.filter((post) => post.category === category),
    [category],
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const pagePosts = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, page]);

  const goTo = (next: number) => {
    setPage(Math.min(totalPages, Math.max(1, next)));
  };

  const onCategoryChange = (next: string) => {
    setCategory(next);
    setPage(1);
  };

  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full flex-col items-center overflow-clip rounded-[24px] bg-brand-light px-20 pb-12 pt-24">
        <div className="flex w-full max-w-[1200px] flex-col gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex w-full items-center justify-between">
              <h2
                data-reveal
                className="font-serif text-[40px] leading-[44px] tracking-[-0.8px] text-ink"
              >
                All posts
              </h2>
              <Select
                className="w-[262px]"
                aria-label="Filter posts by category"
                value={category}
                onChange={onCategoryChange}
                options={[
                  { value: "All", label: "All" },
                  ...POST_CATEGORIES.map((item) => ({ value: item, label: item })),
                ]}
              />
            </div>

            <div className="relative min-h-[896px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${category}-${page}`}
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: reduceMotion ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeInOut" }}
                  className="grid grid-cols-3 gap-4"
                >
                  {pagePosts.map((post) => (
                    <BlogPostCard key={`${category}-${page}-${post.title}`} post={post} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex size-12 items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    className={`flex size-12 items-center justify-center rounded-full border bg-white text-[14px] leading-5 text-ink transition-colors hover:bg-stone-50 ${
                      active
                        ? "border-ink font-semibold"
                        : "border-[#d3d7de] font-medium"
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
              className="flex size-12 items-center justify-center rounded-[24px] border border-[#d3d7de] bg-white transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src="/assets/blog/arrow-right.svg" alt="" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
