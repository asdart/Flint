import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ApplyButton from "../../components/ApplyButton";
import BlogPostCard from "./BlogPostCard";
import { FEATURED_POST, SIDE_POSTS } from "./posts";

const NAV_LINKS = [
  { label: "Services", to: "/" },
  { label: "Candidates", to: "/candidates" },
  { label: "Facility partners", to: "/facility-partners" },
  { label: "About", to: "/" },
  { label: "Blog", to: "/blog" },
];

export default function BlogHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const flowerY = useTransform(scrollYProgress, [0, 1], [0, 24]);

  return (
    <section ref={sectionRef} className="w-full px-4 pt-4">
      <div className="relative flex flex-col gap-16 overflow-clip rounded-[24px] bg-tertiary p-4">
        {/* Nav */}
        <nav className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between">
          <Link to="/">
            <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
          </Link>
          <div className="flex items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`whitespace-nowrap transition-colors hover:text-ink ${
                  link.label === "Blog" ? "text-ink" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <ApplyButton variant="white" reveal={false} />
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex w-full flex-col items-center pb-16">
          <div className="flex w-full max-w-[1200px] flex-col gap-12">
            <div className="flex max-w-[480px] flex-col gap-2">
              <h1
                data-reveal
                className="font-serif text-[40px] leading-[44px] tracking-[-0.8px] text-ink"
              >
                Insights &amp; Resources
              </h1>
              <p data-reveal className="text-[18px] leading-7 text-subtle">
                Industry trends, nursing tips, licensing paths, and staffing guides for clinicians
                and managers.
              </p>
            </div>

            <div className="flex w-full items-start gap-4">
              <div className="relative min-w-0 flex-1">
                {/* Decorative flower, scoped to the featured card so it peeks
                    from behind its corners, with a subtle vertical parallax
                    drift on scroll. The drift lives on an unrotated wrapper so
                    it stays purely vertical and doesn't fight the inner
                    rotate-90 transform. */}
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{ y: shouldReduceMotion ? 0 : flowerY }}
                >
                  <div
                    className="absolute -left-[1009px] top-[172px] size-[2019px] opacity-80"
                    style={{
                      maskImage: "url(/assets/stats-mask-1.svg)",
                      WebkitMaskImage: "url(/assets/stats-mask-1.svg)",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                    }}
                    aria-hidden
                  >
                    <img src="/assets/stats-bg.png" alt="" className="size-full object-cover" />
                  </div>
                </motion.div>
                <BlogPostCard post={FEATURED_POST} variant="featured" />
              </div>
              <div className="flex w-[427px] shrink-0 flex-col gap-2.5">
                {SIDE_POSTS.map((post, i) => (
                  <BlogPostCard key={i} post={post} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
