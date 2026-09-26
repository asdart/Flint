import Pagination from "../components/ui/Pagination";
import { cx } from "../lib/cx";

const STEPS = [
  {
    title: "Apply in 30 Seconds",
    body: "We will make sure we can help you with your immigration case.",
    tone: "inverse",
  },
  {
    title: "Meet with Flint",
    body: "Apply to any facility; if successful, you’ll get an offer.",
    tone: "inverse",
  },
  {
    title: "Call with Facility",
    body: "While your Green card processes you continue to work",
    tone: "default",
  },
  {
    title: "Relocate",
    body: "We help with your relocation and license transfer.",
    tone: "default",
  },
  {
    title: "Start work",
    body: "After the probation period, immigration filing begins",
    tone: "default",
  },
  {
    title: "Processing",
    body: "While your Green card processes you continue to work",
    tone: "inverse",
  },
] as const;

/** Section / How It Works, variant Home. */
export default function HowItWorks() {
  return (
    <section className="fk-how">
      <div className="fk-how-inner">
        <div className="fk-how-header">
          <div className="fk-section-header is-center" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h2 className="fk-heading-xl">How Flint works</h2>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg is-brand-muted">
                Flint helps eligible healthcare professionals connect with hospitals sponsoring
                Green Cards.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fk-how-reveal" data-ix="reveal">
        <div className="fk-how-viewport" data-ix="how-carousel">
          <div className="fk-how-track" data-how-track>
            {STEPS.map((step, index) => {
              const number = index + 1;
              return (
                <div
                  key={step.title}
                  className={cx("fk-how-slide", index === 0 && "is-active")}
                  data-how-slide={number}
                >
                  <article
                    className={cx("fk-how-card", index === 0 && "is-active")}
                    data-how-card={number}
                  >
                    <img
                      className="fk-how-art"
                      src={`/assets/home/how-card-${number}.png`}
                      alt=""
                      width={720}
                      height={928}
                    />
                    <div
                      className={cx(
                        "fk-how-copy",
                        step.tone === "inverse" && "is-inverse",
                      )}
                    >
                      <h3 className="fk-how-title">{step.title}</h3>
                      <p className="fk-how-body">{step.body}</p>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fk-how-pagination" data-ix="reveal">
        <Pagination id="how" count={STEPS.length} label={(index) => `Go to step ${index + 1}`} />
      </div>
    </section>
  );
}
