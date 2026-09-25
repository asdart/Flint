import SectionHeader from "../components/ui/SectionHeader";

type TextPanelProps = {
  eyebrow: string;
  title: string;
  body: string[];
};

/** Section / Text Panel (Tertiary). */
export default function TextPanel({ eyebrow, title, body }: TextPanelProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel is-tertiary is-radius-lg">
        <div className="fk-container is-content-sm" data-ix="reveal">
          <SectionHeader eyebrow={eyebrow} title={title} body={body} />
        </div>
      </div>
    </section>
  );
}
