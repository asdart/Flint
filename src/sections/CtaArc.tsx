import ArcStage from "../components/ui/ArcStage";
import Button from "../components/ui/Button";

type CtaArcProps = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

/** Section / CTA, variant Arc (Candidates, Figma 5985:2430, D-34): a centered header over the Home hero's
 * rotating arc of portrait cards, cropped by the panel's bottom edge. Page-level pattern (D-17), no props in
 * Webflow. The arc is the shared `ArcStage` (`fk-hero-*`, `ix-hero-arc`). */
export default function CtaArc({
  title = "It's Time to Find Your Green Card Sponsor",
  body = "Join hundreds of healthcare professionals who have started working towards permanent stability in the US.",
  buttonLabel = "Apply now",
  buttonLink = "https://web.withflint.com/apply",
}: CtaArcProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-tertiary is-flush-bottom">
        <div className="fk-container">
          <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h2 className="fk-heading-xl">{title}</h2>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg fk-color-brand-80">{body}</p>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-section-header-action">
                <Button label={buttonLabel} link={buttonLink} />
              </div>
            </div>
          </div>
        </div>

        <ArcStage lazy />
      </div>
    </section>
  );
}
