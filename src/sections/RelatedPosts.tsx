import PostCard from "../components/ui/PostCard";
import { relatedPosts, type PostWithRefs } from "../content";

type RelatedPostsProps = {
  post: PostWithRefs;
};

/**
 * Related Posts. Page markup on the Posts template (D-17, D-20), not Post Grid: a Collection List
 * on Posts, same Category as the current post, current post excluded, Publish date ↓, limit 3.
 * The two nested divs mirror the Collection List Wrapper and Collection List, as in Post Grid.
 * With no other post in the category the whole section is hidden (Webflow: exception
 * x-related-empty on `[data-x-related]`).
 */
export default function RelatedPosts({ post }: RelatedPostsProps) {
  const posts = relatedPosts(post);
  if (posts.length === 0) return null;

  return (
    <section className="fk-section" data-x-related>
      <div className="fk-panel fk-bg-brand-light is-compact">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-gap-12">
            <div className="fk-flex fk-flex-col fk-gap-2" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-lg">Related Insights</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-md fk-color-subtle">
                  More guides on nursing careers, US immigration, and healthcare staffing.
                </p>
              </div>
            </div>
            <div>
              <div className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4" role="list">
                {posts.map((item) => (
                  <div key={item.slug} role="listitem">
                    <PostCard post={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
