import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/" },
  { label: "Candidates", to: "/candidates" },
  { label: "Facility partners", to: "/facility-partners" },
  { label: "About", to: "/" },
  { label: "Blog", to: "/" },
];

const OVERLAY =
  "linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 18.6%), linear-gradient(rgba(0,0,0,0) 55.8%, rgba(0,0,0,0.8) 100%), linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.28))";

export default function FacilityPartnersHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    items.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 90}ms`);
      el.classList.add("is-visible");
    });
  }, []);

  return (
    <section ref={sectionRef} className="w-full p-4">
      <div className="relative h-[848px] w-full overflow-clip rounded-[24px] shadow-[0px_20px_40px_0px_rgba(0,0,0,0.1)]">
        <img
          src="/assets/facility/hero.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: OVERLAY }} />

        <Link to="/" className="absolute left-4 top-[15px] z-10">
          <img src="/assets/wordmark-white.svg" alt="Flint" className="h-6 w-[49px]" />
        </Link>

        <nav className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 text-white/60">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`whitespace-nowrap transition-colors hover:text-white ${
                link.label === "Facility partners" ? "text-white" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute right-4 top-[18px] z-10">
          <button
            type="button"
            className="flex items-center justify-center rounded-[24px] border border-white/20 bg-white/[0.16] px-[14px] py-[6px] text-[14px] font-medium leading-5 tracking-[-0.028px] text-white shadow-[inset_0px_2px_6px_0px_rgba(255,255,255,0.25)] backdrop-blur-[10px] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Apply now
          </button>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 flex w-[436px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1
              data-hero-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-white"
            >
              Find Top
              <br />
              Healthcare Talent
            </h1>
            <p data-hero-reveal className="text-[18px] leading-7 text-white opacity-60">
              Connect with 100,000+ vetted candidates. We simplify staffing for hospitals, clinics,
              and care facilities.
            </p>
          </div>
          <button
            data-hero-reveal
            type="button"
            className="flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Apply now
          </button>
        </div>
      </div>
    </section>
  );
}
