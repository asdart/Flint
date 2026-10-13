// Partial refresh of the base snapshot: after approved report rows were applied to the repo (by
// webflow-reconcile-apply.mjs or by the agent), the base items they stand for take Webflow's value, so a later
// reconcile reports them as in sync. Everything else in the base stays as it was.
// Spec: docs/webflow/snapshot/README.md ("Refreshing the base") and docs/webflow/plans/reconcile.md (phase 4).
//
// What validity means after a partial refresh: manifest.repoCommit does not move (the applied edits may be
// uncommitted, and the repo has other changes since that commit that must stay visible as "repo ahead"). The
// base-vs-repo value of every refreshed item is instead the value that was applied:
//   - styles and tokens: manifest.repoBase (css / tokens), laid over the repo-at-commit values by webflow-reconcile.mjs;
//   - element text, classes, props, attributes: the stored map/ entries are updated in place;
//   - everything else is compared against the new base, which now equals Webflow, so nothing is left to report.
// A full rebuild (webflow-snapshot.mjs <dump> --rebuild after the edits are committed) starts again with repoCommit = HEAD
// and no overlay.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recordApplied } from "./applied.mjs";
import { writeMap } from "./build-map.mjs";
import { diffSnapshots } from "./diff.mjs";
import { ROOT } from "./paths.mjs";
import { normalizeValue } from "./repo-state.mjs";
import { formatRows, loadReport, parseRows } from "./rowspec.mjs";
import { DEFAULT_DATA, loadSnapshot } from "./snapshot-io.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS = path.resolve(HERE, "..");
const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

// ---- canonical file formats (the ones webflow-snapshot.mjs writes) -------------------------------------------

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  return value;
};
const line = (value) => JSON.stringify(sortKeys(value));
const pretty = (value) => `${JSON.stringify(sortKeys(value), null, 2)}\n`;
const ELEMENT_ORDER = ["id", "p", "t", "c", "s", "a", "x", "i"];
const elementLine = (e) => JSON.stringify(Object.fromEntries(ELEMENT_ORDER.filter((k) => k in e).map((k) => [k, sortKeys(e[k])])));
const PAGE_ORDER = ["pageId", "file", "title", "slug", "publishedPath", "draft", "archived", "seo", "openGraph", "collectionId", "includeInSitemap", "jsonLd", "jsonLdRaw", "scripts", "head", "footer", "headUnreadable"];
const COMPONENT_ORDER = ["id", "name", "group", "description", "props", "variants", "variantStyles"];

function lineDoc(doc, order) {
  const keys = Object.keys(doc).filter((k) => k !== "elements");
  keys.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib);
  });
  const parts = keys.map((k) => `${JSON.stringify(k)}:${line(doc[k])}`);
  parts.push(`"elements":${doc.elements.length ? `[\n${doc.elements.map(elementLine).join(",\n")}\n]` : "[]"}`);
  return `{\n${parts.join(",\n")}\n}\n`;
}

