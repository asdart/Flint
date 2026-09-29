import bodies from "./post-bodies.json";

// Post bodies (slug → rich text HTML). Only imported by the blog post page, which is lazy-loaded,
// so the ~470 KB JSON stays in that page's chunk and out of the cards' bundle.
const bodyBySlug: Record<string, string> = bodies;

export function postBody(slug: string): string {
  return bodyBySlug[slug] ?? "";
}
