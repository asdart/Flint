type PageHeroProps = {
  title: string;
  body: string;
};

/**
 * Page Hero. A component (D-17): the generic simple page header, used by Privacy Policy and Terms of
 * Service. A centered brand-light panel with the page's one `h1` and one line of body text (the legal
 * pages pass "Effective date: …"; a date is never a heading). Props: Title, Body. Same panel and blur
 * reveal as Article Hero.
 */
export default function PageHero({ title, body }: PageHeroProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel is-blog-hero fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-4" data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h1 className="fk-heading-lg fk-text-center">{title}</h1>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-sm fk-color-brand">{body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
