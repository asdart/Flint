// Static-markup parser for the reconcile tools. Same approach as scripts/webflow-tree-diff.mjs
// (kept separate on purpose: that file is a script with top-level side effects), plus numeric
// entities, and it understands the data-src / x-comp markers of scripts/reconcile/jsx-trace.
const VOID = new Set(["img", "hr", "br", "input", "source", "meta", "link", "col"]);

export const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&amp;/g, "&");

/** Parses markup to { tag, attrs, children } nodes; text children are strings. */
export function parseHtml(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z0-9-]+)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) {
      stack.at(-1).children.push(decode(m[5]));
      continue;
    }
    const [, close, tag, attrStr, selfc] = m;
    if (close) {
      stack.pop();
      continue;
    }
    const attrs = {};
    for (const a of attrStr.matchAll(/\s+([^\s=>/]+)(?:="([^"]*)")?/g)) attrs[a[1]] = decode(a[2] ?? "");
    const el = { tag, attrs, children: [] };
    stack.at(-1).children.push(el);
    if (!VOID.has(tag) && !selfc) stack.push(el);
  }
  return root.children;
}

export const norm = (s) => s.replace(/\s+/g, " ").trim();

/**
 * Repo tree from traced markup. Nodes:
 *  { k: "el", tag, cls, attrs, src, chain, kids }  host element
 *  { k: "text", text, src, chain }                 merged text run (src = the parent element's)
 *  { k: "comp", name, src, props, kids }           a function component (x-comp wrapper)
 * `src` is { file, line, col }; `chain` lists the enclosing components, innermost first.
 */
export function repoTree(html) {
  const parseSrc = (s) => {
    if (!s) return null;
    const m = /^(.*):(\d+):(\d+)$/.exec(s);
    return m ? { file: m[1], line: +m[2], col: +m[3] } : null;
  };
  function convert(nodes, chain, parentSrc) {
    const out = [];
    for (const n of nodes) {
      if (typeof n === "string") {
        const last = out.at(-1);
        if (last && last.k === "text") last.raw += n;
        else out.push({ k: "text", raw: n, src: parentSrc, chain });
        continue;
      }
      if (n.tag === "x-comp") {
        const c = { name: n.attrs["data-comp"], src: parseSrc(n.attrs["data-src"]), props: JSON.parse(n.attrs["data-props"] || "{}") };
        out.push({ k: "comp", ...c, chain, kids: convert(n.children, [c, ...chain], parentSrc) });
        continue;
      }
      const src = parseSrc(n.attrs["data-src"]);
      const attrs = {};
      for (const [key, v] of Object.entries(n.attrs)) if (key !== "data-src" && key !== "class") attrs[key] = v;
      out.push({ k: "el", tag: n.tag, cls: (n.attrs.class || "").split(/\s+/).filter(Boolean), attrs, src, chain, kids: convert(n.children, chain, src) });
    }
    // Adjacent text runs are one run; whitespace-only runs are not nodes.
    return out
      .map((n) => (n.k === "text" ? { k: "text", text: norm(n.raw), src: n.src, chain: n.chain } : n))
      .filter((n) => n.k !== "text" || n.text);
  }
  return convert(parseHtml(html), [], null);
}
