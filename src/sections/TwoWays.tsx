import Button from "../components/ui/Button";
import { cx } from "../lib/cx";

type TwoWaysCardProps = {
  variant: "nurses" | "facilities";
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonLink: string;
};

function NursesArt() {
  return (
    <div
      className="fk-two-ways-art is-nurses fk-relative fk-shrink-0 fk-w-full fk-overflow-clip"
      aria-hidden="true"
    >
      <div className="fk-two-ways-canvas fk-absolute fk-h-full">
        <img
          className="fk-two-ways-nurse-right fk-absolute fk-block fk-object-cover"
          src="/assets/home/two-ways-nurse-right.webp"
          alt=""
          width={159}
          height={213}
        />
        <img
          className="fk-two-ways-nurse-left fk-absolute fk-block fk-object-cover"
          src="/assets/home/two-ways-nurse-left.webp"
          alt=""
          width={311}
          height={311}
        />
        <div className="fk-two-ways-orb is-left fk-absolute fk-rounded-full fk-bg-tertiary" />
        <div className="fk-two-ways-orb is-right fk-absolute fk-rounded-full fk-bg-tertiary" />
        <img
          className="fk-two-ways-nurse-center fk-absolute fk-block fk-object-cover"
          src="/assets/home/two-ways-nurse-center.webp"
          alt=""
          width={173}
          height={185}
        />
      </div>
    </div>
  );
}

function FacilitiesArt() {
  return (
    <div
      className="fk-two-ways-art is-facilities fk-relative fk-shrink-0 fk-w-full fk-overflow-clip"
      aria-hidden="true"
    >
      <img
        className="fk-two-ways-facility-image fk-absolute fk-block fk-w-full fk-rounded-lg fk-object-cover"
        src="/assets/home/two-ways-facility.webp"
        alt=""
        width={975}
        height={650}
      />
    </div>
  );
}

function TwoWaysCard({ variant, eyebrow, title, body, buttonLabel, buttonLink }: TwoWaysCardProps) {
  const isNurses = variant === "nurses";

  return (
    <article
      className={cx(
        "fk-two-ways-card",
        isNurses ? "is-brand-light" : "is-secondary",
        "fk-flex fk-flex-col fk-items-center fk-justify-center fk-min-w-0 fk-rounded-xl fk-overflow-clip",
        isNurses ? "fk-bg-brand-light" : "fk-bg-secondary",
      )}
      data-ix="two-ways-card"
    >
      {isNurses ? <NursesArt /> : <FacilitiesArt />}
      <div className="fk-two-ways-content fk-flex fk-flex-col fk-items-center fk-gap-6 fk-w-full">
        <div className="fk-flex fk-flex-col fk-items-center fk-gap-2 fk-w-full fk-text-center">
          <p className="fk-text-md fk-color-brand-80" data-two-ways="eyebrow">
            {eyebrow}
          </p>
          <h3 className="fk-heading-sm is-sans" data-two-ways="title">
            {title}
          </h3>
          <p className="fk-text-md fk-color-subtle" data-two-ways="body">
            {body}
          </p>
        </div>
        <div className="fk-blur-reveal">
          <div className="fk-flex">
            <Button label={buttonLabel} link={buttonLink} variant="secondary" />
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
                <p className="fk-text-lg fk-color-brand-80">{body}</p>
              </div>
            </div>

            <div className="fk-flex fk-items-stretch fk-gap-4 fk-w-full fk-flex-col-tablet">
              <TwoWaysCard
                variant="nurses"
                eyebrow="For Healthcare Professionals"
                title="Not just a job. A permanent future."
                body="Find a healthcare role with a facility ready to sponsor your green card from day one."
                buttonLabel="See if you qualify"
                buttonLink="/candidates"
              />
              <TwoWaysCard
                variant="facilities"
                eyebrow="For Healthcare Facilities"
                title="Build a permanent team."
                body="Put an end to expensive agency staff. Flint connects your facility with licensed and motivated professionals already in the US."
                buttonLabel="Apply as facility"
                buttonLink="/facility-partners"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
