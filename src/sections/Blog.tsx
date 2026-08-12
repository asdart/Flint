import { Link } from "react-router-dom";

const POSTS = [
  {
    title: "How to Apply for Nurse Green Card Sponsorship (EB-3)",
    excerpt:
      "Learn how to apply for nurse green card sponsorship in 2026, from eligibility and employer matching to EB-3 support and next steps.",
  },
  {
    title: "Can Healthcare Workers on TPS, DACA, or Asylum Get EB-3 Green Card Sponsorship?",
    excerpt:
      "Learn how EB-3 sponsorship may work for TPS, DACA, or asylum healthcare workers in the U.S., including risks, eligibility, and next steps.",
  },
  {
    title: "Finding Visa Sponsorship with Flint Works: Steps for CNAs, LPNs, and RNs",
    excerpt: "Unsure about what Flint does or who it's for? This in-depth guide is for you.",
  },
];

export default function Blog() {
  return (
    <section className="flex w-full flex-col items-center gap-16 bg-white px-6 py-24">
      <header className="flex w-[436px] flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-4">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            The Flint Blog
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Immigration, licensing, and hiring tips for healthcare workers seeking Visa sponsorship.
          </p>
        </div>
        <span data-reveal className="inline-flex">
          <Link
            to="/blog"
            className="relative flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-[#0a0a0a] shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98]"
          >
            See all posts
          </Link>
        </span>
      </header>

      <div className="flex w-full max-w-[1200px] gap-4">
        {POSTS.map((post) => (
          <article
            key={post.title}
            data-reveal
            className="flex min-w-0 flex-1 flex-col gap-4"
          >
            <div className="relative aspect-[389/420] w-full overflow-clip rounded-2xl">
              <img
                src="/assets/home/blog-cover.jpg"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 px-4">
              <h3 className="text-[18px] font-medium leading-7 tracking-[-0.036px] text-ink">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-[18px] leading-7 tracking-[-0.036px] text-subtle">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
