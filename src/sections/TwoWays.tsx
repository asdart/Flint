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
          <p className="fk-two-ways-eyebrow">{eyebrow}</p>
          <h3 className="fk-two-ways-title">{title}</h3>
          <p className="fk-two-ways-body">{body}</p>
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
  title = (
    <>
      One mission.
      <br />
      Two ways in.
    </>
  ),
  body = "Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.",
}: TwoWaysProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel is-flush-x">
        <div className="fk-container">
          <div className="fk-two-ways">
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
                eyebrow="Nurses"
                title="Not a visa. A permanent future."
                body="Flint sponsors your green card, so from day one you're building something that lasts."
                buttonLabel="Apply as nurse"
              />
              <TwoWaysCard
                variant="facilities"
                eyebrow="Facilities"
                title="Retain nurses, don't rent."
                body="Flint sponsors your green card, so from day one you're building something that lasts."
                buttonLabel="Apply as facility"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
