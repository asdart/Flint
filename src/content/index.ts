import authors from "./authors.json";
import categories from "./categories.json";
import posts from "./posts.json";

// Post bodies live in post-bodies.json (slug → rich text HTML) so the cards don't bundle them.
// Read them through postBody() in ./bodies.ts, only where a body is rendered.

export type Author = (typeof authors)[number];
export type Category = (typeof categories)[number];
export type Post = (typeof posts)[number];
export type PostWithAuthor = Post & { authorItem: Author };
export type PostWithRefs = PostWithAuthor & { categoryItem: Category };

function findAuthor(slug: string): Author {
  const author = authors.find((item) => item.slug === slug);
  if (!author) throw new Error(`Unknown author "${slug}" in src/content/posts.json`);
  return author;
}

function findCategory(slug: string): Category {
  const category = categories.find((item) => item.slug === slug);
  if (!category) throw new Error(`Unknown category "${slug}" in src/content/posts.json`);
  return category;
}

function withRefs(post: Post): PostWithRefs {
  return { ...post, authorItem: findAuthor(post.author), categoryItem: findCategory(post.category) };
}

/** Mirrors a Webflow Collection List on Posts, sorted by "Publish date" descending. Drafts are
 *  never listed on the live site, so they're skipped here too. */
export function latestPosts(limit: number): PostWithAuthor[] {
  return posts
    .filter((post) => !post.isDraft)
    .sort((a, b) => b["publish-date"].localeCompare(a["publish-date"]))
    .slice(0, limit)
    .map((post) => ({ ...post, authorItem: findAuthor(post.author) }));
}

export { authors, categories, posts };

export const POSTS_PER_PAGE = 6;

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((item) => item.slug === slug);
}

/** The blog hero's Collection List: Posts filtered to Featured, limit 1. */
export function featuredPost(): PostWithRefs | undefined {
  const post = posts.find((item) => item.featured && !item.isDraft);
  return post ? withRefs(post) : undefined;
}

/** The feed's Collection List: Posts (optionally of one category), Publish date descending, 6 per
 *  page. Webflow's native pagination is `?<id>_page=n`; the preview uses `?page=n`. */
export function postPage(categorySlug: string | undefined, page: number) {
  const listed = posts
    .filter((post) => !post.isDraft && (!categorySlug || post.category === categorySlug))
    .sort((a, b) => b["publish-date"].localeCompare(a["publish-date"]));
  const totalPages = Math.max(1, Math.ceil(listed.length / POSTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * POSTS_PER_PAGE;
  return { posts: listed.slice(start, start + POSTS_PER_PAGE).map(withRefs), page: current, totalPages };
}

/** The Posts CMS template page's current item, resolved by slug. Drafts have no live page, so
 *  they resolve to undefined like an unpublished item would. */
export function postBySlug(slug: string): PostWithRefs | undefined {
  const post = posts.find((item) => item.slug === slug && !item.isDraft);
  return post ? withRefs(post) : undefined;
}

/** The post page's related-posts Collection List: Posts of the same Category, current post
 *  excluded, Publish date descending, limit 3. Empty when the category has no other posts; the
 *  post page then hides the section (roadmap D-02, D-20). */
export function relatedPosts(post: Post, limit = 3): PostWithAuthor[] {
  return posts
    .filter((item) => !item.isDraft && item.category === post.category && item.slug !== post.slug)
    .sort((a, b) => b["publish-date"].localeCompare(a["publish-date"]))
    .slice(0, limit)
    .map((item) => ({ ...item, authorItem: findAuthor(item.author) }));
}

/** "July 17, 2026", the format Webflow's date binding uses on the cards and hero. */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
