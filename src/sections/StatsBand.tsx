import Stat from "../components/ui/Stat";

type StatsBandProps = {
  /** Required in Large and Default, absent in Spread (the title child is simply not there). */
  title?: React.ReactNode;
  stats: Array<{ value: string; suffix?: string; label: string }>;
  /** Large: brand-light panel, `fk-heading-md` title. Default: tertiary panel, two gradient rings, a one-line sans
   * title. Spread: untitled, brand-light relaxed panel, no rings, three fixed-width stats spread to both ends. */
  variant?: "large" | "default" | "spread";
};

/** Section / Stats Band. Large (brand-light, 4 stats), Default (tertiary, 3 stats, rings) and Spread (Facility
 * partners: untitled, 3 stats). One tree for all three: `fk-section > fk-panel > [rings] > fk-container >
 * column > [title] > stats row`. The variants differ by classes on those elements and by the optional children
 * (rings and title), which Webflow hides per variant. */
export default function StatsBand({ title, stats, variant = "large" }: StatsBandProps) {
  const isDefault = variant === "default";
  const isSpread = variant === "spread";
  const statVariant = variant === "large" ? "large" : "default";

  const panel = {
    large: "fk-panel fk-bg-brand-light",
    default: "fk-panel fk-bg-tertiary is-cozy",
    spread: "fk-panel fk-bg-brand-light is-relaxed",
  }[variant];
  const column = {
    large: "fk-gap-12 fk-gap-16-mobile",
    default: "fk-gap-16",
    spread: "",
  }[variant];
  const row = {
    large: "fk-stats-band-grid fk-items-center fk-justify-between fk-gap-8-tablet fk-gap-12-mobile",
    default: "fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-12-tablet fk-gap-16-mobile fk-max-w-container-md",
    spread: "fk-stats-band-spread fk-max-w-container-md fk-mx-auto",
  }[variant];

  return (
    <section className="fk-section">
      <div className={panel}>
        {isDefault ? (
          <>
            <div className="fk-ring is-corner-top" aria-hidden="true">
              <img className="fk-ring-image" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
            </div>
            <div className="fk-ring is-corner-bottom" aria-hidden="true">
              <img className="fk-ring-image is-rotated" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
            </div>
          </>
        ) : null}
        <div className="fk-container fk-relative">
          <div className={`fk-flex fk-flex-col fk-items-center ${column}`.trim()}>
            {isSpread ? null : variant === "large" ? (
              <h2 className="fk-heading-md is-center" data-ix="reveal">
                {title}
              </h2>
            ) : (
              <h2 className="fk-heading-sm is-sans fk-text-center" data-ix="reveal">
                {title}
              </h2>
            )}
            <div className={`${row} fk-w-full`}>
              {stats.map((stat) => (
                <Stat key={stat.label} variant={statVariant} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
