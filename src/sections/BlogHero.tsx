import { featuredPost, formatPostDate } from "../content";
import SmartLink from "../lib/SmartLink";

/**
 * Section / Blog Hero. Page markup, not a component with props: the featured post is a Collection
 * List (Posts, filtered to Featured, limit 1), and a component can't hold a bound list. The
 * list and `role="listitem"` divs mirror Webflow's Collection List and Collection Item. The
 * page's one `h1` is the title; the post's title is an `h2`.
 */
export default function BlogHero() {
  const post = featuredPost();
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
            <div role="list">
              {post ? (
                <div role="listitem">
                  <SmartLink href={`/blog/${post.slug}`} className="fk-featured-post" data-ix="reveal">
                    <div className="fk-featured-post-body">
                      <div className="fk-featured-post-meta">
                        <time className="fk-featured-post-meta-text" dateTime={post["publish-date"]}>
                          {formatPostDate(post["publish-date"])}
                        </time>
                        <span className="fk-featured-post-meta-text" aria-hidden>
                          ·
                        </span>
                        <span className="fk-featured-post-meta-text">{post.categoryItem.name}</span>
                      </div>
                      <h2 className="fk-featured-post-title">{post.name}</h2>
                      <p className="fk-featured-post-excerpt fk-hidden-mobile">{post.excerpt}</p>
                      <div className="fk-featured-post-author">
                        <img
                          className="fk-avatar"
                          src={post.authorItem.avatar.url}
                          alt={post.authorItem.avatar.alt}
                          width={24}
                          height={24}
                        />
                        <span className="fk-featured-post-author-text">{post.authorItem["short-name"]}</span>
                        <span className="fk-featured-post-author-text" aria-hidden>
                          ·
                        </span>
                        <span className="fk-featured-post-author-text">{post["read-time"]} min read</span>
                      </div>
                    </div>
                    <div className="fk-featured-post-media">
                      <img
                        className="fk-featured-post-image"
                        src={post["main-image"].url}
                        alt={post["main-image"].alt}
                        width={post["main-image"].width}
                        height={post["main-image"].height}
                        fetchPriority="high"
                      />
                      <div className="fk-featured-post-scrim" aria-hidden />
                    </div>
                  </SmartLink>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
