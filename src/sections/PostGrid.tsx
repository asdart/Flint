import Button from "../components/ui/Button";
import PostCard from "../components/ui/PostCard";
import { latestPosts } from "../content";
import { cx } from "../lib/cx";

type PostGridProps = {
  title: string;
  body: string;
  /** Home centers the header. */
  variant?: "default" | "home";
  /** Shows the Secondary button under the header when set. */
  buttonLabel?: string;
  buttonLink?: string;
};

/**
 * Section / Post Grid. The two nested divs mirror Webflow's Collection List Wrapper and
 * Collection List (Posts, sorted by Published on ↓, limit 3); each role="listitem" is a Collection Item.
 */
export default function PostGrid({ title, body, variant = "default", buttonLabel, buttonLink }: PostGridProps) {
  const posts = latestPosts(3);

  return (
    <section className="fk-section">
      <div className="fk-panel is-brand-light is-compact">
        <div className="fk-post-grid">
          <div className={cx("fk-post-grid-header", variant === "home" && "is-center")} data-ix="blur-reveal">
            <div className="fk-blur-reveal">
              <h2 className="fk-heading-lg">{title}</h2>
            </div>
            <div className="fk-blur-reveal is-delay-1">
              <p className="fk-text-md is-subtle">{body}</p>
            </div>
            {buttonLabel ? (
              <div className="fk-blur-reveal is-delay-2">
                <div className="fk-post-grid-action">
                  <Button label={buttonLabel} link={buttonLink} variant="secondary" />
                </div>
              </div>
            ) : null}
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
