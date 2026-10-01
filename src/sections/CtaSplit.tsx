import Button from "../components/ui/Button";

/**
 * Section / CTA (Split) (Figma 5805:4141; no tablet or phone frame, so the stack is inferred, D-34). Page-level
 * markup (D-17: only About has it): two equal cards side by side, a grey `fk-bg-brand-light` one for candidates and a
 * peach `fk-bg-tertiary` one for facilities, each a left-aligned 436px header (h2, body, Primary Button) centred
 * in a 560px panel. One column from Tablet down. The cards reveal one after the other. (The ring and photo
 * layers inside Figma's cards render nothing and are left out.)
 */
export default function CtaSplit() {
  return (
    <section className="fk-section">
      <div className="fk-grid fk-cols-2 fk-cols-1-tablet fk-gap-4 fk-gap-2-mobile" data-ix="reveal-stagger">
        <div
          className="fk-panel is-split fk-bg-brand-light fk-flex fk-items-center fk-justify-center"
          data-ix-item
        >
          <div className="fk-section-header is-tight">
            <h2 className="fk-heading-xl">
              Not just a job.
              <br />
              A permanent future.
            </h2>
            <p className="fk-text-lg fk-color-brand-80">
              Find a healthcare role with a facility ready to sponsor your green card from day one.
            </p>
            <div className="fk-section-header-action">
              <Button label="See if you qualify" link="/candidates" />
            </div>
          </div>
        </div>
        <div className="fk-panel is-split fk-bg-tertiary fk-flex fk-items-center fk-justify-center" data-ix-item>
          <div className="fk-section-header is-tight">
            <h2 className="fk-heading-xl">Create a lasting team for success.</h2>
            <p className="fk-text-lg fk-color-brand-80">
              Stop paying costly agency fees. Flint links you to licensed, motivated US professionals.
            </p>
            <div className="fk-section-header-action">
              <Button label="Apply as facility" link="/facility-partners" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
