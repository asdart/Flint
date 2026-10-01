const MISSION = [
  "U.S. hospitals are in crisis. Rural and community facilities in particular can't find, or keep, enough nurses — and the agencies they turn to charge a fortune for staff who leave in a year. At the same time, there are millions of qualified nurses, CNAs, and medical professionals overseas who would give anything for a stable future in the United States. Two enormous problems. One obvious, underbuilt solution.",
  "Flint connects them directly. We recruit healthcare professionals from around the world, prepare them for U.S. licensure and interviews, and place them with hospitals and care facilities that don't just need shift coverage — they're ready to sponsor someone for permanent residency. Every step of that journey — licensing, immigration, legal fees, relocation — is covered by Flint. It costs the candidate nothing.",
  "Most staffing models optimize for the next 13 weeks. We optimize for the next 3 to 5 years, and for the decades after that. The outcome isn't a placement. It's a green card, a career, and often a family able to build a permanent life in the U.S.",
];

/**
 * Mission on About (Figma 5805:3995). Page-level markup (D-17, user decision 2026-10-01: Text Panel is not a component). A centred 521px text column on a Tertiary panel: eyebrow, title and three paragraphs; the title and paragraphs use the blur reveal, each child in its own wrapper.
 */
export default function AboutMission() {
  return (
    <section className="fk-section">
      <div className="fk-panel is-radius-lg fk-bg-tertiary">
        <div className="fk-container">
          <div className="fk-section-header is-center is-prose" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <p className="fk-eyebrow">Mission</p>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <h2 className="fk-heading-xl">Why we exist</h2>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-section-header-body">
                {MISSION.map((paragraph) => (
                  <p key={paragraph} className="fk-text-lg fk-color-brand-80">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
