import { FAQS, faqSchema } from "../content/faqs";
import { cx } from "../lib/cx";

type FaqProps = {
  title?: string;
  body?: string;
  /** Index of the item that starts open (the Figma design shows the first one open). */
  open?: number;
};

/** Section / FAQ. Page-level markup (D-17: only Candidates has an FAQ so far), not a component. Motion
 * is `ix-faq-toggle`: a click on a question toggles `is-faq-open` on the parts of its item (no parent
 * state reaches a child). The preview also renders the page's `FAQPage` JSON-LD from the same
 * questions; on Webflow it is the page's JSON-LD setting (`seo.md` S-08). */
export default function Faq({
  title = "Frequently asked questions",
  body = "Get answers to common questions about our Green Card pathway, candidate vetting, and healthcare placement process.",
  open = 0,
}: FaqProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-subtle">{body}</p>
              </div>
            </div>

            <div className="fk-faq-list fk-flex fk-flex-col fk-gap-4 fk-mx-auto" data-ix="reveal-stagger">
              {FAQS.map((faq, index) => {
                const isOpen = index === open;
                const state = isOpen && "is-faq-open";
                return (
                  <article className="fk-faq-item fk-bg-white fk-rounded-xl" data-ix-item key={faq.question}>
                    <h3 className="fk-text-md">
                      <button
                        className="fk-faq-question"
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index + 1}`}
                      >
                        <span className={cx("fk-faq-question-text", state)}>{faq.question}</span>
                        <span className={cx("fk-faq-icon", state)}>
                          <img className={cx("fk-faq-icon-plus", state)} src="/assets/plus.svg" alt="" width={14} height={14} />
                          <img className={cx("fk-faq-icon-minus", state)} src="/assets/minus.svg" alt="" width={14} height={14} />
                        </span>
                      </button>
                    </h3>
                    <div className={cx("fk-faq-answer", state)} id={`faq-answer-${index + 1}`}>
                      <div className="fk-faq-answer-content">
                        <p className="fk-text-md fk-color-ink fk-pt-4">{faq.answer}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }} />
    </section>
  );
}
