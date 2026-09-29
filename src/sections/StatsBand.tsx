import Stat from "../components/ui/Stat";

type StatsBandProps = {
  title: string;
  stats: Array<{ value: string; suffix?: string; label: string }>;
};

/** Section / Stats Band (Large). */
export default function StatsBand({ title, stats }: StatsBandProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-flex fk-flex-col fk-items-center fk-gap-12 fk-gap-10-mobile fk-w-full fk-max-w-container fk-mx-auto">
          <h2 className="fk-heading-md is-center" data-ix="reveal">
            {title}
          </h2>
          <div className="fk-stats-band-grid fk-items-center fk-justify-between fk-w-full fk-gap-8-tablet">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
