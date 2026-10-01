const STORY = [
  "Flint was founded in 2024 by Kenton Jarvie, Anson Kung, and Neil Prigge — but the idea didn't start as a business plan. One founder immigrated to the U.S. from South Africa and knows firsthand how opaque and exhausting that process can be. Another is married to a nurse. A third watched his mother immigrate from Hong Kong and build a 25-year nursing career in America, one that changed the trajectory of their entire family.",
  "Between them, they saw the same story play out over and over: extraordinary healthcare professionals, held back not by skill but by a broken pipeline into the country that needed them most. Flint exists to fix that pipeline.",
];

/**
 * Our Story on About (Figma 5805:3995 pattern). Page-level markup (D-17, user decision 2026-10-02). Same layout as the Mission on a Brand Light panel.
 */
export default function AboutStory() {
  return (
    <section className="fk-section">
      <div className="fk-panel is-radius-lg fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-section-header is-center is-prose" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <p className="fk-eyebrow">Our Story</p>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <h2 className="fk-heading-xl">Why this is personal</h2>
            </div>
            <div className="fk-blur-reveal is-delay-2">
              <div className="fk-section-header-body">
                {STORY.map((paragraph) => (
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
