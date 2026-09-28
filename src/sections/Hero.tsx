import Button from "../components/ui/Button";

const CANDIDATES = [
  { image: "/assets/home/candidate-01.png", name: "Maria", flag: "/assets/flags/ph.svg" },
  { image: "/assets/home/candidate-02.png", name: "Chrismene", flag: "/assets/flags/ht.svg" },
  { image: "/assets/home/candidate-03.png", name: "Wanjiru", flag: "/assets/flags/ke.svg" },
  { image: "/assets/home/candidate-04.png", name: "Kwame", flag: "/assets/flags/gh.svg" },
  { image: "/assets/home/candidate-05.png", name: "Emeka", flag: "/assets/flags/ng.svg" },
  { image: "/assets/home/candidate-06.png", name: "Ama", flag: "/assets/flags/gh.svg" },
  { image: "/assets/home/candidate-07.png", name: "Daniel", flag: "/assets/flags/ke.svg" },
  { image: "/assets/home/candidate-08.png", name: "Ngozi", flag: "/assets/flags/ng.svg" },
  { image: "/assets/home/candidate-09.png", name: "Linh", flag: "/assets/flags/vn.svg" },
  { image: "/assets/home/candidate-10.png", name: "Samuel", flag: "/assets/flags/et.svg" },
] as const;

const ARC_CARDS = [...CANDIDATES, ...CANDIDATES];

/** Section / Hero, Home variant. */
export default function Hero() {
  return (
    <section className="fk-section is-last">
      <div className="fk-panel is-secondary is-hero">
        <div className="fk-container">
          <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h1 className="fk-heading-xl">Find Healthcare Jobs with Green Card Sponsorship</h1>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg is-brand-muted">Flint helps you secure a sponsored healthcare job, relocate, and work towards your Green Card in the US.</p>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-hero-action">
                <Button />
              </div>
            </div>
          </div>
        </div>

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
                  />
                  <div className="fk-hero-card-chip">
                    <img className="fk-flag" src={candidate.flag} alt="" width={20} height={20} />
                    <span className="fk-hero-card-name">{candidate.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
