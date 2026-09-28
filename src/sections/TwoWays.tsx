import Button from "../components/ui/Button";
import { cx } from "../lib/cx";

type TwoWaysCardProps = {
  variant: "nurses" | "facilities";
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
};

function NursesArt() {
  return (
    <div className="fk-two-ways-art is-nurses" aria-hidden="true">
      <div className="fk-two-ways-canvas">
        <img
          className="fk-two-ways-nurse-right"
          src="/assets/home/two-ways-nurse-right.png"
          alt=""
          width={159}
          height={211}
        />
        <img
          className="fk-two-ways-nurse-left"
          src="/assets/home/two-ways-nurse-left.png"
          alt=""
          width={249}
          height={311}
        />
        <div className="fk-two-ways-orb is-left" />
        <div className="fk-two-ways-orb is-right" />
        <img
          className="fk-two-ways-nurse-center"
          src="/assets/home/two-ways-nurse-center.png"
          alt=""
          width={173}
          height={184}
        />
      </div>
    </div>
  );
}

function FacilitiesArt() {
  return (
    <div className="fk-two-ways-art is-facilities" aria-hidden="true">
      <img
        className="fk-two-ways-facility-image"
        src="/assets/home/two-ways-facility.png"
        alt=""
        width={2346}
        height={1560}
      />
    </div>
  );
}

function TwoWaysCard({ variant, eyebrow, title, body, buttonLabel }: TwoWaysCardProps) {
  const isNurses = variant === "nurses";

  return (
    <article
      className={cx("fk-two-ways-card", isNurses ? "is-brand-light" : "is-secondary")}
      data-ix="two-ways-card"
    >
      {isNurses ? <NursesArt /> : <FacilitiesArt />}
      <div className="fk-two-ways-content">
        <div className="fk-two-ways-copy">
          <p className="fk-text-md is-brand-muted">{eyebrow}</p>
          <h3 className="fk-heading-sm is-sans">{title}</h3>
          <p className="fk-text-md is-subtle">{body}</p>
        </div>
        <div className="fk-blur-reveal">
          <div className="fk-two-ways-action">
            <Button label={buttonLabel} link="#apply" variant="secondary" />
          </div>
        </div>
      </div>
    </article>
  );
}

type TwoWaysProps = {
  title?: React.ReactNode;
  body?: string;
};

/** Section / Two Ways. Each banner runs its own ix-two-ways-card scroll timeline. */
export default function TwoWays({
  title = "Flint helps healthcare facilities hire.",
  body = "A fresh opportunity for healthcare professionals.\nA new pool of candidates for facilities.",
}: TwoWaysProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg is-brand-muted">{body}</p>
              </div>
            </div>

            <div className="fk-two-ways-cards">
              <TwoWaysCard
                variant="nurses"
                eyebrow="For Healthcare Professionals"
                title="Not just a job. A permanent future."
                body="Find a healthcare role with a facility ready to sponsor your green card from day one."
                buttonLabel="See if you qualify"
              />
              <TwoWaysCard
                variant="facilities"
                eyebrow="For Healthcare Facilities"
                title="Build a permanent team."
                body="Put an end to expensive agency staff. Flint connects your facility with licensed and motivated professionals already in the US."
                buttonLabel="Apply as facility"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
