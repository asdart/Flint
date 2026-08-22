import { useEffect, useRef } from "react";
import SiteNav from "../../components/SiteNav";

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
      <div className="relative h-[720px] w-full overflow-clip rounded-[24px] shadow-[0px_20px_40px_0px_rgba(0,0,0,0.1)] md:h-[848px]">
        <video
          src="/assets/facility/hero.mp4"
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: OVERLAY }} />

        <SiteNav
          active="Facility partners"
          variant="dark"
          layout="overlay"
          cta={
            <button
              type="button"
              className="flex items-center justify-center rounded-[24px] border border-white/20 bg-white/[0.16] px-[14px] py-[6px] text-[14px] font-medium leading-5 tracking-[-0.028px] text-white shadow-[inset_0px_2px_6px_0px_rgba(255,255,255,0.25)] backdrop-blur-[10px] transition-[background-color,border-color,transform] duration-300 ease-in-out hover:border-white/40 hover:bg-white/40 active:scale-[0.98]"
            >
              Apply now
            </button>
          }
        />

        <div className="absolute top-1/2 left-1/2 z-10 flex w-full max-w-[436px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 px-5 text-center md:gap-8">
          <div className="flex flex-col gap-4">
            <h1
              data-hero-reveal
              className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-white md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]"
            >
              Find Top
              <br />
              Healthcare Talent
            </h1>
            <p data-hero-reveal className="text-[16px] leading-6 text-white opacity-60 md:text-[18px] md:leading-7">
              Connect with 100,000+ vetted candidates. We simplify staffing for hospitals, clinics,
              and care facilities.
            </p>
          </div>
          <button
            data-hero-reveal
            type="button"
            className="flex items-center justify-center rounded-[24px] border border-stone-50 bg-white px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-ink shadow-[inset_0px_-1px_2px_0px_rgba(0,0,0,0.15)] transition-[background-color,transform] duration-300 ease-in-out hover:bg-[#f5f5f5] active:scale-[0.98]"
          >
            Apply now
          </button>
        </div>
      </div>
    </section>
  );
}
