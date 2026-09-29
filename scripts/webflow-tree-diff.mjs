#!/usr/bin/env node
// Compares Webflow element trees with the repo's rendered markup: tags, classes (utilities
// included), data-*/aria-* attributes, image alt, text, order, and where a UI / Button instance sits.
// Usage: node scripts/webflow-tree-diff.mjs <webflow dump> <markup.json> <jobs.json>
//  - webflow dump: the saved result file of a data_element_tool call whose actions were
//    get_all_elements (page tree, then one per section component with scope_component_id), or any
//    JSON array of { text: "<json of one action result>" }.
//  - markup.json: output of `node scripts/webflow-markup.mjs src/sections/X.tsx …`.
//  - jobs.json: [{ "name": "Hero", "file": "src/sections/Hero.tsx", "source": "action:1" }, …] where
//    source is "action:<n>" (the n-th action's whole tree, for a component) or "main:<n>" (the n-th
//    child of the page's <main>, for page-level markup). Exit code 1 when anything differs.
import fs from "node:fs";
const [, , wfFile, mkFile, jobsFile] = process.argv;
if (!jobsFile) {
  console.error("Usage: node scripts/webflow-tree-diff.mjs <webflow dump> <markup.json> <jobs.json>");
  process.exit(2);
}
const VOID = new Set(["img", "hr", "br", "input"]);
function parseHtml(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { stack.at(-1).children.push(decode(m[5])); continue; }
    const [, close, tag, attrStr, selfc] = m;
    if (close) { stack.pop(); continue; }
    const attrs = {};
    for (const a of attrStr.matchAll(/\s+([^\s=>\/]+)(?:="([^"]*)")?/g)) attrs[a[1]] = decode(a[2] ?? "");
    const el = { tag, attrs, children: [] };
    stack.at(-1).children.push(el);
    if (!VOID.has(tag) && !selfc) stack.push(el);
  }
  return root.children;
}
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&ldquo;/g,"“").replace(/&rdquo;/g,"”");
// normalise repo element
function normRepo(n) {
  if (typeof n === "string") return { text: n.replace(/\s+/g, " ") };
  const cls = (n.attrs.class || "").split(/\s+/).filter(Boolean);
  const attrs = {};
  for (const [k, v] of Object.entries(n.attrs)) if (/^(data-|aria-)/.test(k)) attrs[k] = v;
  if (n.tag === "a" && cls.includes("fk-button")) return { instance: "Button", label: n.children.map(c=>c.children?.[0]).join(""), href: n.attrs.href, cls };
  // A Testimonial Card is a component instance in Webflow: compare its props (image alt = Name, Quote, Role), not its inner markup.
  if (n.tag === "article" && cls.includes("fk-testimonial-card")) {
    const find = (m, f) => { if (typeof m === "string") return; if (f(m)) return m; for (const c of m.children) { const r = find(c, f); if (r) return r; } };
    const text = (m) => (typeof m === "string" ? m : m.children.map(text).join(""));
    const ps = []; (function walk(m) { if (typeof m === "string") return; if (m.tag === "p") ps.push(text(m)); m.children.forEach(walk); })(n);
    const quote = decode(text(find(n, (m) => m.tag === "span" && m.attrs.class === undefined && true) || ""));
    return { instance: "Testimonial Card", props: { Name: ps[0], Role: ps[1], Quote: quote, alt: find(n, (m) => m.tag === "img" && (m.attrs.class || "").includes("fk-testimonial-card-image")).attrs.alt } };
  }
  const kids = n.children.map(normRepo);
  return { tag: n.tag, cls, attrs, alt: n.tag === "img" ? n.attrs.alt : undefined, kids };
}
// normalise webflow element
const TYPE_TAG = { "": "br", Section: "section", Paragraph: "p", Span: "span", Image: "img", List: "ul", ListItem: "li" };
function normWf(e, instances) {
  if (e.type === "String") return { text: e.textContent.replace(/\s+/g, " ") };
  if (e.type === "ComponentInstance") return { instance: e.instanceDetails.name, wfId: e.id.element, props: Object.fromEntries((e.instanceDetails.props || []).map((p) => [p.name, p.value])) };
  const tag = e.settings?.tag || TYPE_TAG[e.type] || e.type;
  const attrs = {};
  for (const [k, v] of Object.entries(e.attributes || {})) if (/^(data-|aria-)/.test(k)) attrs[k] = v;
  return { tag, cls: e.styleNames || [], attrs, alt: e.type === "Image" ? (e.settings?.altText ?? "(none)") : undefined, id: e.id.element, kids: (e.children || []).map((c) => normWf(c, instances)) };
}
function mergeText(kids) { // merge adjacent text, drop empty
  const out = [];
  for (const k of kids) { if (k.text !== undefined) { if (out.at(-1)?.text !== undefined) out.at(-1).text += k.text; else out.push({ ...k }); } else out.push(k); }
  return out.filter((k) => k.text === undefined || k.text.trim() !== "");
}
let diffs = 0, nodes = 0, boundText = 0;
function cmp(r, w, path) {
  nodes++;
  if (r.text !== undefined || w.text !== undefined) {
    if ((r.text ?? "").trim() !== (w.text ?? "").trim()) { diffs++; console.log(`TEXT ${path}: repo=${JSON.stringify(r.text)} wf=${JSON.stringify(w.text)}`); }
    return;
  }
  if (r.instance || w.instance) {
    if (r.instance !== w.instance) { diffs++; console.log(`INSTANCE ${path}: repo=${r.instance ?? r.tag} wf=${w.instance ?? w.tag}`); return; }
    const bound = (v) => v && typeof v === "object" && v.sourceType;
    if (r.instance === "Button") { // props bound to a host component's props are checked on the host's instance
      const l = w.props.Label, k = w.props.Link;
      if (!bound(l) && r.label !== l) { diffs++; console.log(`PROP ${path}: Label repo=${JSON.stringify(r.label)} wf=${JSON.stringify(l)}`); }
      if (!bound(k) && r.href !== k?.to) { diffs++; console.log(`PROP ${path}: Link repo=${JSON.stringify(r.href)} wf=${JSON.stringify(k?.to)}`); }
    }
    if (r.instance === "Testimonial Card") for (const [name, v] of Object.entries(r.props)) {
      if (name === "alt") continue;
      if (v !== w.props[name]) { diffs++; console.log(`PROP ${path}: ${name} repo=${JSON.stringify(v)} wf=${JSON.stringify(w.props[name])}`); }
    }
    return;
  }
  if (r.tag !== w.tag) { diffs++; console.log(`TAG ${path}: repo=${r.tag} wf=${w.tag}`); }
  if (r.cls.join(" ") !== w.cls.join(" ")) { diffs++; console.log(`CLASS ${path}: repo=${r.cls.join(" ")} wf=${w.cls.join(" ")}`); }
  const ra = JSON.stringify(Object.entries(r.attrs).sort()), wa = JSON.stringify(Object.entries(w.attrs).sort());
  if (ra !== wa) { diffs++; console.log(`ATTR ${path}: repo=${ra} wf=${wa}`); }
  if (r.tag === "img") { const wAlt = w.alt === "(none)" || w.alt === "inherit" ? "" : w.alt; if ((r.alt ?? "") !== wAlt) { diffs++; console.log(`ALT ${path}: repo=${JSON.stringify(r.alt)} wf=${JSON.stringify(w.alt)}`); } }
  const rk = mergeText(r.kids), wk = mergeText(w.kids);
  // A text element bound to a component prop shows no children in the Webflow tree: its value is the prop default, set from the repo string
  if (wk.length === 0 && rk.length === 1 && rk[0].text !== undefined && ["h1","h2","h3","p","blockquote","span"].includes(r.tag)) { boundText++; return; }
  if (rk.length !== wk.length) { diffs++; console.log(`CHILDREN ${path}: repo=${rk.length} wf=${wk.length}`); }
  for (let i = 0; i < Math.min(rk.length, wk.length); i++) cmp(rk[i], wk[i], `${path}>${rk[i].tag || rk[i].instance || "#"}[${i}]`);
}
const wf = JSON.parse(fs.readFileSync(wfFile, "utf8")).map((x) => JSON.parse(x.text));
const mk = JSON.parse(fs.readFileSync(mkFile));
const jobs = JSON.parse(fs.readFileSync(jobsFile));
const rep = (f) => normRepo(parseHtml(mk[f])[0]);
const page = wf[0].result[0].data;
const main = (function find(e) { if (e.settings?.tag === "main") return e; for (const c of e.children || []) { const r = find(c); if (r) return r; } })(page);
for (const { name, file, source } of jobs) {
  const [kind, n] = source.split(":");
  const tree = kind === "action" ? wf[+n].result[0].data : main.children[+n];
  const before = diffs; nodes = 0;
  cmp(rep(file), normWf(tree), name);
  console.log(`${name}: ${nodes} nodes compared, ${diffs - before} differences${boundText ? `, ${boundText} bound text element(s) skipped` : ""}`); boundText = 0;
}
process.exitCode = diffs ? 1 : 0;
