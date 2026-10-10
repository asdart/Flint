import { Fragment } from "react";
import Button from "../components/ui/Button";
import { cx } from "../lib/cx";

type PageHeroProps = {
  title: string;
  /** Paragraphs separated by a blank line (`\n\n`), each a centered `p`; a single `\n` inside one is a line break (`br`), no blank line. */
  body: string;
  variant?: "default" | "half-screen";
  /** Shows the primary button under the body. Off by default. */
  showButton?: boolean;
  buttonLabel?: string;
  /** Where the button goes. Home by default. */
  buttonLink?: string;
};

/**
 * Page Hero. A component (D-17): the generic simple page header, used by Privacy Policy, Terms of
 * Service, the 404 and Thank You. A centered brand-light panel with the page's one `h1`, a centered
 * multi-paragraph body (the legal pages pass "Effective date: …"; a date is never a heading) and an
 * optional primary button. Props: Title, Body, Show Button, Button Label, Button Link. Variants:
 * Default, Half Screen (`is-half`: min-height 50vh, content centered both ways). Same panel and blur
 * reveal as Article Hero.
 */
export default function PageHero({
  title,
  body,
  variant = "default",
  showButton = false,
  buttonLabel = "Back to home",
  buttonLink = "/",
}: PageHeroProps) {
  const half = variant === "half-screen";

  return (
    <section className="fk-section">
      <div
        className={cx(
          "fk-panel",
          half ? "is-half fk-flex fk-items-center fk-justify-center" : "is-blog-hero",
          "fk-bg-brand-light",
        )}
      >
        <div className="fk-container">
          <div className="fk-section-header is-center" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h1 className="fk-heading-lg fk-text-center">{title}</h1>
            </div>
            <div className="fk-blur-reveal is-delay-1 fk-flex fk-flex-col fk-gap-7">
              {body.split("\n\n").map((paragraph) => (
                <p key={paragraph} className="fk-text-lg fk-color-brand fk-text-center">
                  {paragraph.split("\n").map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>
            {showButton ? (
              <div className="fk-blur-reveal is-delay-2">
                <div className="fk-section-header-action">
                  <Button label={buttonLabel} link={buttonLink} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
