type ServiceCardProps = {
  /** An SVG path, e.g. `/assets/home/offer-hospital.svg`. Omitted for icon-less cards (Role Grid). */
  icon?: string;
  title: string;
  body: string;
  /** `is-subtle` sets the body text to `color-subtle` instead of the default `color-brand`. */
  variant?: "default" | "subtle";
};

/** UI / Service Card. Hover motion is `ix-card-hover`. */
export default function ServiceCard({ icon, title, body, variant = "default" }: ServiceCardProps) {
  return (
    <article className="fk-card">
      {icon ? <img className="fk-icon is-lg" src={icon} alt="" width={40} height={40} /> : null}
      <div className="fk-card-body" data-ix="blur-reveal">
        <div className="fk-blur-reveal">
          <h3 className="fk-card-title">{title}</h3>
        </div>
        <div className="fk-blur-reveal is-delay-1">
          <p className={variant === "subtle" ? "fk-card-text is-subtle" : "fk-card-text"}>{body}</p>
        </div>
      </div>
    </article>
  );
}
