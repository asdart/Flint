import Stat from "../components/ui/Stat";

type StatsBandProps = {
  /** Optional in Default: without a title the band is the untitled form (brand-light panel, no rings; Facility partners). */
  title?: React.ReactNode;
  stats: Array<{ value: string; suffix?: string; label: string }>;
  /** Large: brand-light panel, `fk-heading-md` title. Default: tertiary panel, two gradient rings, a one-line sans title. */
  variant?: "large" | "default";
};

/** Section / Stats Band. Large (brand-light, 4 stats) and Default (tertiary, 3 stats, rings). In Webflow
 * the rings are children of the component that the Large variant hides. */
export default function StatsBand({ title, stats, variant = "large" }: StatsBandProps) {
  if (variant === "default" && !title) {
    return (
      <section className="fk-section">
        <div className="fk-panel fk-bg-brand-light is-relaxed">
          <div className="fk-container">
            <div className="fk-stats-band-spread fk-w-full fk-max-w-container-md fk-mx-auto">
              {stats.map((stat) => (
                <Stat key={stat.label} variant="default" {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "default") {
    return (
      <section className="fk-section">
        <div className="fk-panel fk-bg-tertiary is-cozy">
          <div className="fk-stats-band-ring is-top" aria-hidden="true">
            <img className="fk-stats-band-ring-image" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
          </div>
          <div className="fk-stats-band-ring is-bottom" aria-hidden="true">
            <img className="fk-stats-band-ring-image is-rotated" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
          </div>
          <div className="fk-container fk-relative">
            <div className="fk-flex fk-flex-col fk-items-center fk-gap-16 fk-w-full">
              <h2 className="fk-heading-sm is-sans fk-text-center" data-ix="reveal">
                {title}
              </h2>
              <div className="fk-grid fk-cols-3 fk-cols-1-mobile fk-gap-16-mobile fk-w-full fk-max-w-container-md">
                {stats.map((stat) => (
                  <Stat key={stat.label} variant="default" {...stat} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-container fk-flex fk-flex-col fk-items-center fk-gap-12 fk-gap-16-mobile">
          <h2 className="fk-heading-md is-center" data-ix="reveal">
            {title}
          </h2>
          <div className="fk-stats-band-grid fk-items-center fk-justify-between fk-w-full fk-gap-8-tablet fk-gap-12-mobile">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
