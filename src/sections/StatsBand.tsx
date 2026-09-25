import Stat from "../components/ui/Stat";

type StatsBandProps = {
  title: string;
  stats: Array<{ value: string; suffix?: string; label: string }>;
};

/** Section / Stats Band (Large). */
export default function StatsBand({ title, stats }: StatsBandProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel is-brand-light">
        <div className="fk-stats-band">
          <h2 className="fk-heading-md is-center" data-ix="reveal">
            {title}
          </h2>
          <div className="fk-stats-band-grid">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
