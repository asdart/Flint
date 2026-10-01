type StatProps = {
  value: string;
  suffix?: string;
  label: string;
  /** Large: brand-colored 96px value (Stats Band Large). Default: ink 72px value, brand suffix, larger label. */
  variant?: "large" | "default";
};

/** UI / Stat. `fk-stat-value` is the ix-count-in target. The root's `fk-stat` sets nothing on its own; the Default
 * variant's `is-default` makes the last stat of a 3-stat band span the row on tablet (2 + 1). */
export default function Stat({ value, suffix, label, variant = "large" }: StatProps) {
  if (variant === "default") {
    return (
      <div className="fk-stat is-default fk-flex fk-flex-col fk-items-center">
        <p className="fk-stat-value fk-flex fk-items-center fk-justify-center fk-color-ink">
          <span className="fk-heading-display">{value}</span>
          {suffix ? <span className="fk-stat-suffix fk-color-brand">{suffix}</span> : null}
        </p>
        <p className="fk-text-lg fk-text-center fk-color-ink-80">{label}</p>
      </div>
    );
  }

  return (
    <div className="fk-stat fk-flex fk-flex-col fk-items-center">
      <p className="fk-stat-value fk-flex fk-items-center fk-justify-center fk-color-brand">
        <span className="fk-heading-display is-xl">{value}</span>
        {suffix ? <span className="fk-stat-suffix">{suffix}</span> : null}
      </p>
      <p className="fk-stat-label fk-text-center fk-color-subtle-80">{label}</p>
    </div>
  );
}
