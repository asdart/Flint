/*
 * Preview of exception x-blog-pagination (docs/webflow/interactions.md). The shipped script is
 * docs/webflow/custom-code/blog-pagination.html: keep both in sync.
 * Webflow's native pagination is Previous / Next links plus a page count ("2 / 5"). This reads the
 * query key from the native link's href (`?<id>_page=N` on Webflow, `?page=N` in the preview) and the
 * page numbers from the count, then inserts real numbered links between the arrows. With more than
 * seven pages it keeps the first, the last and the current page with its neighbours, and an
 * ellipsis for each gap. If anything is missing it does nothing: the arrows stay.
 */

type Cleanup = () => void;

export function blogPagination(): Cleanup {
  const wrapper = document.querySelector<HTMLElement>(".w-pagination-wrapper");
  const count = wrapper?.querySelector(".w-page-count");
  const arrow = wrapper?.querySelector(".w-pagination-next, .w-pagination-previous");
  const match = count?.textContent?.match(/(\d+)\s*\/\s*(\d+)/);
  const key = (arrow?.getAttribute("href") ?? "").match(/^\?([^=&]+_page|page)=/);
  if (!wrapper || !match || !key || Number(match[2]) < 2) return () => {};

  const current = Number(match[1]);
  const total = Number(match[2]);
  const next = wrapper.querySelector(".w-pagination-next");
  const pages = document.createElement("div");
  pages.className = "fk-pagination-pages";
  let gap = false;
  for (let i = 1; i <= total; i++) {
    if (total > 7 && i !== 1 && i !== total && Math.abs(i - current) > 1) {
      if (!gap) {
        gap = true;
        const dots = document.createElement("span");
        dots.className = "fk-pagination-gap";
        dots.setAttribute("aria-hidden", "true");
        dots.textContent = "…";
        pages.appendChild(dots);
      }
      continue;
    }
    gap = false;
    const link = document.createElement("a");
    link.href = `?${key[1]}=${i}`;
    link.className = `fk-pagination-page${i === current ? " w--current" : ""}`;
    link.textContent = String(i);
    link.setAttribute("aria-label", `Page ${i}`);
    if (i === current) link.setAttribute("aria-current", "page");
    pages.appendChild(link);
  }
  if (next) wrapper.insertBefore(pages, next);
  else wrapper.appendChild(pages);
  return () => pages.remove();
}
