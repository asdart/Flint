#!/usr/bin/env node
// Builds the element-id map of the snapshot: for every Webflow element id of every page and component,
// where it lives in the repo (file, line, order path, text, occurrence). Run it ONCE per sync, on a repo
// that equals Webflow (right after a sync / baseline); it aligns the repo's traced render with the
// snapshot trees by order, tag, classes and text. Offline: no Webflow MCP call. See
// docs/webflow/snapshot/README.md → map/.
// Usage: node scripts/webflow-map.mjs [--data <snapshot dir>] [--out <dir>] [--page <slug>] [--quiet]
//   Default data dir: docs/webflow/snapshot/data. Writes <data>/map/pages/<slug>.json and
//   <data>/map/components/<slug>.json (or under --out), prints coverage per page and component.
import path from "node:path";
import { buildMaps, writeMap } from "./reconcile/build-map.mjs";
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

const snap = loadSnapshot(dataDir);
const renderer = await startRenderer();
let result;
try {
  result = await buildMaps(snap, renderer, { onlyPage });
} finally {
  await renderer.close();
}
for (const kind of ["pages", "components"]) for (const [slug, { header, elements }] of Object.entries(result[kind])) writeMap(path.join(outDir, kind, `${slug}.json`), header, elements);
const { reports, repoHead, srcDirty } = result;

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
