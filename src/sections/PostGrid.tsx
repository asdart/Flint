import PostCard from "../components/ui/PostCard";
import { latestPosts } from "../content";

type PostGridProps = {
  title: string;
  body: string;
};

/**
 * Section / Post Grid. The two nested divs mirror Webflow's Collection List Wrapper and
 * Collection List (Posts, sorted by Published on ↓, limit 3); each role="listitem" is a Collection Item.
 */
export default function PostGrid({ title, body }: PostGridProps) {
  const posts = latestPosts(3);

  return (
    <section className="fk-section">
      <div className="fk-panel is-brand-light is-compact">
        <div className="fk-post-grid">
          <div className="fk-post-grid-header" data-ix="reveal">
            <h2 className="fk-heading-lg">{title}</h2>
            <p className="fk-text-md is-subtle">{body}</p>
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
    </section>
  );
}
