type StatProps = {
  value: string;
  suffix?: string;
  label: string;
};

/** UI / Stat (Large). `fk-stat-value` is the ix-count-in target. */
export default function Stat({ value, suffix, label }: StatProps) {
  return (
    <div className="fk-stat">
      <p className="fk-stat-value">
        <span className="fk-heading-display is-xl">{value}</span>
        {suffix ? <span className="fk-stat-suffix">{suffix}</span> : null}
      </p>
      <p className="fk-stat-label">{label}</p>
    </div>
  );
}
