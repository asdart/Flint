import Button from "../components/ui/Button";
import PostCard from "../components/ui/PostCard";
import { latestPosts } from "../content";
import EmptyState from "../components/ui/EmptyState";

/**
 * Section / Post Grid. The two nested divs mirror Webflow's Collection List Wrapper and
 * Collection List (Posts, sorted by Published on ↓, limit 3); each role="listitem" is a Collection Item. An empty list shows
 * the Empty State (P-20, D-32), the list's `w-dyn-empty` sibling.
 */
export default function PostGrid() {
  const posts = latestPosts(3);
  const title = "The Flint blog";
  const body = "Immigration, licensing, and hiring tips for healthcare workers seeking Visa sponsorship.";

  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-lg">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-md fk-color-subtle">{body}</p>
              </div>
                <div className="fk-blur-reveal is-delay-2">
                  <Button label="See all posts" link="/blog" variant="secondary" />
                </div>
            </div>
            <div>
              {posts.length > 0 ? (
                <div className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4" role="list">
                  {posts.map((post) => (
                    <div key={post.slug} role="listitem">
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              ) : null}
              {posts.length === 0 ? (
                <EmptyState
                  title="New guides are on the way"
                  body="Check back soon for immigration, licensing and hiring tips for healthcare workers."
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
