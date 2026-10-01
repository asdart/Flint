const RESIDENCY = [
  "Most pathways into U.S. healthcare work run through temporary visas — TN status, contracts that expire, sponsorships that reset the clock every few years. Flint works differently. We match candidates with facilities willing to sponsor a green card from day one. Candidates work, earn a full salary, and build their life in the U.S. while their permanent residency processes — typically around three years. No temp status. No uncertainty about next year. A future they can actually plan around.",
  "For facilities, that same commitment solves the problem agency staffing never could: retention. A nurse who's building a life and a green card in your hospital isn't leaving in 13 weeks.",
];

/**
<<<<<<< HEAD
 * Residency on About (Figma 5805:4021, phone 5974:8111). Page-level markup (D-17, user decision 2026-10-01: Media
 * Split is not a component, Facility partners won't use it). A white `fk-panel is-relaxed` band: a left-aligned
=======
 * Residency on About (Figma 5805:4021, phone 5974:8111). Page-level markup (D-17, user decision 2026-10-01: Media
 * Split is not a component, Facility partners won't use it). An unpaneled `fk-section is-open` band: a left-aligned
>>>>>>> 4cc4d59 (Review the roadmap against the repo (2026-10-01))
 * copy column (eyebrow, h2, paragraphs) and a rounded photo that reveals on scroll. Tablet and down: one column,
 * photo on top, centred title. The photo is lazy-loaded (below the fold).
 */
export default function AboutResidency() {
  return (
    <section className="fk-section">
      <div className="fk-panel is-relaxed">
        <div className="fk-container">
          <div className="fk-split fk-items-start fk-items-stretch-tablet fk-justify-between fk-gap-12 fk-gap-8-tablet">
            <div className="fk-split-copy is-wide fk-gap-6" data-ix="blur-reveal">
              <div className="fk-section-header fk-text-center-tablet">
                <div className="fk-blur-reveal">
                  <p className="fk-eyebrow">What makes Flint different</p>
                </div>
                <div className="fk-blur-reveal is-delay-1">
                  <h2 className="fk-heading-xl">Permanent residency, not another visa</h2>
                </div>
              </div>
              <div className="fk-blur-reveal is-delay-2">
                <div className="fk-flex fk-flex-col fk-gap-7">
                  {RESIDENCY.map((paragraph) => (
                    <p key={paragraph} className="fk-text-lg fk-color-brand-80">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="fk-split-media is-photo" data-ix="reveal">
              <img
                className="fk-split-image fk-block fk-w-full fk-object-cover fk-rounded-lg"
                src="/assets/home/two-ways-facility.webp"
                alt="A nurse and residents in the bright lounge of a care home"
                width={1426}
                height={951}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
