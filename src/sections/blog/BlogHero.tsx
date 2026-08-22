import { Link } from "react-router-dom";
import ApplyButton from "../../components/ApplyButton";
import { FEATURED_POST } from "./posts";
import { NAV_LINKS } from "../../nav";

export default function BlogHero() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="relative flex w-full flex-col gap-16 overflow-clip rounded-[24px] bg-tertiary p-4">
        <div
          className="pointer-events-none absolute left-[-905px] top-[354px] size-[2019px] overflow-hidden"
          style={{
            WebkitMaskImage: "url(/assets/blog/hero-mask.svg)",
            maskImage: "url(/assets/blog/hero-mask.svg)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
          aria-hidden
        >
          <img
            src="/assets/blog/hero-bg.png"
            alt=""
            className="absolute left-[-82.25px] top-0 h-[2019px] w-[2971px] max-w-none object-cover"
          />
        </div>

        <div className="relative z-10 flex w-full shrink-0 items-center justify-between">
          <Link to="/">
            <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
          </Link>
          <nav className="flex items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
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
          </nav>
          <ApplyButton variant="white" reveal={false} />
        </div>

        <div className="relative z-0 flex w-full flex-col items-center pb-16">
          <div className="flex w-full max-w-[1200px] flex-col gap-12">
            <div className="flex max-w-[480px] flex-col gap-2">
              <h1
                data-reveal
                className="font-serif text-[40px] leading-[44px] tracking-[-0.8px] text-ink"
              >
                The Flint blog
              </h1>
              <p data-reveal className="text-[18px] leading-7 text-subtle">
                Immigration, licensing, and hiring tips for healthcare workers seeking Visa
                sponsorship.
              </p>
            </div>

            <Link
              data-reveal
              to={`/blog/${FEATURED_POST.slug}`}
              className="group flex h-[480px] w-full items-center justify-between rounded-[24px] bg-white py-4 pl-12 pr-4"
            >
              <div className="flex w-[422px] shrink-0 flex-col gap-1">
                <div className="flex items-center gap-1 text-[16px] leading-6 tracking-[-0.23px] text-brand">
                  <span>{FEATURED_POST.date}</span>
                  <span aria-hidden>·</span>
                  <span>{FEATURED_POST.category}</span>
                </div>
                <h2 className="pt-1 text-[32px] leading-10 tracking-[-0.11px] text-ink">
                  {FEATURED_POST.title}
                </h2>
                <p className="pt-2 text-[18px] leading-7 tracking-[-0.23px] text-subtle">
                  {FEATURED_POST.excerpt}
                </p>
                <div className="flex items-center gap-2 pt-4">
                  <span className="size-6 shrink-0 overflow-clip rounded-full bg-[#e6e5e0]">
                    <img
                      src="/assets/blog/author.png"
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="text-[16px] leading-6 tracking-[-0.23px] text-subtle">
                    {FEATURED_POST.author} · {FEATURED_POST.readTime}
                  </span>
                </div>
              </div>
              <div className="relative h-full w-[552px] shrink-0 overflow-clip rounded-[20px]">
                <img
                  src={FEATURED_POST.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
