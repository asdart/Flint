import { featuredPost, formatPostDate } from "../../content";
import SmartLink from "../../lib/SmartLink";

/**
 * Global / Featured post. Built by the user in the Designer (2026-09-30), mirrored here 1:1: a Collection
 * List of Posts (Featured on, limit 1) inside a component, which only the Designer could build. No props.
 * The wrapper, list and `role="listitem"` divs mirror Webflow's Collection List Wrapper, Collection List
 * and Collection Item; its empty state is an empty container (P-20, D-32): with no featured post the slot collapses. The post's title is an `h2`
 * (the page's `h1` belongs to the hero above it). Used by Blog Hero, on /blog and the category template.
 */
export default function FeaturedPost() {
  const post = featuredPost();

  return (
    <div>
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
                alt=""
                width={711}
                height={432}
                fetchPriority="high"
              />
              <div className="fk-featured-post-scrim" aria-hidden />
            </div>
          </SmartLink>
          </div>
        ) : null}
      </div>
      {post ? null : (
        <div className="w-dyn-empty">
          <div />
        </div>
      )}
    </div>
  );
}
