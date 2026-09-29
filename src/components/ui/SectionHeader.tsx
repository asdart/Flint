type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  /** One text element per paragraph (Webflow rich text paragraphs can't be classed through the MCP). */
  body?: string[];
};

/** UI / Section Header (Center). */
export default function SectionHeader({ eyebrow, title, body }: SectionHeaderProps) {
  return (
    <div className="fk-section-header is-center">
      {eyebrow ? <p className="fk-eyebrow">{eyebrow}</p> : null}
      <h2 className="fk-heading-xl">{title}</h2>
      {body?.length ? (
        <div className="fk-section-header-body">
          {body.map((paragraph) => (
            <p key={paragraph} className="fk-text-lg fk-color-brand-80">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
