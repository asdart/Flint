import NewsletterForm from "../components/ui/NewsletterForm";

/**
 * Newsletter band of the post page. PAGE-LEVEL MARKUP, not a component (D-17, D-27): used once, on the
 * Posts template, so it is written straight into the page in Webflow (Designer, 2026-09-30) and is
 * not a `Section / Newsletter` instance. It replaced the Stacked variant of `Section / Newsletter`,
 * whose variant overrides lost to the `is-snug` combo. One `UI / Newsletter Form` instance (default props, since 2026-10-11),
 * the same as `Section / Newsletter`'s; the panel is the article-width `fk-panel is-article`
 * (720px, centered, `space-7` top and bottom) and the section adds 80px below it before Related Posts.
 * The title is static in the page. Where submissions go: roadmap P-05.
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
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
