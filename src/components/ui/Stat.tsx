import { cx } from "../../lib/cx";

type StatProps = {
  value: string;
  suffix?: string;
  label: string;
  /** Large: brand-colored 96px value (Stats Band Large). Default: ink 72px value, brand suffix, larger label. */
  variant?: "large" | "default";
};

/**
 * UI / Stat, a Webflow component (props Value, Suffix, Label; variants Large and Default). It keeps its own classes on
 * every element (a shared component, AGENTS.md rule 3), so the Default variant is only the `is-default` combo on
 * each of them: in Webflow those combos are variant style overrides on the same classes, which can't add or swap a
 * class. `fk-stat-value` is the ix-count-in target. On the root, `is-default` also makes the last stat of a 3-stat
 * band span the row on tablet (2 + 1).
 */
export default function Stat({ value, suffix, label, variant = "large" }: StatProps) {
  const variantClass = variant === "default" ? "is-default" : "";

  return (
    <div className={cx("fk-stat", variantClass)}>
      <p className={cx("fk-stat-value", variantClass)}>
        <span className={cx("fk-stat-number", variantClass)}>{value}</span>
        {suffix ? <span className={cx("fk-stat-suffix", variantClass)}>{suffix}</span> : null}
      </p>
      <p className={cx("fk-stat-label", variantClass)}>{label}</p>
    </div>
  );
}
