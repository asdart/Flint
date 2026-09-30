import { useSearchParams } from "react-router-dom";
import arrowLeft from "../assets/icons/arrow-left.svg";
import arrowRight from "../assets/icons/arrow-right.svg";
import Dropdown from "../components/ui/Dropdown";
import PostCard from "../components/ui/PostCard";
import { categories, categoryBySlug, postPage } from "../content";
import { cx } from "../lib/cx";
import SmartLink from "../lib/SmartLink";

type PostIndexProps = {
  /** Slug of the category template page this section is on. Omitted on /blog. */
  category?: string;
};

/**
 * Section / Post Index. Page markup: the feed is a Collection List (Posts, Publish date ↓, 6 per
 * page, filtered to the current category on a category template page) with native pagination, and
 * the category select is `UI / Dropdown` whose slot holds a Collection List of Categories (sorted by
 * name, current one excluded) plus, on a category page, a static "All categories" link (D-28), so
 * nothing here needs a script. The wrapper, list and `role="listitem"` divs mirror Webflow's
 * Collection List Wrapper, Collection List and Collection Item.
 */
export default function PostIndex({ category }: PostIndexProps) {
  const [params] = useSearchParams();
  const current = category ? categoryBySlug(category) : undefined;
  const { posts, page, totalPages } = postPage(category, Number(params.get("page")) || 1);
  // Collection List "Categories": sorted by name, the current category filtered out ("not current").
  const categoryOptions = [...categories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((item) => item.slug !== current?.slug);
  const basePath = current ? `/categories/${current.slug}` : "/blog";
  const pageHref = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);

  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light is-tight-bottom">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-flex fk-flex-col fk-gap-8">
              <div
                className="fk-flex fk-items-center fk-justify-between fk-gap-4 fk-flex-col-mobile fk-items-stretch-mobile"
                data-ix="blur-reveal"
              >
                <div className="fk-blur-reveal">
                  <h2 className="fk-heading-lg">All posts</h2>
                </div>
                <Dropdown label={current ? current.name : "All categories"} selected={Boolean(current)} menuLabel="Filter by category">
                  {current ? (
                    <SmartLink href="/blog" className="fk-dropdown-link">
                      All categories
                    </SmartLink>
                  ) : null}
                  <div>
                    <div role="list">
                      {categoryOptions.map((item) => (
                        <div key={item.slug} role="listitem">
                          <SmartLink href={`/categories/${item.slug}`} className="fk-dropdown-link">
                            {item.name}
                          </SmartLink>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dropdown>
              </div>
              <div>
                <div className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-4" role="list">
                  {posts.map((post) => (
                    <div key={post.slug} role="listitem">
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {totalPages > 1 ? (
              <nav className="fk-pagination" aria-label="Pagination">
                <SmartLink
                  href={pageHref(Math.max(1, page - 1))}
                  className={cx("fk-pagination-arrow", page === 1 && "is-disabled")}
                  aria-label="Previous page"
                  aria-disabled={page === 1 || undefined}
                >
                  <img className="fk-icon is-sm" src={arrowLeft} alt="" width={16} height={16} />
                </SmartLink>
                <div className="fk-pagination-pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((n) => (
                    <SmartLink
                      key={n}
                      href={pageHref(n)}
                      className={cx("fk-pagination-page", n === page && "w--current")}
                      aria-label={`Page ${n}`}
                      aria-current={n === page ? "page" : undefined}
                    >
                      {n}
                    </SmartLink>
                  ))}
                </div>
                <SmartLink
                  href={pageHref(Math.min(totalPages, page + 1))}
                  className={cx("fk-pagination-arrow", page === totalPages && "is-disabled")}
                  aria-label="Next page"
                  aria-disabled={page === totalPages || undefined}
                >
                  <img className="fk-icon is-sm" src={arrowRight} alt="" width={16} height={16} />
                </SmartLink>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
