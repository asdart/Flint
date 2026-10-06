import Modal from "../components/ui/Modal";
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
  buttonLink = "#webinar-registration",
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

/** The registration modal (UI / Modal, `size="compact"`, Figma node 5985:3080): opened by the Reserve seat link
 * (`#webinar-registration`, exception x-modal). `fk-modal-embed` stands for Webflow's Embed element holding the
 * Livestorm iframe (exception x-webinar-embed). The iframe ships with `data-src` and no `src`; x-modal copies it to `src` when the
 * modal first opens, so Livestorm (and its fonts) load on open, not on page view. Render it last in `.fk-page`, after the Footer: revealed
 * sections are transformed and would become a fixed element's containing block. */
export function WebinarModal() {
  return (
    <Modal id="webinar-registration" labelledBy="webinar-registration-title" size="compact">
      <p id="webinar-registration-title" className="fk-heading-md is-center">
        Join our free Q&amp;A webinar
      </p>
      <div className="fk-modal-embed">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          data-src="https://app.livestorm.co/p/ee1df681-411c-4d3f-8900-e3dfd08246eb/form"
          title="Finding Green Card Sponsored Healthcare Roles with Flint | Q&A Session"
        ></iframe>
      </div>
    </Modal>
  );
}
