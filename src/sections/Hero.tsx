import ArcStage from "../components/ui/ArcStage";
import Button from "../components/ui/Button";

/** Section / Hero, Home variant. */
export default function Hero() {
  return (
    <section className="fk-section is-padded-bottom">
      <div className="fk-panel fk-bg-secondary is-hero">
        <div className="fk-container">
          <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h1 className="fk-heading-xl">Find Healthcare Jobs with Green Card Sponsorship</h1>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-lg fk-color-brand-80">Flint helps you secure a sponsored healthcare job, relocate, and work towards your Green Card in the US.</p>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-section-header-action fk-pt-2-mobile">
                <Button />
              </div>
            </div>
          </div>
        </div>

        <ArcStage />
      </div>
    </section>
  );
}
