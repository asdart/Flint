// Builds the element-id map of a snapshot against the repo (shared by scripts/webflow-map.mjs, which
// writes it to disk, and scripts/webflow-reconcile.mjs, which builds it in memory for the working tree).
// See docs/webflow/snapshot/README.md → map/.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Mapper, assignPaths } from "./mapper.mjs";
import { normName } from "./align.mjs";
import { ROOT } from "./paths.mjs";

export function repoPages() {
  const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/posts.json"), "utf8"));
  const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/categories.json"), "utf8"));
  // Webflow page slug (snapshot file name) -> [the repo page, the route it renders at, the route pattern].
  return {
    home: ["src/pages/HomePage.tsx", "/", "/"],
    candidates: ["src/pages/CandidatesPage.tsx", "/candidates", "/candidates"],
    "facility-partners": ["src/pages/FacilityPartnersPage.tsx", "/facility-partners", "/facility-partners"],
    about: ["src/pages/AboutPage.tsx", "/about", "/about"],
    blog: ["src/pages/BlogPage.tsx", "/blog", "/blog"],
    "privacy-policy": ["src/pages/PrivacyPolicyPage.tsx", "/privacy-policy", "/privacy-policy"],
    "terms-of-service": ["src/pages/TermsOfServicePage.tsx", "/terms-of-service", "/terms-of-service"],
    "thank-you": ["src/pages/ThankYouPage.tsx", "/thank-you", "/thank-you"],
    "style-guide": ["src/pages/StyleGuidePage.tsx", "/style-guide", "/style-guide"],
    404: ["src/pages/NotFoundPage.tsx", "/nope", "*"],
    "template-posts": ["src/pages/BlogPostPage.tsx", `/blog/${posts.find((p) => !p.isDraft).slug}`, "/blog/:slug"],
    "template-categories": ["src/pages/BlogPage.tsx", `/categories/${categories[0].slug}`, "/categories/:slug"],
  };
}

