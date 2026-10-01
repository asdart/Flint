type ServiceCardProps = {
  /** An SVG path, e.g. `/assets/home/offer-hospital.svg`. Omitted for icon-less cards (Role Grid). */
  icon?: string;
  title: string;
  body: string;
  /** `is-subtle` sets the body text to `color-subtle` instead of the default `color-brand`. */
  variant?: "default" | "subtle";
  /** `md` is the 32px icon of the Benefits cards (`fk-icon is-md`); the default is the 40px `is-lg`. */
  iconSize?: "lg" | "md";
};

/**
 * Service card markup (fk-card). Repo-side helper only, like CarouselDots: in Webflow this is not a
 * component but plain divs and classes written into each section (decided 2026-09-29). The Subtle
 * look is the `is-subtle` combo on the text. Hover motion is `ix-card-hover`.
 */
export default function ServiceCard({ icon, title, body, variant = "default", iconSize = "lg" }: ServiceCardProps) {
  return (
    <article className="fk-card fk-flex fk-flex-col fk-items-start fk-justify-between fk-w-full fk-h-full fk-overflow-clip">
      {icon ? (
        <img
          className={iconSize === "md" ? "fk-icon is-md" : "fk-icon is-lg"}
          src={icon}
          alt=""
          width={iconSize === "md" ? 32 : 40}
          height={iconSize === "md" ? 32 : 40}
        />
      ) : null}
      <div className="fk-flex fk-flex-col fk-gap-2 fk-w-full" data-ix="blur-reveal">
        <div className="fk-blur-reveal">
          <h3 className="fk-card-title fk-text-md fk-font-medium">{title}</h3>
        </div>
        <div className="fk-blur-reveal is-delay-1">
          <p
            className={
              variant === "subtle" ? "fk-card-text is-subtle fk-text-md" : "fk-card-text fk-text-md"
            }
          >
            {body}
          </p>
        </div>
      </div>
    </article>
  );
}
