import CarouselDots from "../components/ui/CarouselDots";
import { cx } from "../lib/cx";

const STEPS = [
  {
    title: "Apply in 30 Seconds",
    body: "It's easy and there's no obligation or commitment after you apply.",
    tone: "inverse",
    variant: "tertiary",
    scrim: true,
    bgSize: [360, 464],
    artSize: [334, 309] as [number, number] | null,
  },
  {
    title: "Meet with Flint",
    body: "We'll meet with you to understand your unique situation and how we can help.",
    tone: "inverse",
    variant: "tertiary",
    scrim: true,
    bgSize: [398, 512],
    artSize: [334, 412] as [number, number] | null,
  },
  {
    title: "Interview Directly with Facilities",
    body: "We'll present you with facilities . You choose who to interview with.",
    tone: "default",
    variant: "tertiary",
    scrim: false,
    bgSize: [294, 241],
    artSize: [382, 457] as [number, number] | null,
  },
  {
    title: "Relocate",
    body: "We'll help organize and pay for relocation to your new sponsored role. ",
    tone: "default",
    variant: "tertiary",
    scrim: false,
    bgSize: [399, 513],
    artSize: null as [number, number] | null,
  },
  {
    title: "You Start Work",
    body: "After the probation period, immigration filing begins",
    tone: "default",
    variant: "brand-light",
    scrim: false,
    bgSize: [294, 241],
    artSize: [334, 381] as [number, number] | null,
  },
  {
    title: "You Work Towards Stability",
    body: "While your green card processes you continue to work and get paid.",
    tone: "inverse",
    variant: "tertiary",
    scrim: true,
    bgSize: [399, 513],
    artSize: [382, 457] as [number, number] | null,
  },
] as const;

/** Section / How It Works, variant Home. Motion is `x-carousel` (tween). Each card layers a full-bleed `-bg` (photo, gradient or
 * pattern) under an optional floating `-art` illustration and a `-copy` block; see `classes.md` →
 * `fk-how` for the split and the per-card offsets. */
export default function HowItWorks() {
  return (
    <section className="fk-section is-x-flush">
      <div className="fk-how fk-flex fk-flex-col fk-gap-12 fk-overflow-clip" data-x-carousel="tween" data-x-autoplay="5000" role="region" aria-roledescription="carousel" aria-label="How Flint works">
        <div className="fk-container">
          <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h2 className="fk-heading-xl">How Flint works</h2>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg fk-color-brand-80">Flint helps healthcare professionals connect with hospitals sponsoring ready to sponsor you and hire you full-time.<br/><br/>From step one to day one on the job, Flint is with you every step of the way.</p>
            </div>
          </div>
        </div>

        <div className="fk-flex fk-flex-col fk-gap-12 fk-w-full">
          <div className="fk-w-full" data-ix="reveal">
            <div className="fk-how-viewport" data-x-viewport>
              <div className="fk-how-track" data-x-track>
                {STEPS.map((step, index) => {
                  const number = index + 1;
                  const [bgWidth, bgHeight] = step.bgSize;
                  return (
                    <div
                      key={step.title}
                      className={cx("fk-how-slide", index === 0 && "is-active")}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${number} of ${STEPS.length}`}
                    >
                      <article
                        className={cx(
                          "fk-how-card",
                          index === 0 && "is-active",
                          step.variant === "brand-light" && "is-brand-light",
                        )}
                      >
                        <img
                          className={cx("fk-how-bg", (number === 3 || number === 5) && `is-card-${number}`)}
                          src={`/assets/home/how-card-bg-${number}.webp`}
                          alt=""
                          width={bgWidth}
                          height={bgHeight}
                        />
                        {step.scrim && <div className="fk-how-scrim" aria-hidden="true" />}
                        {step.artSize && (
                          <img
                            className={cx("fk-how-art", [1, 2, 3, 6].includes(number) && `is-card-${number}`)}
                            src={`/assets/home/how-card-art-${number}.webp`}
                            alt=""
                            width={step.artSize[0]}
                            height={step.artSize[1]}
                          />
                        )}
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
          <CarouselDots count={STEPS.length} label={(index) => `Go to step ${index + 1}`} />
        </div>
      </div>
    </section>
  );
}
