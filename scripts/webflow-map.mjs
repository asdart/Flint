#!/usr/bin/env node
// Builds the element-id map of the snapshot: for every Webflow element id of every page and component,
// where it lives in the repo (file, line, order path, text, occurrence). Run it ONCE per sync, on a repo
// that equals Webflow (right after a sync / baseline); it aligns the repo's traced render with the
// snapshot trees by order, tag, classes and text. Offline: no Webflow MCP call. See
// docs/webflow/snapshot/README.md → map/.
// Usage: node scripts/webflow-map.mjs [--data <snapshot dir>] [--out <dir>] [--page <slug>] [--quiet]
//   Default data dir: docs/webflow/snapshot/data. Writes <data>/map/pages/<slug>.json and
//   <data>/map/components/<slug>.json (or under --out), prints coverage per page and component.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Mapper, assignPaths } from "./reconcile/mapper.mjs";
import { normName } from "./reconcile/align.mjs";
import { startRenderer } from "./reconcile/repo-render.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { DEFAULT_DATA, loadSnapshot } from "./reconcile/snapshot-io.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dataDir = path.resolve(opt("--data") ?? DEFAULT_DATA);
const outDir = path.resolve(opt("--out") ?? path.join(dataDir, "map"));
const onlyPage = opt("--page");
const quiet = args.includes("--quiet");

// Webflow page slug (snapshot file name) -> the repo page, the route it renders at.
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/posts.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, "src/content/categories.json"), "utf8"));
const PAGES = {
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

const git = (...a) => {
  try {
    return execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

const snap = loadSnapshot(dataDir);
const names = new Set(Object.values(snap.components).map((c) => normName(c.name)));
const renderer = await startRenderer();

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

function writeMap(file, header, entries) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = Object.entries(entries).map(([id, e]) => `${JSON.stringify(id)}:${JSON.stringify(e)}`);
  const head = Object.entries(header).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)},`);
  fs.writeFileSync(file, `{\n${head.join("\n")}\n"elements":{\n${lines.join(",\n")}\n}\n}\n`);
}

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

const trees = {};
const reports = [];
try {
  for (const [slug, [file, url, pattern]] of Object.entries(PAGES)) {
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
    reports.push(rep);
    writeMap(path.join(outDir, "pages", `${slug}.json`), { ...header("page", slug, rep), source: file, route: url }, m.map);
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
      reports.push(rep);
      writeMap(path.join(outDir, "components", `${slug}.json`), { ...header("component", slug, rep), source: null }, {});
      continue;
    }
    const rep = report(`component ${slug}`, comp.root, best.m, { source: best.from ? `${best.from.file}:${best.from.line}` : null });
    reports.push(rep);
    writeMap(path.join(outDir, "components", `${slug}.json`), { ...header("component", slug, rep), source: rep.source }, best.m.map);
  }
} finally {
  await renderer.close();
}

if (!quiet) {
  console.log(`Map written to ${path.relative(ROOT, outDir) || outDir} (snapshot dump ${snap.manifest.dump}, repo ${repoHead.slice(0, 7)}${srcDirty ? ", src dirty" : ""})`);
  let tot = 0;
  let map = 0;
  for (const r of reports) {
    tot += r.total;
    map += r.mapped;
    const pct = r.total ? ((100 * r.mapped) / r.total).toFixed(1) : "-";
    console.log(`${r.label.padEnd(30)} ${String(r.mapped).padStart(5)} / ${String(r.total).padEnd(5)} ${pct.padStart(6)}%`);
  }
  console.log(`${"TOTAL".padEnd(30)} ${String(map).padStart(5)} / ${String(tot).padEnd(5)} ${((100 * map) / tot).toFixed(1).padStart(6)}%`);
}
