type StatProps = {
  value: string;
  suffix?: string;
  label: string;
};

/** UI / Stat (Large). `fk-stat-value` is the ix-count-in target. */
export default function Stat({ value, suffix, label }: StatProps) {
  return (
    <div className="fk-flex fk-flex-col fk-items-center">
      <p className="fk-stat-value fk-flex fk-items-center fk-justify-center fk-color-brand">
        <span className="fk-heading-display is-xl">{value}</span>
        {suffix ? <span className="fk-stat-suffix">{suffix}</span> : null}
      </p>
      <p className="fk-stat-label fk-text-center fk-color-subtle-80">{label}</p>
    </div>
  );
}
