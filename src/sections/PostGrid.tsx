import Button from "../components/ui/Button";
import PostCard from "../components/ui/PostCard";
import { latestPosts } from "../content";

/**
 * Section / Post Grid. The two nested divs mirror Webflow's Collection List Wrapper and
 * Collection List (Posts, sorted by Published on ↓, limit 3); each role="listitem" is a Collection Item.
 */
export default function PostGrid() {
  const posts = latestPosts(3);
  const title = "The Flint blog";
  const body = "Immigration, licensing, and hiring tips for healthcare workers seeking Visa sponsorship.";

  return (
    <section className="fk-section">
      <div className="fk-panel is-brand-light">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-lg">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-md is-subtle">{body}</p>
              </div>
                <div className="fk-blur-reveal is-delay-2">
                  <Button label="See all posts" link="/blog" variant="secondary" />
                </div>
            </div>
            <div>
              <div className="fk-grid is-3" role="list">
                {posts.map((post) => (
                  <div key={post.slug} role="listitem">
                    <PostCard post={post} />
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