// A file kind: how to read it into a value and how to write it back, byte for byte as the normaliser would.
const FORMATS = {
  page: { parse: (t) => JSON.parse(t), write: (v) => lineDoc(v, PAGE_ORDER) },
  component: { parse: (t) => JSON.parse(t), write: (v) => lineDoc(v, COMPONENT_ORDER) },
  styles: { parse: (t) => t.split("\n").filter(Boolean).map((l) => JSON.parse(l)), write: (v) => `${v.map(styleLine).join("\n")}\n` },
  variables: { parse: (t) => JSON.parse(t), write: (v) => `{\n${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${line(v[k])}`).join(",\n")}\n}\n` },
  assets: { parse: (t) => JSON.parse(t), write: (v) => `[\n${[...v].sort((a, b) => (a.id < b.id ? -1 : 1)).map(line).join(",\n")}\n]\n` },
  pretty: { parse: (t) => JSON.parse(t), write: pretty },
};
const styleLine = (s) => {
  const out = { sel: s.sel, type: s.type, base: sortKeys(s.base ?? {}) };
  if (s.bp && Object.keys(s.bp).length) out.bp = sortKeys(s.bp);
  return JSON.stringify(out);
};
const kindOf = (rel) => (rel.startsWith("pages/") ? "page" : rel.startsWith("components/") ? "component" : rel === "styles.jsonl" ? "styles" : rel === "variables.json" ? "variables" : rel === "assets.json" ? "assets" : "pretty");

/** The files of one snapshot folder, read lazily and written back through the canonical format. */
class Folder {
  constructor(dir) {
    this.dir = dir;
    this.cache = new Map();
    this.removed = new Set();
  }

  has(rel) {
    return !this.removed.has(rel) && (this.cache.has(rel) || fs.existsSync(path.join(this.dir, rel)));
  }

  get(rel) {
    if (this.removed.has(rel)) return undefined;
    if (!this.cache.has(rel)) {
      const abs = path.join(this.dir, rel);
      if (!fs.existsSync(abs)) return undefined;
      const text = fs.readFileSync(abs, "utf8");
      const fmt = FORMATS[kindOf(rel)];
      const value = fmt.parse(text);
      // The write path must reproduce the file exactly, or a refresh would rewrite more than it should.
      if (fmt.write(clone(value)) !== text) throw new Error(`${rel} is not in the canonical snapshot format; rebuild the base (webflow-snapshot.mjs --rebuild)`);
      this.cache.set(rel, { value, text, touched: false });
    }
    return this.cache.get(rel).value;
  }

  set(rel, value) {
    const e = this.cache.get(rel);
    if (e) {
      e.value = value;
      e.touched = true;
    } else this.cache.set(rel, { value, text: null, touched: true });
    this.removed.delete(rel);
  }

  remove(rel) {
    this.removed.add(rel);
    this.cache.delete(rel);
  }

  list(prefix) {
    const d = path.join(this.dir, prefix);
    const files = fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => `${prefix}/${f}`) : [];
    for (const rel of this.cache.keys()) if (rel.startsWith(`${prefix}/`) && !files.includes(rel)) files.push(rel);
    return files.filter((f) => !this.removed.has(f)).sort();
  }

  /** The file under `prefix/` whose header id (`idKey`) is `id`. */
  byId(prefix, idKey, id) {
    return this.list(prefix).find((rel) => this.get(rel)?.[idKey] === id) ?? null;
  }

  /** Writes what changed; returns { written: Map(rel -> content), removed: [rel] }. */
  save() {
    const written = new Map();
    for (const rel of this.removed) {
      fs.rmSync(path.join(this.dir, rel), { force: true });
    }
    for (const [rel, e] of this.cache) {
      if (!e.touched) continue;
      const content = FORMATS[kindOf(rel)].write(e.value);
      if (content === e.text) continue;
      fs.mkdirSync(path.dirname(path.join(this.dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(this.dir, rel), content);
      written.set(rel, content);
    }
    return { written, removed: [...this.removed] };
  }
}

// ---- keyed paths (site.json, cms.json, component headers) ----------------------------------------------------------

const KEYED = {
  site: { registeredScripts: (s) => s.id, fonts: (f) => f.fileName, variableCollections: (c) => c.id },
  cms: { collections: (c) => c.id, fields: (c) => c.id, "fields[].fields": (f) => f.id },
  component: { props: (p) => p.id, variants: (v) => v.id },
  page: {},
};

function parsePath(p) {
  const out = [];
  let cur = "";
  for (let i = 0; i < p.length; ) {
    const ch = p[i];
    if (ch === ".") {
      if (cur) out.push({ name: cur });
      cur = "";
      i++;
    } else if (ch === "[") {
      if (cur) out.push({ name: cur });
      cur = "";
      const j = p.indexOf("]", i);
      out.push({ key: p.slice(i + 1, j) });
      i = j + 1;
    } else {
      cur += ch;
      i++;
    }
  }
  if (cur) out.push({ name: cur });
  return out;
}

/** Makes `base` hold the value `nw` has at `pathStr` (set, insert, or delete); other paths are untouched. */
function copyPath(base, nw, pathStr, keyed) {
  const segs = parsePath(pathStr);
  let b = base;
  let n = nw;
  let prefix = "";
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const last = i === segs.length - 1;
    if (seg.name !== undefined) {
      const name = seg.name;
      if (last) {
        if (n?.[name] === undefined) delete b[name];
        else b[name] = clone(n[name]);
        return;
      }
      if (b[name] === undefined || b[name] === null) {
        if (n?.[name] === undefined) return;
        b[name] = segs[i + 1].key !== undefined ? [] : {};
      }
      b = b[name];
      n = n?.[name];
      prefix = prefix ? `${prefix}.${name}` : name;
    } else {
      const keyFn = keyed[prefix.replace(/\[[^\]]*\]/g, "[]")];
      if (!keyFn || !Array.isArray(b)) throw new Error(`no key function for ${pathStr} at ${prefix}`);
      const bi = b.findIndex((x) => String(keyFn(x)) === seg.key);
      const ni = Array.isArray(n) ? n.findIndex((x) => String(keyFn(x)) === seg.key) : -1;
      if (last || bi < 0) {
        if (ni < 0) {
          if (bi >= 0) b.splice(bi, 1);
        } else if (bi >= 0) b[bi] = clone(n[ni]);
        else b.splice(Math.min(ni, b.length), 0, clone(n[ni]));
        return;
      }
      b = b[bi];
      n = ni >= 0 ? n[ni] : undefined;
      prefix = `${prefix}[${seg.key}]`;
    }
  }
}

// ---- units: the diff changes that the approved rows stand for ---------------------------------------------------

const refKey = (c) => [c.area, c.where, c.id ?? "", c.field, c.bp ?? "", c.pseudo ?? ""].join("|");
const pageGroup = (c) => {
  const top = c.field.split(/[.[]/)[0];
  return ["seo", "openGraph"].includes(top) ? c.field : top;
};

/** The diff changes behind the rows (see the row `ref`; a restructure row stands for its members; page rows for their group). */
export function unitsOf(rows, changes) {
  const wanted = new Set();
  const pages = new Set();
  const interactions = new Set();
  const codes = [];
  for (const r of rows) {
    const ref = r.ref;
    if (r.sub === "restructure") for (const m of r.members ?? []) wanted.add(["element", r.where, m.id, m.change, "", ""].join("|"));
    if (!ref) continue;
    if (ref.area === "code") codes.push(ref);
    else if (ref.area === "page" && !["added", "removed", "file"].includes(ref.field)) pages.add(`${ref.where}|${pageGroup(ref)}`);
    else if (ref.area === "interaction") interactions.add(ref.where);
    else wanted.add(refKey(ref));
  }
  const units = [];
  const folded = new Set();
  for (const c of changes) {
    if (wanted.has(refKey(c))) units.push(c);
    else if (c.area === "interaction" && interactions.has(c.where)) units.push(c);
    else if (c.area === "page" && pages.has(`${c.where}|${pageGroup(c)}`)) units.push(c);
    else if (codes.some((k) => (k.where === c.where && c.area === "page" && c.field.split(/[.[]/)[0] === k.field) || (k.where === "site" && c.area === "site" && c.field.split(/[.[]/)[0] === k.field))) units.push(c);
  }
  // A link's resolved href is folded into the link row.
  for (const u of units) if (u.area === "element" && u.field === "settings.link") folded.add(`${u.where}|${u.id}`);
  for (const c of changes) if (c.area === "element" && c.field === "attr.href" && folded.has(`${c.where}|${c.id}`) && !units.includes(c)) units.push(c);
  return units;
}

// ---- applying the units to the base files ------------------------------------------------------------------------

const slugOf = (where) => where.slice(where.indexOf(":") + 1);

function placeAfterPrevious(els, newEls, id, element) {
  const idxNew = newEls.findIndex((e) => e.id === id);
  const at = els.findIndex((e) => e.id === id);
  if (at >= 0) els.splice(at, 1);
  for (let k = idxNew - 1; k >= 0; k--) {
    const bi = els.findIndex((e) => e.id === newEls[k].id);
    if (bi >= 0) {
      els.splice(bi + 1, 0, element);
      return;
    }
  }
  els.unshift(element);
}

function applyElementUnits({ where, units, baseF, newF, mapEdits }) {
  const kind = where.startsWith("page:") ? "page" : "component";
  const prefix = kind === "page" ? "pages" : "components";
  const slug = slugOf(where);
  const newRel = `${prefix}/${slug}.json`;
  const newDoc = newF.get(newRel);
  if (!newDoc) throw new Error(`the new snapshot has no ${newRel}`);
  const idKey = kind === "page" ? "pageId" : "id";
  const baseRel = baseF.byId(prefix, idKey, newDoc[idKey]);
  if (!baseRel) throw new Error(`the base has no ${kind} for ${where}`);
  const doc = baseF.get(baseRel);
  const els = doc.elements;
  const newEls = newDoc.elements;
  const byBase = new Map(els.map((e) => [e.id, e]));
  const byNew = new Map(newEls.map((e) => [e.id, e]));
  const idOf = (u) => u.id;

  const topsAdded = new Set(units.filter((u) => u.field === "added").map(idOf));
  const topsRemoved = new Set(units.filter((u) => u.field === "removed").map(idOf));
  const addedAll = new Set();
  for (const e of newEls) if (!byBase.has(e.id) && (topsAdded.has(e.id) || addedAll.has(e.p))) addedAll.add(e.id);
  const removedAll = new Set();
  for (const e of els) if (!byNew.has(e.id) && (topsRemoved.has(e.id) || removedAll.has(e.p))) removedAll.add(e.id);
  const moved = new Set(units.filter((u) => u.field === "moved").map(idOf));
  // A move that only follows an add (into a new wrapper) or a remove (out of a deleted one) belongs to it.
  for (const e of newEls) {
    const b = byBase.get(e.id);
    if (b && b.p !== e.p && (addedAll.has(e.p) || removedAll.has(b.p))) moved.add(e.id);
  }

  // 1. replaced text runs (Webflow re-created the run under the same parent)
  const replaced = new Map();
  for (const u of units) if (u.field === "text" && u.idChanged) replaced.set(u.id, u.newId);
  // 2. field changes
  for (const u of units) {
    if (["added", "removed", "moved"].includes(u.field) || replaced.has(u.id)) continue;
    const b = byBase.get(u.id);
    const n = byNew.get(u.id);
    if (!b || !n) continue;
    const f = u.field;
    if (f === "text") b.x = n.x;
    else if (f === "type") b.t = n.t;
    else if (f === "classes") {
      if (n.c?.length) b.c = clone(n.c);
      else delete b.c;
    } else if (f.startsWith("settings.") || f.startsWith("attr.")) {
      const box = f.startsWith("settings.") ? "s" : "a";
      const key = f.slice(f.indexOf(".") + 1);
      if (n[box]?.[key] === undefined) {
        if (b[box]) delete b[box][key];
        if (b[box] && !Object.keys(b[box]).length) delete b[box];
      } else (b[box] ??= {})[key] = clone(n[box][key]);
    } else if (f.startsWith("prop.")) {
      const key = f.slice(5);
      if (!b.i) b.i = clone(n.i);
      else if (n.i?.props?.[key] === undefined) {
        delete b.i.props?.[key];
        if (b.i.props && !Object.keys(b.i.props).length) delete b.i.props;
      } else (b.i.props ??= {})[key] = clone(n.i.props[key]);
    } else if (f === "component") {
      b.i = { ...(b.i ?? {}), comp: n.i?.comp, name: n.i?.name };
    } else if (f === "slots") {
      if (n.i?.slots) (b.i ??= {}).slots = clone(n.i.slots);
      else if (b.i) delete b.i.slots;
    }
  }
  // 3. removed elements
  doc.elements = els.filter((e) => !removedAll.has(e.id) && !replaced.has(e.id));
  for (const [oldId, newId] of replaced) {
    const old = byBase.get(oldId);
    const fresh = clone(byNew.get(newId));
    const idx = els.indexOf(old);
    const before = els.slice(0, idx).reverse().find((e) => doc.elements.includes(e));
    doc.elements.splice(before ? doc.elements.indexOf(before) + 1 : 0, 0, fresh);
  }
  // 4. added and moved elements, in the new document order
  for (const e of newEls) {
    if (addedAll.has(e.id)) placeAfterPrevious(doc.elements, newEls, e.id, clone(e));
    else if (moved.has(e.id)) {
      const cur = doc.elements.find((x) => x.id === e.id);
      if (!cur) continue;
      cur.p = e.p;
      placeAfterPrevious(doc.elements, newEls, e.id, cur);
    }
  }
  baseF.set(baseRel, doc);

  // The stored map follows: text, classes, props and attributes of the refreshed elements now equal Webflow.
  const mapRel = `map/${prefix}/${slug}.json`;
  for (const u of units) {
    if (["added", "moved"].includes(u.field)) continue;
    mapEdits.push({ rel: mapRel, unit: u, newEl: byNew.get(replaced.get(u.id) ?? u.id) });
  }
  for (const id of removedAll) mapEdits.push({ rel: mapRel, unit: { field: "removed", id } });
}

function applyStyleUnits({ units, baseF, newF, repoBase }) {
  const base = baseF.get("styles.jsonl");
  const nw = newF.get("styles.jsonl");
  const byBase = new Map(base.map((s) => [s.sel, s]));
  const byNew = new Map(nw.map((s) => [s.sel, s]));
  const get = (s, bp, pseudo, prop) => (bp === "main" ? s?.base?.[pseudo]?.[prop] : s?.bp?.[bp]?.[pseudo]?.[prop]);
  const put = (s, bp, pseudo, prop, value) => {
    const box = bp === "main" ? (s.base ??= {}) : ((s.bp ??= {})[bp] ??= {});
    if (value === undefined) {
      delete box[pseudo]?.[prop];
      if (box[pseudo] && !Object.keys(box[pseudo]).length) delete box[pseudo];
      if (bp !== "main" && !Object.keys(box).length) delete s.bp[bp];
      if (s.bp && !Object.keys(s.bp).length) delete s.bp;
    } else (box[pseudo] ??= {})[prop] = value;
  };
  const overlay = (sel, bp, pseudo, prop, value) => {
    const v = value === undefined ? null : normalizeValue(value);
    for (const p of prop === "overflow" ? ["overflow-x", "overflow-y"] : [prop]) repoBase.css.push([sel, bp, pseudo, p, v]);
  };
  const eachProp = (s, fn) => {
    for (const [pseudo, props] of Object.entries(s?.base ?? {})) for (const [k, v] of Object.entries(props)) fn("main", pseudo, k, v);
    for (const [bp, ps] of Object.entries(s?.bp ?? {})) for (const [pseudo, props] of Object.entries(ps)) for (const [k, v] of Object.entries(props)) fn(bp, pseudo, k, v);
  };
  for (const u of units) {
    const sel = u.where;
    if (u.field === "added") {
      byBase.set(sel, clone(byNew.get(sel)));
      eachProp(byNew.get(sel), (bp, pseudo, k, v) => overlay(sel, bp, pseudo, k, v));
    } else if (u.field === "removed") {
      eachProp(byBase.get(sel), (bp, pseudo, k) => overlay(sel, bp, pseudo, k, undefined));
      byBase.delete(sel);
    } else if (u.field === "type") {
      if (byBase.has(sel)) byBase.get(sel).type = byNew.get(sel)?.type;
    } else {
      if (!byBase.has(sel)) byBase.set(sel, { sel, type: byNew.get(sel)?.type, base: {} });
      const v = get(byNew.get(sel), u.bp, u.pseudo, u.field);
      put(byBase.get(sel), u.bp, u.pseudo, u.field, clone(v));
      overlay(sel, u.bp, u.pseudo, u.field, v);
    }
  }
  const out = [...byBase.values()].filter((s) => Object.keys(s.base ?? {}).length || Object.keys(s.bp ?? {}).length);
  out.sort((a, b) => (a.sel < b.sel ? -1 : a.sel > b.sel ? 1 : 0));
  baseF.set("styles.jsonl", out);
}

const tokenName = (name) => name.replace(/\./g, "-");
const tokenValue = (v) => (v && typeof v === "object" && "value" in v ? `${v.value}${v.unit ?? ""}` : typeof v === "string" ? v : JSON.stringify(v));

function applyVariableUnits({ units, baseF, newF, repoBase }) {
  const base = baseF.get("variables.json");
  const nw = newF.get("variables.json");
  const nameById = (vars, id) => Object.keys(vars).find((k) => vars[k].id === id);
  for (const u of units) {
    const oldName = nameById(base, u.id);
    const newName = nameById(nw, u.id);
    if (u.field === "added") {
      base[newName] = clone(nw[newName]);
      repoBase.tokens[tokenName(newName)] = tokenValue(nw[newName].value);
    } else if (u.field === "removed") {
      delete base[oldName];
      repoBase.tokens[tokenName(oldName)] = null;
    } else if (u.field === "name") {
      const entry = base[oldName];
      delete base[oldName];
      base[newName] = entry;
      repoBase.tokens[tokenName(oldName)] = null;
      repoBase.tokens[tokenName(newName)] = tokenValue(entry.value);
    } else if (u.field === "type" || u.field === "value") {
      const entry = base[oldName] ?? base[newName];
      entry[u.field] = clone(nw[newName][u.field]);
      if (u.field === "value") repoBase.tokens[tokenName(newName)] = tokenValue(entry.value);
    }
  }
  baseF.set("variables.json", base);
}

function applyHeaderUnits({ kind, where, units, baseF, newF }) {
  const prefix = kind === "page" ? "pages" : "components";
  const idKey = kind === "page" ? "pageId" : "id";
  const slug = slugOf(where);
  const newRel = `${prefix}/${slug}.json`;
  const newDoc = newF.get(newRel);
  const first = units[0];
  if (first.field === "added") {
    baseF.set(newRel, clone(newDoc));
    return;
  }
  const baseRel = baseF.byId(prefix, idKey, first.id);
  if (!baseRel) throw new Error(`the base has no ${kind} for ${where}`);
  if (first.field === "removed") {
    baseF.remove(baseRel);
    return;
  }
  const doc = baseF.get(baseRel);
  for (const u of units) {
    if (u.field === "file") continue;
    copyPath(doc, newDoc, u.field, KEYED[kind]);
  }
  if (units.some((u) => u.field === "file" || (kind === "component" && u.field === "name")) && baseRel !== newRel) {
    baseF.remove(baseRel);
    baseF.set(newRel, doc);
  } else baseF.set(baseRel, doc);
}

function applySimpleUnits({ units, baseF, newF }) {
  for (const u of units) {
    if (u.area === "interaction") {
      const rel = `interactions/${u.where}.json`;
      if (u.field === "added") baseF.set(rel, clone(newF.get(rel)));
      else if (u.field === "removed") baseF.remove(rel);
      else {
        const doc = baseF.get(rel);
        const n = newF.get(rel);
        if (n[u.field] === undefined) delete doc[u.field];
        else doc[u.field] = clone(n[u.field]);
        baseF.set(rel, doc);
      }
    } else if (u.area === "asset") {
      const list = baseF.get("assets.json");
      const n = newF.get("assets.json").find((a) => a.id === u.id);
      const i = list.findIndex((a) => a.id === u.id);
      if (u.field === "added") list.push(clone(n));
      else if (u.field === "removed") list.splice(i, 1);
      else if (i >= 0) {
        if (n[u.field] === undefined) delete list[i][u.field];
        else list[i][u.field] = clone(n[u.field]);
      }
      baseF.set("assets.json", list);
    } else if (u.area === "site" || u.area === "cms") {
      const rel = `${u.area}.json`;
      const doc = baseF.get(rel);
      copyPath(doc, newF.get(rel), u.field, KEYED[u.area]);
      baseF.set(rel, doc);
    }
  }
}

// ---- map entries ------------------------------------------------------------------------------------------------------

function updateMaps(baseDir, mapEdits) {
  const byFile = new Map();
  for (const m of mapEdits) byFile.set(m.rel, [...(byFile.get(m.rel) ?? []), m]);
  const touched = [];
  for (const [rel, edits] of byFile) {
    const abs = path.join(baseDir, rel);
    if (!fs.existsSync(abs)) continue;
    const { elements, ...header } = JSON.parse(fs.readFileSync(abs, "utf8"));
    for (const { unit: u, newEl } of edits) {
      if (u.field === "removed") {
        delete elements[u.id];
        continue;
      }
      let e = elements[u.id];
      if (!e) continue;
      if (u.idChanged && u.newId) {
        delete elements[u.id];
        elements[u.newId] = e;
      }
      if (u.field === "text") {
        e.text = newEl?.x ?? e.text;
        delete e.repoText;
      } else if (u.field === "classes") delete e.rc;
      else if (/^(settings|attr)\./.test(u.field)) {
        if (e.ra) {
          delete e.ra[u.field];
          if (!Object.keys(e.ra).length) delete e.ra;
        }
      } else if (u.field.startsWith("prop.")) {
        const p = e.props?.[u.field.slice(5)];
        if (p) {
          if (newEl?.i?.props && u.field.slice(5) in newEl.i.props) p.value = newEl.i.props[u.field.slice(5)];
          delete p.repoValue;
        }
      }
    }
    writeMap(abs, header, elements);
    touched.push(rel);
  }
  return touched;
}

// ---- signals ----------------------------------------------------------------------------------------------------------

function syncSignals(manifest, newManifest, baseF, newF, baseDir, newDir) {
  const fileEqual = (rel) => {
    const a = path.join(baseDir, rel);
    const b = path.join(newDir, rel);
    return fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a, "utf8") === fs.readFileSync(b, "utf8");
  };
  const sig = manifest.signals;
  const nsig = newManifest.signals;
  for (const rel of baseF.list("pages")) {
    const id = JSON.parse(fs.readFileSync(path.join(baseDir, rel), "utf8")).pageId;
    if (!fileEqual(rel)) continue;
    if (nsig.pageLastUpdated?.[id] !== undefined) sig.pageLastUpdated[id] = nsig.pageLastUpdated[id];
    if (nsig.pageScriptsLastUpdated?.[id] !== undefined) (sig.pageScriptsLastUpdated ??= {})[id] = nsig.pageScriptsLastUpdated[id];
    else if (sig.pageScriptsLastUpdated) delete sig.pageScriptsLastUpdated[id];
  }
  for (const rel of baseF.list("interactions")) {
    if (!fileEqual(rel)) continue;
    const id = JSON.parse(fs.readFileSync(path.join(baseDir, rel), "utf8")).id;
    if (nsig.interactionVersion?.[id] !== undefined) sig.interactionVersion[id] = nsig.interactionVersion[id];
  }
  // Everything in the base equals the new snapshot: the base is the new dump now (the repo side is the overlay).
  const equalAll = Object.keys({ ...manifest.files, ...newManifest.files }).every((rel) => fileEqual(rel));
  if (equalAll) {
    for (const k of ["signals", "dump", "takenAt", "counts", "gaps", "rawDump", "files"]) manifest[k] = clone(newManifest[k]);
    return true;
  }
  return false;
}

// ---- the entry point ------------------------------------------------------------------------------------------------------

function resolveInput(input, report) {
  const cands = [];
  if (input) cands.push(path.resolve(input));
  const rec = report.meta?.new?.input;
  if (rec) cands.push(path.isAbsolute(rec) ? rec : path.join(ROOT, rec), path.isAbsolute(rec) ? rec : path.resolve(SCRIPTS, "..", rec));
  const dump = report.meta?.new?.dump;
  if (dump) cands.push(path.isAbsolute(dump) ? dump : path.join(ROOT, dump), path.isAbsolute(dump) ? dump : path.resolve(SCRIPTS, "..", dump));
  return cands.find((c) => fs.existsSync(c)) ?? null;
}

const runNode = (args, env = {}) => execFileSync("node", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env }, maxBuffer: 1 << 28 });

/**
 * Refreshes the base for `rowNums` of the report. Returns { refreshed, refused, remaining, files }.
 * Throws on a stale report or a base in a non-canonical format.
 */
export async function refreshBase({ reportFile, rows: spec, baseDir = DEFAULT_DATA, input = null, verify = true, force = false, log = console.log, at = new Date().toISOString() }) {
  const { file, report } = loadReport(reportFile);
  const base = path.resolve(baseDir);
  const manifestFile = path.join(base, "manifest.json");
  if (!fs.existsSync(manifestFile)) throw new Error(`no base snapshot at ${base}`);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  if (manifest.dump !== report.meta.base.dump || manifest.repoCommit !== report.meta.base.repoCommit) {
    throw new Error(`the report was made against the base ${report.meta.base.dump} at ${report.meta.base.repoCommit.slice(0, 7)}, but the base is ${manifest.dump} at ${String(manifest.repoCommit).slice(0, 7)}: it was rebuilt since, so the report is stale. Run the reconcile again.`);
  }
  const nums = parseRows(spec, report.rows);
  const chosen = report.rows.filter((r) => nums.includes(r.n));
  const skipped = chosen.filter((r) => r.direction === "REPO AHEAD").map((r) => r.n);
  let rows = chosen.filter((r) => r.direction !== "REPO AHEAD");
  if (!rows.length) return { refreshed: [], refused: [], skipped, remaining: null, files: [] };

  const newInput = resolveInput(input, report);
  if (!newInput) throw new Error(`cannot find the new dump (${report.meta.new.input ?? report.meta.new.dump}); pass it with --new`);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "flint-refresh-"));
  try {
    let newDir = newInput;
    if (!fs.existsSync(path.join(newDir, "manifest.json"))) {
      const snap = path.join(SCRIPTS, "webflow-snapshot.mjs");
      try {
        runNode([snap, newDir, "--check"]);
      } catch (e) {
        throw new Error(`the dump ${newDir} fails webflow-snapshot.mjs --check:\n${e.stdout ?? ""}${e.stderr ?? ""}`);
      }
      newDir = path.join(scratch, "new");
      runNode([snap, newInput, "--out", newDir, "--commit", manifest.repoCommit]);
    }
    const newManifest = JSON.parse(fs.readFileSync(path.join(newDir, "manifest.json"), "utf8"));
    if (newManifest.dump !== report.meta.new.dump) log(`warning: the new dump is ${newManifest.dump}, the report was made from ${report.meta.new.dump}`);

    // Verify: after the edits, a reconcile against the same dump must show every approved row as CONVERGED (or gone).
    const refused = [];
    if (verify) {
      const out = path.join(scratch, "verify.md");
      runNode([path.join(SCRIPTS, "webflow-reconcile.mjs"), newDir, "--base", base, "--out", out, "--json", "--quiet", "--date", "1970-01-01"]);
      const again = JSON.parse(fs.readFileSync(out.replace(/\.md$/, ".json"), "utf8"));
      const byKey = new Map(again.rows.map((r) => [r.key, r]));
      for (const r of rows) {
        const now = byKey.get(r.key);
        if (now && now.direction !== "CONVERGED") refused.push({ n: r.n, key: r.key, now: now.direction, why: `a reconcile against the same dump still shows it as ${now.direction}: the repo does not have Webflow's value yet` });
      }
      if (refused.length && !force) rows = rows.filter((r) => !refused.some((x) => x.n === r.n));
    }
    if (!rows.length) return { refreshed: [], refused, skipped, remaining: null, files: [] };

    const baseF = new Folder(base);
    const newF = new Folder(newDir);
    const baseSnap = loadSnapshot(base);
    const newSnap = loadSnapshot(newDir);
    const changes = diffSnapshots(baseSnap, newSnap);
    const units = unitsOf(rows, changes);
    const repoBase = { css: [], tokens: {} };
    const mapEdits = [];

    const elementUnits = new Map();
    const headers = new Map();
    const style = [];
    const variable = [];
    const simple = [];
    for (const u of units) {
      if (u.area === "element") elementUnits.set(u.where, [...(elementUnits.get(u.where) ?? []), u]);
      else if (u.area === "page" || u.area === "component") headers.set(u.where, [...(headers.get(u.where) ?? []), u]);
      else if (u.area === "style") style.push(u);
      else if (u.area === "variable") variable.push(u);
      else if (["interaction", "asset", "site", "cms"].includes(u.area)) simple.push(u);
    }
    for (const [where, us] of headers) applyHeaderUnits({ kind: where.startsWith("page:") ? "page" : "component", where, units: us, baseF, newF });
    for (const [where, us] of elementUnits) applyElementUnits({ where, units: us, baseF, newF, mapEdits });
    if (style.length) applyStyleUnits({ units: style, baseF, newF, repoBase });
    if (variable.length) applyVariableUnits({ units: variable, baseF, newF, repoBase });
    applySimpleUnits({ units: simple, baseF, newF });

    const { written, removed } = baseF.save();
    const mapFiles = updateMaps(base, mapEdits);

    // Manifest: hashes, the rows refreshed, the repo-side overlay, and the signals that can now be trusted.
    for (const [rel, content] of written) manifest.files[rel] = sha256(content);
    for (const rel of removed) delete manifest.files[rel];
    const prior = manifest.repoBase ?? { css: [], tokens: {} };
    const css = new Map((prior.css ?? []).map((x) => [x.slice(0, 4).join("\u0000"), x]));
    for (const x of repoBase.css) css.set(x.slice(0, 4).join("\u0000"), x);
    const tokens = { ...(prior.tokens ?? {}), ...repoBase.tokens };
    if (css.size || Object.keys(tokens).length) manifest.repoBase = { css: [...css.values()].sort((a, b) => (a.slice(0, 4).join("\u0000") < b.slice(0, 4).join("\u0000") ? -1 : 1)), tokens: Object.fromEntries(Object.entries(tokens).sort(([a], [b]) => (a < b ? -1 : 1))) };
    manifest.refreshedRows = [...(manifest.refreshedRows ?? []), { report: path.basename(file, ".json"), rows: formatRows(rows.map((r) => r.n)), keys: rows.map((r) => r.key), newDump: newManifest.dump, at }];
    const full = syncSignals(manifest, newManifest, baseF, newF, base, newDir);
    // The refreshed files need a fresh read for the equality test above, so recompute the hashes from disk.
    if (full) manifest.refreshedRows.at(-1).baseEqualsNewDump = true;
    fs.writeFileSync(manifestFile, `${JSON.stringify(sortKeys(manifest), null, 2)}\n`);

    const remaining = diffSnapshots(loadSnapshot(base), newSnap).filter((c) => c.area !== "signal" && c.area !== "manifest").length;
    return { refreshed: rows.map((r) => r.n), refused, skipped, remaining, files: [...written.keys(), ...removed, ...mapFiles, "manifest.json"], full };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

