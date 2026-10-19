import Button from "../components/ui/Button";

type CandidatesPartnerHeroProps = {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  /** The image's width and height attributes (rule 15: largest displayed size, the file's aspect). */
  imageSize: readonly [number, number];
};

/**
 * Section / Candidates / Partner Hero (used by Caregiver for hire and Vital Healthcare Training Center, 2026-10-17):
 * the shell `fk-section` > `fk-panel fk-bg-brand-light` > `fk-container`, holding a two-column `fk-split` with the
 * copy (h1, body, Apply button) on the left and a rounded photo on the right. Tablet and down: one column, the photo on top.
 * The Apply link is the header's. The photo is the above-the-fold image, so it is eager.
 */
export default function CandidatesPartnerHero({ title, body, image, imageAlt, imageSize }: CandidatesPartnerHeroProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-split fk-items-center fk-justify-between fk-gap-12 fk-gap-8-tablet">
            <div className="fk-split-copy is-wide fk-gap-6" data-ix="blur-reveal-hero">
              <div className="fk-section-header fk-text-center-tablet">
                <div className="fk-blur-reveal">
                  <h1 className="fk-heading-xl">{title}</h1>
                </div>
                <div className="fk-blur-reveal is-delay-1">
                  <p className="fk-text-lg fk-color-subtle">{body}</p>
                </div>
              </div>
              <div className="fk-blur-reveal is-delay-2">
                <div className="fk-section-header-action fk-justify-center-mobile">
                  <Button link="https://web.withflint.com/apply" />
                </div>
              </div>
            </div>
            <div className="fk-split-media is-hero" data-ix="reveal">
              <img
                className="fk-split-image is-top fk-block fk-w-full fk-object-cover fk-rounded-lg"
                src={image}
                alt={imageAlt}
                width={imageSize[0]}
                height={imageSize[1]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
