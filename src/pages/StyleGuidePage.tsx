import chevronRight from "../assets/icons/chevron-right.svg";
import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import Button from "../components/ui/Button";
import SectionHeader from "../components/ui/SectionHeader";
import { useInteractions } from "../ix/useInteractions";

// Draft page "Style Guide" at /style-guide — roadmap phase 2. Visual QA of every registered
// token, class and UI component, in the repo and in Webflow. Not in the nav, not indexed.
const SAMPLE = "Your green card pathway starts here";

const TYPE_SCALE = [
  { className: "fk-heading-display is-xl", label: "fk-heading-display is-xl · 96/96 → 72/80 → 40/44" },
  { className: "fk-heading-display", label: "fk-heading-display · 72/80 → 48/52" },
  { className: "fk-heading-xl", label: "fk-heading-xl · 48/52 → 32/40" },
  { className: "fk-heading-lg", label: "fk-heading-lg · 40/44 → 32/40" },
  { className: "fk-heading-md", label: "fk-heading-md · 32/40 → 28/36" },
  { className: "fk-heading-sm", label: "fk-heading-sm · 24/32 → 20/28" },
  { className: "fk-text-lg", label: "fk-text-lg · 18/28 → 16/24" },
  { className: "fk-text-md", label: "fk-text-md · 16/24" },
  { className: "fk-text-sm", label: "fk-text-sm · 14/20" },
  { className: "fk-text-xs", label: "fk-text-xs · 12/16" },
  { className: "fk-eyebrow", label: "fk-eyebrow · 16/24, color-subtle" },
];

const PANELS = [
  { combo: "is-brand", label: "is-brand · color-brand", inverse: true },
  { combo: "is-brand-light", label: "is-brand-light · color-brand-light" },
  { combo: "is-secondary", label: "is-secondary · color-secondary" },
  { combo: "is-tertiary", label: "is-tertiary · color-tertiary" },
  { combo: "is-surface", label: "is-surface · color-surface" },
];

const GRIDS = [
  { combo: "is-2", cells: 2 },
  { combo: "is-3", cells: 3 },
  { combo: "is-4", cells: 4 },
];

export default function StyleGuidePage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main>
        <section className="fk-section">
          <div className="fk-panel is-tertiary">
            <div className="fk-container is-content">
              <SectionHeader
                eyebrow="Draft · visual QA"
                title="Style guide"
                body={["Every registered class and UI component, rendered from the same markup in the repo and in Webflow."]}
              />
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel is-surface">
            <div className="fk-container">
              <div className="fk-stack is-gap-xl">
                <h2 className="fk-heading-md">Typography</h2>
                {TYPE_SCALE.map((item) => (
                  <div key={item.className} className="fk-stack is-gap-sm">
                    <p className="fk-text-md is-subtle">{item.label}</p>
                    <p className={item.className}>{SAMPLE}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel is-surface">
            <div className="fk-container">
              <div className="fk-stack is-gap-lg">
                <h2 className="fk-heading-md">Buttons</h2>
                <p className="fk-text-md is-subtle">
                  UI / Button: Primary, Secondary, Primary Small, Secondary Small, and Secondary with an icon
                </p>
                <div className="fk-row">
                  <Button />
                  <Button variant="secondary" />
                  <Button size="small" />
                  <Button variant="secondary" size="small" />
                  <Button variant="secondary" label="Read more" icon={chevronRight} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel is-surface">
            <div className="fk-container">
              <div className="fk-stack is-gap-lg">
                <h2 className="fk-heading-md">Panels</h2>
                <div className="fk-grid is-3">
                  {PANELS.map((panel) => (
                    <div key={panel.combo} className={`fk-panel ${panel.combo} is-compact`}>
                      <p className={panel.inverse ? "fk-text-md is-inverse-muted" : "fk-text-md is-subtle"}>
                        {panel.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel is-brand-light">
            <div className="fk-container">
              <div className="fk-stack is-gap-lg">
                <h2 className="fk-heading-md">Grid</h2>
                {GRIDS.map((grid) => (
                  <div key={grid.combo} className={`fk-grid ${grid.combo}`}>
                    {Array.from({ length: grid.cells }, (_, index) => (
                      <div key={index} className="fk-panel is-surface is-compact">
                        <p className="fk-text-md is-subtle">fk-grid {grid.combo}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section is-last">
          <div className="fk-panel is-brand">
            <div className="fk-container">
              <div className="fk-stack is-gap-lg">
                <h2 className="fk-heading-xl is-inverse">Divider</h2>
                <p className="fk-text-md is-inverse-muted">fk-divider · 1px, color-white-10</p>
                <hr className="fk-divider" />
                <p className="fk-text-md is-inverse-muted">Used between footer groups</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
