/*
 * Preview of exception x-article-toc (docs/webflow/interactions.md). The shipped script is
 * docs/webflow/custom-code/post-template-footer.html: keep both in sync.
 * Builds the table of contents from `.fk-article-body h2` and highlights the current section.
 */

type Cleanup = () => void;

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

export function articleToc(): Cleanup {
  const body = document.querySelector<HTMLElement>(".fk-article-body");
  const toc = document.querySelector<HTMLElement>(".fk-article-toc");
  const list = toc?.querySelector<HTMLElement>(".fk-article-toc-list");
  if (!body || !toc || !list) return () => {};

  const headings = Array.from(body.querySelectorAll<HTMLElement>("h2"));
  if (!headings.length) {
    toc.style.display = "none";
    return () => {
      toc.style.display = "";
    };
  }

  const addedIds: HTMLElement[] = [];
  const links = headings.map((heading) => {
    if (!heading.id) {
      const base = slugify(heading.textContent ?? "");
      let id = base;
      let n = 1;
      while (document.getElementById(id)) id = `${base}-${++n}`;
      heading.id = id;
      addedIds.push(heading);
    }
    const link = document.createElement("a");
    link.className = "fk-article-toc-link";
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    list.appendChild(link);
    return link;
  });

  let current = -1;
  const setActive = (index: number) => {
    if (index === current) return;
    links.forEach((link, i) => {
      link.classList.toggle("is-toc-active", i === index);
      if (i === index) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    current = index;

    // Scroll the aside only, never the page.
    const linkRect = links[index].getBoundingClientRect();
    const tocRect = toc.getBoundingClientRect();
    if (linkRect.top < tocRect.top) toc.scrollTop -= tocRect.top - linkRect.top;
    else if (linkRect.bottom > tocRect.bottom) toc.scrollTop += linkRect.bottom - tocRect.bottom;
  };

  // The last heading above 30% of the viewport is current; the first one until then.
  const spy = () => {
    const line = window.innerHeight * 0.3;
    let index = 0;
    headings.forEach((heading, i) => {
      if (heading.getBoundingClientRect().top <= line) index = i;
    });
    setActive(index);
  };

  const observer = new IntersectionObserver(spy, { rootMargin: "0px 0px -70% 0px" });
  headings.forEach((heading) => observer.observe(heading));
  spy();

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest("a");
    const index = link ? links.indexOf(link) : -1;
    if (index < 0) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    headings[index].scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
    history.replaceState(null, "", links[index].hash);
  };
  list.addEventListener("click", onClick);

  return () => {
    observer.disconnect();
    list.removeEventListener("click", onClick);
    links.forEach((link) => link.remove());
    addedIds.forEach((heading) => heading.removeAttribute("id"));
  };
}
