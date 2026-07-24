import { Link } from "react-router-dom";
import ApplyButton from "../../components/ApplyButton";
import { FEATURED_POST } from "./posts";
import { NAV_LINKS } from "../../nav";

export default function BlogHero() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="relative overflow-clip rounded-[24px] bg-tertiary p-4">
        <Link to="/" className="absolute left-4 top-[15px] z-20">
          <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
        </Link>
        <nav className="absolute left-1/2 top-6 z-20 flex -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
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
        <div className="absolute right-4 top-[18px] z-20">
          <ApplyButton variant="white" reveal={false} />
        </div>

        {/* Hero content — top padding clears the absolute nav (same geometry
            as Home / Candidates / Facility partners). */}
        <div className="relative z-0 flex w-full flex-col items-center pb-16 pt-24">
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

            {/* Featured banner — full-width photo with the post overlaid at the
                bottom over a dark gradient. */}
            <div data-reveal className="relative w-full">
              <Link
                to="/blog"
                className="group relative block h-[560px] w-full cursor-pointer rounded-[24px] bg-white p-2"
              >
                <div className="relative size-full overflow-clip rounded-[20px]">
                  <img
                    src={FEATURED_POST.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  {/* Bottom gradient scrim + backdrop blur. The blur is masked
                      with the same gradient so it's strong at the bottom and
                      fades out by ~39% height, keeping the photo crisp up top
                      (matching Figma's alpha-masked background blur). */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[20px]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 39.43%)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      maskImage:
                        "linear-gradient(to top, black 0%, rgba(0,0,0,0) 39.43%)",
                      WebkitMaskImage:
                        "linear-gradient(to top, black 0%, rgba(0,0,0,0) 39.43%)",
                    }}
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col p-8">
                    <div className="flex items-center gap-1 text-[16px] leading-6 tracking-[-0.23px] text-[#a2a9b3]">
                      <span>{FEATURED_POST.date}</span>
                      <span aria-hidden>·</span>
                      <span>{FEATURED_POST.category}</span>
                    </div>
                    <h2 className="pt-1 text-[28px] leading-9 tracking-[-0.11px] text-white">
                      {FEATURED_POST.title}
                    </h2>
                    <p className="max-w-[720px] pt-2 text-[16px] leading-6 tracking-[-0.23px] text-[#a2a9b3]">
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
                      <span className="text-[16px] leading-6 tracking-[-0.23px] text-[#a2a9b3]">
                        {FEATURED_POST.author} · {FEATURED_POST.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
