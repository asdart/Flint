import { formatPostDate, type PostWithRefs } from "../content";
import SmartLink from "../lib/SmartLink";

type ArticleHeroProps = {
  post: PostWithRefs;
};

/**
 * Article Hero. Page markup on the Posts template (D-17): used on one page, and every value is
 * bound to the current Post (or its referenced Author and Category). The author role and the
 * phone-only date line are conditional visibility in Webflow: the role renders only when the
 * Author has one. The page's one `h1` is the post title, and the image keeps its natural ratio
 * (D-21, hidden on phone as in the phone frame).
 */
export default function ArticleHero({ post }: ArticleHeroProps) {
  const { authorItem, categoryItem } = post;
  const date = formatPostDate(post["publish-date"]);
  const readTime = `${post["read-time"]} min read`;

  return (
    <section className="fk-section">
      <div className="fk-panel is-blog-hero fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-12 fk-gap-10-phone" data-ix="blur-reveal-hero">
            <div className="fk-flex fk-flex-col fk-gap-8 fk-w-full fk-max-w-content">
              <div className="fk-blur-reveal fk-flex fk-flex-col fk-items-center fk-gap-6">
                <nav className="fk-breadcrumb" aria-label="Breadcrumb">
                  <SmartLink href="/blog" className="fk-breadcrumb-link">
                    Blog
                  </SmartLink>
                  <span className="fk-breadcrumb-separator" aria-hidden>
                    /
                  </span>
                  <SmartLink href={`/categories/${categoryItem.slug}`} className="fk-breadcrumb-link">
                    {categoryItem.name}
                  </SmartLink>
                </nav>
                <div className="fk-flex fk-flex-col fk-items-center fk-gap-4">
                  <p className="fk-text-sm fk-color-brand fk-hidden-phone">
                    <time dateTime={post["publish-date"]}>{date}</time> · {readTime}
                  </p>
                  <h1 className="fk-heading-lg fk-text-center">{post.name}</h1>
                </div>
              </div>
              <div className="fk-blur-reveal is-delay-1 fk-flex fk-flex-col fk-items-center fk-gap-3">
                <img
                  className="fk-avatar is-lg"
                  src={authorItem.avatar.url}
                  alt={authorItem.name}
                  width={44}
                  height={44}
                />
                <div className="fk-flex fk-flex-col fk-items-center fk-gap-0-5">
                  <p className="fk-article-author-name">{authorItem.name}</p>
                  {authorItem.role ? (
                    <p className="fk-text-sm fk-color-subtle fk-hidden-phone">{authorItem.role}</p>
                  ) : null}
                  <p className="fk-text-sm fk-color-subtle fk-hidden fk-block-phone">
                    <time dateTime={post["publish-date"]}>{date}</time> · {readTime}
                  </p>
                </div>
              </div>
            </div>
            <img
              className="fk-article-image fk-blur-reveal is-delay-2 fk-hidden-phone"
              src={post["main-image"].url}
              alt={post["main-image"].alt}
              width={552}
              height={260}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
