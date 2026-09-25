import authors from "./authors.json";
import categories from "./categories.json";
import posts from "./posts.json";

export type Author = (typeof authors)[number];
export type Category = (typeof categories)[number];
export type Post = (typeof posts)[number];
export type PostWithAuthor = Post & { authorItem: Author };

function findAuthor(slug: string): Author {
  const author = authors.find((item) => item.slug === slug);
  if (!author) throw new Error(`Unknown author "${slug}" in src/content/posts.json`);
  return author;
}

/** Mirrors a Webflow Collection List on Posts, sorted by "Published on" descending. */
export function latestPosts(limit: number): PostWithAuthor[] {
  return [...posts]
    .sort((a, b) => b["publish-date"].localeCompare(a["publish-date"]))
    .slice(0, limit)
    .map((post) => ({ ...post, authorItem: findAuthor(post.author) }));
}

export { authors, categories, posts };
