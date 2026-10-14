import chevronRight from "../assets/icons/chevron-right.svg";
import Footer from "../components/global/Footer";
import Nav from "../components/global/Nav";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import Modal from "../components/ui/Modal";
import PostCard from "../components/ui/PostCard";
import { latestPosts } from "../content";
import ArticleNewsletter from "../sections/ArticleNewsletter";
import Newsletter from "../sections/Newsletter";
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
  { bg: "fk-bg-brand", label: "fk-bg-brand · color-brand", inverse: true },
  { bg: "fk-bg-brand-light", label: "fk-bg-brand-light · color-brand-light" },
  { bg: "fk-bg-secondary", label: "fk-bg-secondary · color-secondary" },
  { bg: "fk-bg-tertiary", label: "fk-bg-tertiary · color-tertiary" },
  { bg: "fk-bg-surface", label: "fk-bg-surface · color-surface" },
];

const GRIDS = [
  { classes: "fk-grid fk-cols-2 fk-cols-1-mobile fk-gap-4", cells: 2 },
  { classes: "fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4", cells: 3 },
  { classes: "fk-grid fk-cols-4 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4", cells: 4 },
];

export default function StyleGuidePage() {
  useInteractions();

  return (
    <div className="fk-page">
      <Nav />
      <main id="main">
        <section className="fk-section">
          <div className="fk-panel fk-bg-tertiary">
            <div className="fk-container is-content">
              <div className="fk-section-header is-center">
                <p className="fk-eyebrow">Draft · visual QA</p>
                <h2 className="fk-heading-xl">Style guide</h2>
                <div className="fk-section-header-body">
                  <p className="fk-text-lg fk-color-brand-80">
                    Every registered class and UI component, rendered from the same markup in the repo and in Webflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-8">
                <h2 className="fk-heading-md">Typography</h2>
                {TYPE_SCALE.map((item) => (
                  <div key={item.className} className="fk-flex fk-flex-col fk-gap-2">
                    <p className="fk-text-md fk-color-subtle">{item.label}</p>
                    <p className={item.className}>{SAMPLE}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Buttons</h2>
                <p className="fk-text-md fk-color-subtle">
                  UI / Button: Primary, Secondary, Primary Small, Secondary Small, and Secondary with an icon
                </p>
                <div className="fk-flex fk-wrap fk-items-center fk-gap-2">
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
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Filter dropdown</h2>
                <p className="fk-text-md fk-color-subtle">UI / Filter Dropdown (a menu of links, no label: the toggle text names it): placeholder look, options slot (plain links, as on the blog: the current option is left out of the list, D-28)</p>
                <div className="fk-flex fk-items-start">
                  <FilterDropdown label="All categories" menuLabel="Filter by category">
                    <a href="#careers" className="fk-filter-dropdown-link">Careers</a>
                    <a href="#licensing" className="fk-filter-dropdown-link">Licensing</a>
                  </FilterDropdown>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Modal</h2>
                <p className="fk-text-md fk-color-subtle">UI / Modal + exception x-modal: any element with data-x-modal-open="id" opens the dialog with data-x-modal="id". Esc, the backdrop and the close button close it; focus is trapped and returned to the trigger</p>
                <div className="fk-flex fk-items-start">
                  <a href="#sample-modal" className="fk-button" data-x-modal-open="sample-modal">
                    <span>Open modal</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <div className="fk-flex fk-flex-col fk-gap-6">
                  <h2 className="fk-heading-md">Input field</h2>
                  <p className="fk-text-md fk-color-subtle">
                    Form fields are plain markup per form (roadmap D-67): the Figma FormBody below is three Webflow Form Block fields (email, text,
                    text) styled with the shared fk-input-* classes, each with its own Name, Placeholder, Type and options. UI / Input
                    Field and UI / Select Field stay on Webflow as templates: place one, unlink it, then set Name / Placeholder / Type. Hover
                    and focus a field to see the states.
                  </p>
                  <div className="w-form">
                    <form name="wf-form-Style-guide" data-name="Style guide" method="get" aria-label="Input field samples">
                      <div className="fk-flex fk-flex-col fk-gap-6 fk-max-w-content-sm">
                        <InputField label="Email address" name="Email" id="email-field" type="email" placeholder="maria@facility.com" required />
                        <InputField label="First name" name="First-name" id="field-first-name" placeholder="Maria" />
                        <InputField label="Last name" name="Last-name" id="field-last-name" placeholder="Xavier" />
                      </div>
                    </form>
                  </div>
                </div>
                <div className="fk-flex fk-flex-col fk-gap-6">
                  <h3 className="fk-heading-sm">Templates</h3>
                  <p className="fk-text-md fk-color-subtle">
                    The two template components, still linked, for editors to drop in and unlink. Their Name, Placeholder and options are fixed in
                    the definition. Never leave one linked in a real form.
                  </p>
                  <div className="w-form">
                    <form name="wf-form-Style-guide-templates" data-name="Style guide templates" method="get" aria-label="Field templates">
                      <div className="fk-flex fk-flex-col fk-gap-6 fk-max-w-content-sm">
                        <InputField label="Input Field template" name="Email" id="template-input" type="email" placeholder="Email address" />
                        <SelectField
                          label="Select Field template"
                          name="Select"
                          id="template-select"
                          placeholder="Select one..."
                          options={[
                            { value: "option-1", label: "Option 1" },
                            { value: "option-2", label: "Option 2" },
                            { value: "option-3", label: "Option 3" },
                          ]}
                        />
                      </div>
                    </form>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Post card</h2>
                <p className="fk-text-md fk-color-subtle">UI / Post Card: image, title, excerpt, author and read time, all bound to a Post per instance.</p>
                <div className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4">
                  {latestPosts(1).map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Panels</h2>
                <div className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4">
                  {PANELS.map((panel) => (
                    <div key={panel.bg} className={`fk-panel is-compact ${panel.bg}`}>
                      <p className={panel.inverse ? "fk-text-md fk-color-white-80" : "fk-text-md fk-color-subtle"}>
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
          <div className="fk-panel fk-bg-brand-light">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-md">Grid</h2>
                {GRIDS.map((grid) => (
                  <div key={grid.classes} className={grid.classes}>
                    {Array.from({ length: grid.cells }, (_, index) => (
                      <div key={index} className="fk-panel is-compact fk-bg-surface">
                        <p className="fk-text-md fk-color-subtle">{grid.classes}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fk-section">
          <div className="fk-panel fk-bg-surface">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-8 fk-max-w-article fk-mx-auto">
                <h2 className="fk-heading-md">Article</h2>
                <p className="fk-text-md fk-color-subtle">fk-article-quick-answer</p>
                <div className="fk-article-quick-answer">
                  <p className="fk-article-quick-answer-label">Quick Answer</p>
                  <p className="fk-text-md fk-color-subtle">
                    Most EB-3 nurses receive their visa number within a year of filing, depending on the priority date.
                  </p>
                </div>
                <p className="fk-text-md fk-color-subtle">fk-article-body (Rich Text nested styles)</p>
                <div className="fk-article-body w-richtext">
                  <h2>What happens after you file</h2>
                  <p>
                    Your petition is reviewed, then your case moves to the <a href="#article">National Visa Center</a>.
                    Keep every document you receive.
                  </p>
                  <ul>
                    <li>Confirm your priority date</li>
                    <li>Prepare your civil documents</li>
                    <li>Schedule your interview</li>
                  </ul>
                  <ol>
                    <li>File the petition</li>
                    <li>Wait for the visa number</li>
                  </ol>
                  <blockquote>The process is long, but each step has a clear next action.</blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
        <ArticleNewsletter />

        <section className="fk-section">
          <div className="fk-panel fk-bg-brand">
            <div className="fk-container">
              <div className="fk-flex fk-flex-col fk-gap-6">
                <h2 className="fk-heading-xl fk-color-white">Divider</h2>
                <p className="fk-text-md fk-color-white-80">fk-divider · 1px, color-white-10</p>
                <hr className="fk-divider" />
                <p className="fk-text-md fk-color-white-80">Used between footer groups</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Modal id="sample-modal" labelledBy="sample-modal-title">
        <div className="fk-flex fk-flex-col fk-gap-1">
          <p id="sample-modal-title" className="fk-text-lg fk-font-medium fk-color-ink-80">Modal title</p>
          <p className="fk-text-lg fk-color-subtle">Optional subtitle</p>
        </div>
        <div className="fk-flex fk-flex-col fk-gap-4">
          <p className="fk-text-lg fk-color-brand-80">
            The body copy goes here. The panel is 713px wide with 96px of padding, so the text column is 521px, and the content scrolls inside the panel when it is taller than the screen.
          </p>
          <p className="fk-text-lg fk-color-brand-80">
            A second paragraph shows the spacing between paragraphs. Press Esc, click the backdrop or use the close button to dismiss it.
          </p>
        </div>
      </Modal>
    </div>
  );
}