const git = (...a) => {
  try {
    return execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

// Counts of the Webflow elements of a tree, minus whitespace-only strings (not real content).
function allNodes(root) {
  const out = [];
  (function walk(n) {
    out.push(n);
    n.kids.forEach(walk);
  })(root);
  return out.filter((n) => !(n.t === "String" && !n.x.trim()));
}

function report(label, root, mapper, extra = {}) {
  const nodes = allNodes(root);
  const by = {};
  const unmapped = [];
  for (const n of nodes) {
    const t = n.t || "(br)";
    by[t] ??= [0, 0];
    by[t][1]++;
    if (mapper.map[n.id]) by[t][0]++;
    else unmapped.push(n);
  }
  // Group unmapped nodes under their topmost unmapped ancestor.
  const unSet = new Set(unmapped.map((n) => n.id));
  const parentOf = new Map();
  for (const n of nodes) for (const k of n.kids) parentOf.set(k.id, n);
  const tops = unmapped.filter((n) => !unSet.has(parentOf.get(n.id)?.id));
  const sizeOf = (n) => allNodes(n).length;
  const groups = tops.map((n) => ({
    id: n.id,
    type: n.t || "(br)",
    tag: n.s?.tag,
    classes: n.c?.join(" ") || undefined,
    text: n.t === "String" ? n.x.slice(0, 60) : undefined,
    parent: parentOf.get(n.id)?.id ?? null,
    nodes: sizeOf(n),
    reason: n.t === "ComponentInstance" ? "instance without a repo component" : /^(Dynamo|Form|Pagination|Dropdown)/.test(n.t) ? "webflow-only wrapper" : "no repo counterpart",
  }));
  return {
    label,
    total: nodes.length,
    mapped: nodes.length - unmapped.length,
    byType: Object.fromEntries(Object.entries(by).sort(([a], [b]) => (a < b ? -1 : 1))),
    unmapped: groups,
    repoOnly: mapper.repoOnly.slice(0, 40),
    ...extra,
  };
}

/**
 * Aligns every repo page and component render with the snapshot trees.
 * @returns {{ reports: object[], pages: Record<string,{header:object,elements:object}>, components: Record<string,{header:object,elements:object}> }}
 */
export async function buildMaps(snap, renderer, { onlyPage = null } = {}) {
  const names = new Set(Object.values(snap.components).map((c) => normName(c.name)));
  const repoHead = git("rev-parse", "HEAD");
  const srcDirty = git("status", "--porcelain", "src").length > 0;
  const header = (kind, name, rep) => ({
    schema: 1,
    kind,
    name,
    snapshotDump: snap.manifest.dump,
    snapshotRepoCommit: snap.manifest.repoCommit,
    repoHead,
    srcDirty,
    total: rep.total,
    mapped: rep.mapped,
    byType: rep.byType,
    unmapped: rep.unmapped,
    repoOnly: rep.repoOnly,
  });
  const out = { reports: [], pages: {}, components: {}, repoHead, srcDirty };
  const trees = {};
  for (const [slug, [file, url, pattern]] of Object.entries(repoPages())) {
    if (onlyPage && slug !== onlyPage) continue;
    const page = snap.pages[slug];
    if (!page) {
      console.error(`skip ${slug}: not in the snapshot`);
      continue;
    }
    trees[slug] = assignPaths(await renderer.renderPage(file, { url, pattern }));
    const m = new Mapper(names);
    m.run(page.root, trees[slug], { body: true });
    const rep = report(`page ${slug}`, page.root, m, { source: file });
    out.reports.push(rep);
    out.pages[slug] = { header: { ...header("page", slug, rep), source: file, route: url }, elements: m.map };
  }

  // Components: align the definition with the best repo render of that component.
  const comps = [];
  (function collect(nodes) {
    for (const n of nodes) {
      if (n.k === "comp") comps.push(n);
      if (n.kids) collect(n.kids);
    }
  })(Object.values(trees).flat());
  for (const [slug, comp] of Object.entries(snap.components)) {
    if (onlyPage) continue;
    const wanted = normName(comp.name);
    const seen = new Set();
    const cands = comps.filter((c) => {
      if (normName(c.name) !== wanted) return false;
      const key = JSON.stringify([c.props, c.src?.file]);
      return !seen.has(key) && seen.add(key);
    });
    let best = null;
    for (const c of cands.slice(0, 25)) {
      const m = new Mapper(names);
      m.run(comp.root, c.kids, { body: false });
      const score = Object.keys(m.map).length * 1000 + m.exact;
      if (!best || score > best.score) best = { score, m, from: c.src };
    }
    if (!best) {
      const m = new Mapper(names);
      const rep = report(`component ${slug}`, comp.root, m, { source: null, note: "no repo render found" });
      out.reports.push(rep);
      out.components[slug] = { header: { ...header("component", slug, rep), source: null }, elements: {} };
      continue;
    }
    const rep = report(`component ${slug}`, comp.root, best.m, { source: best.from ? `${best.from.file}:${best.from.line}` : null });
    out.reports.push(rep);
    out.components[slug] = { header: { ...header("component", slug, rep), source: rep.source }, elements: best.m.map };
  }
  return out;
}

export function writeMap(file, header, entries) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = Object.entries(entries).map(([id, e]) => `${JSON.stringify(id)}:${JSON.stringify(e)}`);
  const head = Object.entries(header).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)},`);
  fs.writeFileSync(file, `{\n${head.join("\n")}\n"elements":{\n${lines.join(",\n")}\n}\n}\n`);
}

/** Loads a map folder (map/pages/*.json, map/components/*.json) into the shape buildMaps returns. */
export function loadMaps(dir) {
  const out = { pages: {}, components: {} };
  for (const kind of ["pages", "components"]) {
    const d = path.join(dir, kind);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).sort()) {
      if (!f.endsWith(".json")) continue;
      const j = JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
      const { elements, ...header } = j;
      out[kind][f.slice(0, -5)] = { header, elements };
    }
  }
  return out;
}
