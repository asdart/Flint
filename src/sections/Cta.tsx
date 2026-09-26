import Button from "../components/ui/Button";

type CtaProps = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

/** Section / CTA, variant Art: a ring texture and a room photo, both masked, on the right. */
export default function Cta({
  title = "Your green card pathway starts here.",
  body = "Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.",
  buttonLabel = "Apply now",
  buttonLink = "#apply",
}: CtaProps) {
  return (
    <section className="fk-section is-last">
      <div className="fk-cta">
        <div className="fk-cta-ring" aria-hidden="true">
          <img className="fk-cta-ring-image" src="/assets/home/cta-flower.png" alt="" />
        </div>
        <div className="fk-cta-room" aria-hidden="true">
          <div className="fk-cta-window">
            <img className="fk-cta-window-image" src="/assets/home/cta-room.jpg" alt="" />
          </div>
          <img className="fk-cta-photo" src="/assets/home/cta-photo.png" alt="" />
        </div>
        <div className="fk-section-header is-narrow" data-ix="blur-reveal">
          <div className="fk-blur-reveal">
            <h2 className="fk-heading-xl">{title}</h2>
          </div>
          <div className="fk-blur-reveal is-delay-1">
            <p className="fk-text-lg is-brand-muted">{body}</p>
          </div>
          <div className="fk-blur-reveal is-delay-2">
            <div className="fk-cta-action">
              <Button label={buttonLabel} link={buttonLink} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
