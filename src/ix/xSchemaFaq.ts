/*
 * Exception x-schema-faq (docs/webflow/interactions.md, roadmap P-14 closed with option 3, D-62):
 * builds one FAQPage JSON-LD from the FAQ already visible in a blog post's rich text, so no CMS field
 * holds the schema. Plain DOM, no dependency; it is the single source of the shipped code:
 * `node scripts/build-x-schema-faq.mjs` minifies it into docs/webflow/custom-code/x-schema-faq.html.
 *
 * Editor rule (cms.md → Editing a post's FAQ): keep the FAQ as an H2 titled "Frequently Asked Questions"
 * (or "FAQ"), then one H3 per question, each followed by its answer (paragraphs, lists, H4s) up to the
 * next H3 or H2. The first H3 that does not end with "?" (a "Related Guides" list) closes the FAQ. Anything between the FAQ H2 and the first H3 (an intro) is ignored.
 * No FAQ H2, or no question with an answer: nothing is added.
 */

const ORIGIN = "https://withflint.com";
// visible text, whitespace-normalised; a <br> reads as a space (textContent would glue "approval.It")
const norm = (el: Element) => {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
};

export function xSchemaFaq(): void {
  const body = document.querySelector(".fk-article-body");
  const slug = location.pathname.replace(/\/+$/, "").split("/").pop();
  if (!body || !slug || document.getElementById("x-schema-faq")) return;
  const start = Array.from(body.children).find((el) => el.tagName === "H2" && /^(faqs?|frequently asked questions)\b/i.test(norm(el)));
  if (!start) return;

  const items: { "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } }[] = [];
  let name = "";
  let parts: string[] = [];
  const flush = () => {
    const text = parts.join(" ").trim();
    if (name && text) items.push({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } });
  };
  for (let el = start.nextElementSibling; el && el.tagName !== "H2"; el = el.nextElementSibling) {
    if (el.tagName === "H3") {
      flush();
      name = norm(el);
      parts = [];
      // a heading that isn't a question ("Related Guides") closes the FAQ
      if (!name.endsWith("?")) {
        name = "";
        break;
      }
    } else if (name) {
      // a list reads as its items joined by spaces (textContent of the list would run them together)
      parts.push(el.matches("ul,ol") ? Array.from(el.querySelectorAll("li"), norm).join(" ") : norm(el));
    }
  }
  flush();
  if (!items.length) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "x-schema-faq";
  script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "@id": `${ORIGIN}/blog/${slug}#faq`, mainEntity: items });
  document.head.appendChild(script);
}
