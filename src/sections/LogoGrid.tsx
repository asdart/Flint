/** Investor logos in Figma's order (5805:4037): file, rendered alt text, intrinsic size. */
const LOGOS = [
  { src: "/assets/about/investor-yc.svg", alt: "Y Combinator", width: 185, height: 90 },
  { src: "/assets/about/investor-haystack.webp", alt: "Haystack", width: 316, height: 77 },
  { src: "/assets/about/investor-audacious.webp", alt: "Audacious", width: 412, height: 216 },
  { src: "/assets/about/investor-rhino.svg", alt: "Rhino Ventures", width: 137, height: 42 },
] as const;

/**
 * Section / Logo Grid (Figma 5805:4030, phone 5974:8122). Page-level markup (D-17: only About has it). A centred
 * header and four uniform tiles: 4 across, 2 × 2 on Tablet (inferred, the phone design is one column), one
 * column on Mobile. The tiles reveal one after another. The header repeats the Team header copy on purpose
 * (Figma's; see About Team). The logos are named in alt text; the tiles are not links.
 */
export default function LogoGrid() {
  return (
    <section className="fk-section is-open">
      <div className="fk-container is-flush">
        <div className="fk-flex fk-flex-col fk-items-center fk-gap-12 fk-gap-8-mobile">
          <div
            className="fk-flex fk-flex-col fk-items-center fk-text-center fk-gap-6 fk-gap-4-mobile fk-w-full fk-max-w-content-sm"
            data-ix="blur-reveal"
          >
            <div className="fk-blur-reveal">
              <div className="fk-section-header is-center">
                <p className="fk-eyebrow">What makes Flint different</p>
                <h2 className="fk-heading-xl">Backed by the best</h2>
              </div>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg fk-color-brand-80">
                Investors who saw the same gap we did: a healthcare system in crisis, and a global workforce ready to
                fill it, if only someone built the bridge.
              </p>
            </div>
          </div>
          <div className="fk-grid fk-cols-4 fk-cols-2-tablet fk-cols-1-mobile fk-gap-2 fk-w-full" data-ix="reveal-stagger">
            {LOGOS.map((logo, index) => (
              <div
                key={logo.alt}
                className="fk-logo-grid-tile fk-bg-tertiary fk-rounded-lg fk-flex fk-items-center fk-justify-center"
                data-ix-item
              >
                <img
                  className={`fk-logo-grid-image is-l${index + 1}`}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
