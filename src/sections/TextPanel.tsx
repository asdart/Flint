type TextPanelProps = {
  eyebrow: string;
  title: string;
  body: string[];
};

/** Section / Text Panel (Tertiary). */
export default function TextPanel({ eyebrow, title, body }: TextPanelProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-tertiary is-radius-lg">
        <div className="fk-container is-content-sm" data-ix="reveal">
          <div className="fk-section-header is-center">
            {eyebrow ? <p className="fk-eyebrow">{eyebrow}</p> : null}
            <h2 className="fk-heading-xl">{title}</h2>
            {body.length ? (
              <div className="fk-section-header-body">
                {body.map((paragraph) => (
                  <p key={paragraph} className="fk-text-lg fk-color-brand-80">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
