import type { PostWithRefs } from "../content";
import { postBody } from "../content/bodies";

type ArticleBodyProps = {
  post: PostWithRefs;
};

/**
 * Article Body. Page markup on the Posts template (D-17). Three grid columns at desktop: the
 * table of contents (`aside`, hidden ≤991), the 720px content column and an empty balancing
 * column. `fk-article-toc-list` is empty in the markup: the x-article-toc exception fills it
 * with `fk-article-toc-link` anchors built from the body's H2s. The quick answer is conditional
 * visibility on the "Quick Answer" field. `fk-article-body` is the Rich Text element bound to
 * "Body"; its inner elements are Designer nested styles (D-20, article-body.css).
 */
export default function ArticleBody({ post }: ArticleBodyProps) {
  const quickAnswer = post["quick-answer"];

  return (
    <section className="fk-section">
      <div className="fk-article">
        <aside className="fk-article-toc">
          <p className="fk-article-toc-label">On this page</p>
          <nav aria-label="On this page">
            <div className="fk-article-toc-list" />
          </nav>
        </aside>
        <div className="fk-article-content">
          {quickAnswer ? (
            <div className="fk-article-quick-answer">
              <p className="fk-article-quick-answer-label">Quick Answer</p>
              <p className="fk-text-md fk-color-subtle">{quickAnswer}</p>
            </div>
          ) : null}
          <div className="fk-article-body w-richtext" dangerouslySetInnerHTML={{ __html: postBody(post.slug) }} />
        </div>
      </div>
    </section>
  );
}
