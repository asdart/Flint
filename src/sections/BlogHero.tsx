import FeaturedPost from "../components/global/FeaturedPost";

/**
 * Section / Blog Hero. Page markup (used by the blog pages only, D-17): the `h1` header and the
 * `Global / Featured post` component, which holds the featured Collection List (D-28). The page's
 * one `h1` is the title; the post's title is an `h2`.
 */
export default function BlogHero() {
  const title = "The Flint blog";
  const body = "Immigration, licensing, and hiring tips for healthcare workers seeking Visa sponsorship.";

  return (
    <section className="fk-section">
      <div className="fk-panel is-blog-hero fk-bg-tertiary">
        <img className="fk-blog-hero-art" src="/assets/blog/hero-art.webp" alt="" width={1459} height={800} />
        <div className="fk-container fk-relative">
          <div className="fk-flex fk-flex-col fk-gap-12 fk-gap-6-mobile">
            <div className="fk-section-header is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h1 className="fk-heading-lg">{title}</h1>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-subtle">{body}</p>
              </div>
            </div>
            <FeaturedPost />
          </div>
        </div>
      </div>
    </section>
  );
}
