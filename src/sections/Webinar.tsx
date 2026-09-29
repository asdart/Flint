import Button from "../components/ui/Button";

type WebinarProps = {
  title?: React.ReactNode;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

/** Section / Webinar (new, Figma node 5987:3227). A centered header and a Reserve seat button over
 * a video-call mockup: the arc sits behind (`-bg`), the call card in the middle (`-call`) and the
 * participants pill on top (`-participants`); see `classes.md` → `fk-webinar-*`. */
export default function Webinar({
  title = (
    <>
      Got a question
      <br />
      about Flint?
    </>
  ),
  body = "Join our free Q&A webinar",
  buttonLabel = "Reserve seat",
  buttonLink = "#reserve-seat",
}: WebinarProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-tertiary">
        <img
          className="fk-webinar-bg"
          src="/assets/home/webinar-bg-arc.webp"
          alt=""
          width={2400}
          height={668}
          loading="lazy"
        />
        <div className="fk-container fk-relative">
          <div className="fk-panel-content">
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

            <div className="fk-webinar-stage" data-ix="reveal">
              <img
                className="fk-webinar-call"
                src="/assets/home/webinar-call.webp"
                alt="Neil Prigge hosting a live Q&A webinar on a video call"
                width={1254}
                height={836}
                loading="lazy"
              />
              <img
                className="fk-webinar-participants"
                src="/assets/home/webinar-participants.webp"
                alt="234 participants"
                width={708}
                height={306}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
