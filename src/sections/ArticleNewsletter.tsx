import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

/**
 * Newsletter band of the post page. PAGE-LEVEL MARKUP, not a component (D-17, D-27): used once, on the
 * Posts template, so it is written straight into the page in Webflow (Designer, 2026-09-30) and is
 * not a `Section / Newsletter` instance. It replaced the Stacked variant of `Section / Newsletter`,
 * whose variant overrides lost to the `is-snug` combo. Same Form Block, `UI / Input Field` (Action)
 * and Submit `UI / Button` as the component; the panel is the article-width `fk-panel is-article`
 * (720px, centered, `space-7` top and bottom) and the section adds 80px below it before Related Posts.
 * Texts are static in the page (no props). Where submissions go: roadmap P-05.
 */
export default function ArticleNewsletter() {
  return (
    <section className="fk-section is-padded-bottom-lg">
      <div className="fk-panel is-article fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-4">
            <p className="fk-text-md fk-text-center-mobile">
              Subscribe to our newsletter for blog updates and original content
            </p>
            <div className="fk-newsletter-form w-form">
              <form name="wf-form-Newsletter" data-name="Newsletter" method="get" aria-label="Newsletter">
                <InputField variant="action" label="Email address" name="Email" type="email" placeholder="Email address" required>
                  <Button submit label="Subscribe" className="fk-w-full-mobile" />
                </InputField>
              </form>
              <div className="fk-newsletter-message w-form-done" role="status">
                <div>Thanks for subscribing. You’re on the list.</div>
              </div>
              <div className="fk-newsletter-message is-error w-form-fail" role="alert">
                <div>Something went wrong while submitting the form. Please try again.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
