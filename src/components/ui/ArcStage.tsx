import { CANDIDATES, ARC_IMAGE_SIZE } from "../../content/portraits";

const ARC_CARDS = [...CANDIDATES, ...CANDIDATES];

/**
 * The rotating arc of portrait cards (`fk-hero-stage` > `fk-hero-wheel` > 20 `fk-hero-card`s), shared by
 * Section / Hero (Home) and Section / CTA, variant Arc (Candidates). It is the component
 * `UI / Arc Stage` in Webflow (no props), driven by `ix-hero-arc` through `data-ix="hero-arc"`. The card images
 * are lazy everywhere (as in Webflow).
 */
export default function ArcStage() {
  return (
    <div className="fk-hero-stage" data-ix="hero-arc" aria-hidden="true">
      <div className="fk-hero-wheel">
        {ARC_CARDS.map((candidate, index) => {
          return (
            <div className={`fk-hero-card is-a${index + 1}`} key={`${candidate.arc}-${index}`}>
              <img
                className="fk-hero-card-image fk-w-full fk-h-full"
                src={candidate.arc}
                alt=""
                width={ARC_IMAGE_SIZE[0]}
                height={ARC_IMAGE_SIZE[1]}
                loading="lazy"
              />
              <div className="fk-hero-card-chip">
                <img className="fk-flag" src={candidate.flag} alt="" width={20} height={20} loading="lazy" />
                <span className="fk-hero-card-name">{candidate.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
