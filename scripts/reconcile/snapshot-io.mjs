// Reads a snapshot folder (scripts/webflow-snapshot.mjs output) for the reconcile tools.
import fs from "node:fs";
import path from "node:path";

export const DEFAULT_DATA = new URL("../../docs/webflow/snapshot/data/", import.meta.url).pathname;

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const readJsonl = (p) =>
  fs
    .readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

/** Turns the flat element list into a tree: each node gets `kids` (ordered) and keeps its own fields. */
export function buildTree(elements) {
  const byId = new Map();
  for (const e of elements) byId.set(e.id, { ...e, kids: [] });
  let root = null;
  for (const e of elements) {
    const n = byId.get(e.id);
    if (e.p === null || e.p === undefined) root = n;
    else byId.get(e.p)?.kids.push(n);
  }
  return { root, byId };
}

export function loadSnapshot(dir = DEFAULT_DATA) {
  const snap = { dir, pages: {}, components: {}, interactions: {} };
  const must = (f) => {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) throw new Error(`Snapshot file missing: ${p}`);
    return p;
  };
  snap.manifest = readJson(must("manifest.json"));
  snap.site = readJson(must("site.json"));
  snap.variables = readJson(must("variables.json"));
  snap.styles = readJsonl(must("styles.jsonl"));
  snap.assets = readJson(must("assets.json"));
  snap.cms = readJson(must("cms.json"));
  for (const f of fs.readdirSync(path.join(dir, "pages")).sort()) {
    if (!f.endsWith(".json")) continue;
    const j = readJson(path.join(dir, "pages", f));
    snap.pages[f.slice(0, -5)] = { ...j, ...buildTree(j.elements) };
  }
  for (const f of fs.readdirSync(path.join(dir, "components")).sort()) {
    if (!f.endsWith(".json")) continue;
    const j = readJson(path.join(dir, "components", f));
    snap.components[f.slice(0, -5)] = { ...j, ...buildTree(j.elements) };
  }
  const ixDir = path.join(dir, "interactions");
  if (fs.existsSync(ixDir)) for (const f of fs.readdirSync(ixDir).sort()) if (f.endsWith(".json")) snap.interactions[f.slice(0, -5)] = readJson(path.join(ixDir, f));
  return snap;
}
