#!/usr/bin/env node
// Compares two Webflow snapshots (webflow-snapshot.mjs output) by identity: element ids in page and
// component trees, style selectors, variable ids, interaction names, asset ids, plus settings, custom
// code, schema, CMS schema and signals. Offline. Prints a summary; --json writes the change list.
// Usage: node scripts/webflow-tree-diff-ids.mjs <base dir> <new dir> [--json <file>] [--quiet]
//   Exit code 1 when anything differs. The change list is the input of reconcile stage 2 (report);
//   accepted.json is NOT applied here (it is about repo vs Webflow, not base vs new).
// Output: { schema, base: {dump, repoCommit}, new: {…}, counts: {area: n}, changes: [ { area, where, id, field, base, new, … } ] }
import fs from "node:fs";
import { diffDirs } from "./reconcile/diff.mjs";

const args = process.argv.slice(2);
const dirs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--json");
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
if (dirs.length !== 2) {
  console.error("Usage: node scripts/webflow-tree-diff-ids.mjs <base dir> <new dir> [--json <file>] [--quiet]");
  process.exit(2);
}
const { base, new: nw, changes } = diffDirs(dirs[0], dirs[1]);
const counts = {};
for (const c of changes) counts[c.area] = (counts[c.area] ?? 0) + 1;
const result = {
  schema: 1,
  base: { dump: base.manifest.dump, repoCommit: base.manifest.repoCommit, takenAt: base.manifest.takenAt },
  new: { dump: nw.manifest.dump, repoCommit: nw.manifest.repoCommit, takenAt: nw.manifest.takenAt },
  counts,
  changes,
};
if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify(result, null, 1)}\n`);
if (!args.includes("--quiet")) {
  console.log(`${changes.length} change(s) between ${result.base.dump} and ${result.new.dump}: ${JSON.stringify(counts)}`);
  const short = (v) => {
    const s = JSON.stringify(v);
    return s && s.length > 90 ? `${s.slice(0, 90)}…` : s;
  };
  for (const c of changes) console.log(`${c.area.padEnd(11)} ${String(c.where).padEnd(26)} ${String(c.id ?? "").slice(0, 36).padEnd(36)} ${c.field}${c.bp ? ` [${c.bp}/${c.pseudo}]` : ""}: ${short(c.base)} -> ${short(c.new)}`);
}
process.exitCode = changes.length ? 1 : 0;
