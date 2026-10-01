import { CANDIDATES } from "../../content/portraits";

const ARC_CARDS = [...CANDIDATES, ...CANDIDATES];

type ArcStageProps = {
  /** Cards below the fold load lazily (the Home hero's are above it). */
  lazy?: boolean;
};

/**
 * The rotating arc of portrait cards (`fk-hero-stage` > `fk-hero-wheel` > 20 `fk-hero-card`s), shared by
 * Section / Hero (Home) and Section / CTA, variant Arc (Candidates). It is the same markup in
 * Webflow, driven by `ix-hero-arc` through `data-ix="hero-arc"`.
 */
export default function ArcStage({ lazy = false }: ArcStageProps) {
  return (
    <div className="fk-hero-stage" data-ix="hero-arc" aria-hidden="true">
      <div className="fk-hero-wheel">
        {ARC_CARDS.map((candidate, index) => {
          const crop = (index % CANDIDATES.length) + 1;
          return (
            <div className={`fk-hero-card is-a${index + 1}`} key={`${candidate.image}-${index}`}>
              <img
                className={`fk-hero-card-image is-c${crop}`}
                src={candidate.image}
                alt=""
                width={candidate.size[0]}
                height={candidate.size[1]}
                loading={lazy ? "lazy" : undefined}
              />
              <div className="fk-hero-card-chip">
                <img className="fk-flag" src={candidate.flag} alt="" width={20} height={20} loading={lazy ? "lazy" : undefined} />
                <span className="fk-hero-card-name">{candidate.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
