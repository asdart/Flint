import { useSearchParams } from "react-router-dom";
import chevronLeft from "../assets/icons/chevron-left.svg";
import chevronRight from "../assets/icons/chevron-right.svg";
import Dropdown from "../components/ui/Dropdown";
import PostCard from "../components/ui/PostCard";
import { categories, categoryBySlug, postPage } from "../content";
import EmptyState from "../components/ui/EmptyState";
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
              <div className="fk-flex fk-flex-col fk-gap-8">
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
                  current ? (
                    <EmptyState
                      title="No articles in this category yet"
                      body="We haven't published a guide under this topic yet. See everything else we've written."
                      button={{ label: "All articles", link: "/blog" }}
                    />
                  ) : (
                    <EmptyState
                      title="No articles yet"
                      body="Our first guides on green card sponsorship, licensing and relocation are coming soon."
                      button={{ label: "Subscribe", link: "#newsletter" }}
                    />
                  )
                ) : null}
                {/* Webflow's native Pagination (the wrapper sits inside the Collection List Wrapper): Previous and
                    Next links only where a page exists, plus the native page count. The numbered links between the
                    arrows are added by the registered script x-blog-pagination (preview: src/ix/blogPagination.ts);
                    a one-page list renders the wrapper empty and x-blog-pagination hides it. Native links reload
                    the page, so these are plain anchors. */}
                <div role="navigation" aria-label="Pagination" className="w-pagination-wrapper fk-pagination">
                  {totalPages > 1 && page > 1 ? (
                    <a href={`?page=${page - 1}`} aria-label="Previous Page" className="w-pagination-previous fk-pagination-arrow">
                      <img className="w-pagination-previous-icon fk-icon is-sm" src={chevronLeft} alt="" width={16} height={16} />
                      <div className="fk-sr-only w-inline-block">Previous</div>
                    </a>
                  ) : null}
                  {totalPages > 1 && page < totalPages ? (
                    <a href={`?page=${page + 1}`} aria-label="Next Page" className="w-pagination-next fk-pagination-arrow">
                      <div className="fk-sr-only w-inline-block">Next</div>
                      <img className="w-pagination-next-icon fk-icon is-sm" src={chevronRight} alt="" width={16} height={16} />
                    </a>
                  ) : null}
                  {totalPages > 1 ? (
                    <div className="w-page-count fk-sr-only">
                      {page} / {totalPages}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
