import { Link } from "react-router-dom";
import SiteNav from "../../components/SiteNav";
import { FEATURED_POST } from "./posts";

export default function BlogHero() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="relative flex w-full flex-col gap-10 overflow-clip rounded-[24px] bg-tertiary p-4 md:gap-16">
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

        <div className="relative z-10">
          <SiteNav active="Blog" />
        </div>

        <div className="relative z-0 flex w-full flex-col items-center pb-8 md:pb-16">
          <div className="flex w-full max-w-[1200px] flex-col gap-8 md:gap-12">
            <div className="flex w-full max-w-[480px] flex-col gap-2">
              <h1
                data-reveal
                className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]"
              >
                The Flint blog
              </h1>
              <p data-reveal className="text-[16px] leading-6 text-subtle md:text-[18px] md:leading-7">
                Immigration, licensing, and hiring tips for healthcare workers seeking Visa
                sponsorship.
              </p>
            </div>

            <Link
              data-reveal
              to={`/blog/${FEATURED_POST.slug}`}
              className="group flex h-auto w-full flex-col-reverse items-stretch rounded-[24px] bg-white p-3 sm:p-4 lg:h-[480px] lg:flex-row lg:items-center lg:justify-between lg:py-4 lg:pr-4 lg:pl-12"
            >
              <div className="flex w-full shrink-0 flex-col gap-1 px-3 py-5 sm:px-4 lg:w-[422px] lg:px-0 lg:py-0">
                <div className="flex flex-wrap items-center gap-1 text-[14px] leading-5 tracking-[-0.23px] text-brand md:text-[16px] md:leading-6">
                  <span>{FEATURED_POST.date}</span>
                  <span aria-hidden>·</span>
                  <span>{FEATURED_POST.category}</span>
                </div>
                <h2 className="pt-1 text-[24px] leading-8 tracking-[-0.11px] text-ink md:text-[32px] md:leading-10">
                  {FEATURED_POST.title}
                </h2>
                <p className="pt-2 text-[16px] leading-6 tracking-[-0.23px] text-subtle md:text-[18px] md:leading-7">
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
                  <span className="text-[14px] leading-5 tracking-[-0.23px] text-subtle md:text-[16px] md:leading-6">
                    {FEATURED_POST.author} · {FEATURED_POST.readTime}
                  </span>
                </div>
              </div>
              <div className="relative h-[220px] w-full shrink-0 overflow-clip rounded-[16px] sm:h-[280px] lg:h-full lg:w-[552px] lg:rounded-[20px]">
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
