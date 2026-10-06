import Button from "../components/ui/Button";

type CtaProps = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

/** Section / CTA, variant Art: a ring texture and a room photo, both masked, on the right. */
export default function Cta({
  title = "It's time to find your green card sponsor",
  body = "We've helped hundreds of Registered Nurses find a permanent path to stability in the US.\nNow it's your turn. Apply now to check your eligibility.",
  buttonLabel = "Apply now",
  buttonLink = "https://web.withflint.com/apply",
}: CtaProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-tertiary is-relaxed">
        <div className="fk-cta-ring" aria-hidden="true">
          <img className="fk-cta-ring-image" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} />
        </div>
        <div className="fk-cta-room" aria-hidden="true">
          <div className="fk-cta-window">
            <img className="fk-cta-window-image" src="/assets/home/cta-room.webp" alt="" width={1154} height={970} />
          </div>
          <img className="fk-cta-photo" src="/assets/home/cta-photo.webp" alt="" width={1156} height={971} />
        </div>
        <div className="fk-container">
          <div className="fk-section-header is-narrow" data-ix="blur-reveal">
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
      </div>
    </section>
  );
}
