import Button from "../components/ui/Button";

/**
 * Section / Facility Partners Hero (Figma 5543:1165, phone 5755:2546). Page-level markup (D-17: only Facility
 * partners has a video hero; a variant of Section / Hero can't swap the arc wheel for a video). A full-bleed video
 * card (`hero.mp4`, poster `hero-poster.webp`, as the legacy hero) under a dark overlay, with the centred header on top.
 * The Nav over it is `Global / Nav` Dark (`fk-nav is-dark`, exception x-nav-dark). With reduced motion the video is
 * paused on its poster: on Webflow by webflow.js itself (native Background Video), in the repo preview by
 * `src/ix/videoReduced.ts` (`data-x-video="reduced"`; x-video-reduced retired on Webflow 2026-10-02, D-43 amended).
 * The button's destination is TBD (placeholder `#`).
 */
export default function FacilityPartnersHero() {
  return (
    <section className="fk-section is-padded-bottom">
      <div className="fk-panel is-video fk-flex fk-items-center fk-justify-center">
        <video
          className="fk-video-media fk-absolute fk-inset-0 fk-block fk-w-full fk-h-full fk-object-cover"
          src="/assets/facility/hero.mp4"
          poster="/assets/facility/hero-poster.webp"
          width={1536}
          height={672}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          data-x-video="reduced"
        />
        <div className="fk-video-overlay fk-absolute fk-inset-0" aria-hidden="true" />
        <div className="fk-container is-inset fk-relative">
          <div className="fk-section-header is-center is-tight" data-ix="blur-reveal-hero">
            <div className="fk-blur-reveal">
              <h1 className="fk-heading-xl fk-color-white">
                Find Top
                <br />
                Healthcare Talent
              </h1>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg fk-color-white">
                Connect with 100,000+ vetted candidates. We simplify staffing for hospitals, clinics, and care facilities.
              </p>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-section-header-action">
                <Button variant="secondary" link="https://web.withflint.com/apply-facility" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