/** `node scripts/webflow-snapshot.mjs --refresh <report.json> --rows … [--new <dump>] [--base <dir>] [--force] [--no-verify]` */
export async function runRefreshCli(argv) {
  const opt = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const reportFile = opt("--refresh");
  if (!reportFile || reportFile.startsWith("--")) {
    console.error("Usage: node scripts/webflow-snapshot.mjs --refresh <report.json> --rows <1-5,8|auto|all> [--new <dump or snapshot>] [--base <data dir>] [--force] [--no-verify]");
    return 2;
  }
  try {
    const r = await refreshBase({ reportFile, rows: opt("--rows"), baseDir: opt("--base") ? path.resolve(opt("--base")) : DEFAULT_DATA, input: opt("--new") ?? null, verify: !argv.includes("--no-verify"), force: argv.includes("--force") });
    printRefresh(r);
    if (r.refreshed.length) {
      const { file, report } = loadReport(reportFile);
      recordApplied(file, report, r.refreshed.map((n) => ({ n, refreshed: true, how: "agent", files: [] })));
    }
    return r.refused.length && !argv.includes("--force") && !r.refreshed.length ? 3 : 0;
  } catch (e) {
    console.error(`Refused: ${e.message}`);
    return 2;
  }
}

export function printRefresh(r) {
  if (r.skipped?.length) console.log(`Skipped (repo ahead, nothing to absorb): ${formatRows(r.skipped)}`);
  for (const x of r.refused) console.log(`NOT refreshed #${x.n}: ${x.why}`);
  if (!r.refreshed.length) {
    console.log("Nothing was refreshed.");
    return;
  }
  console.log(`Refreshed the base for rows ${formatRows(r.refreshed)}: ${r.files.length} file(s) written (${r.files.filter((f) => f !== "manifest.json").slice(0, 8).join(", ")}${r.files.length > 9 ? ", …" : ""}).`);
  console.log(`${r.remaining} difference(s) remain between the base and the new dump (the rows you did not refresh).${r.full ? " The base equals the new dump now." : ""}`);
}
