// The three-way compare: turns the Webflow-side changes (reconcile/diff.mjs) plus what the repo did since
// the base (reconcile/repo-state.mjs, the maps) into report rows: PULL, CONFLICT, CONVERGED, REPO AHEAD, each
// with the proposed repo edit (file:line, old -> new, auto or assisted). See docs/webflow/plans/reconcile.md
// ("The changes report") and docs/webflow/snapshot/README.md ("Reconcile report").
import path from "node:path";
import { classes, normName, wfTag } from "./align.mjs";
import { norm } from "./html.mjs";
import { lis } from "./diff.mjs";
import { wfCmp, wfShow } from "./fields.mjs";
import { allSourceFiles, componentFile, findPattern, findString } from "./locate.mjs";
import { repoPages } from "./build-map.mjs";
import { componentSurface, pageSequence, registryRows, sequenceDiff } from "./repo-ahead.mjs";
import { layoutOf } from "./structure.mjs";
import { canonToken, changedStatus, flatKey, familyFile, locateCss, normalizeValue, parseCssRules, parseTokens, repoValue, sha256, showFile as showFileRaw, readNow as readNowRaw, tokenName, WEBFLOW_DEFAULTS } from "./repo-state.mjs";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const GONE = Symbol("gone");
const cls = (list) => [...new Set(classes(list ?? []))].sort();
const clsJoin = (list) => cls(list).join(" ");

/** direction from "Webflow changed", "repo changed" and "both ended at the same value". */
// A repo that already has the new Webflow value is in sync whatever its base value was (a pre-existing difference
// that Webflow resolved, or an edit made on both sides): CONVERGED, never PULL.
export const direction = (wf, repo, converged) => (wf && converged ? "CONVERGED" : wf && repo ? "CONFLICT" : wf ? "PULL" : "REPO AHEAD");

const entryAt = (maps, where, id) => {
  const i = where.indexOf(":");
  return maps?.[where.slice(0, i) === "page" ? "pages" : "components"]?.[where.slice(i + 1)]?.elements?.[id];
};

/** Short description of an element for the report. */
function describe(ctx) {
  if (!ctx) return "";
  if (ctx.x !== undefined) return JSON.stringify(ctx.x.length > 50 ? `${ctx.x.slice(0, 50)}…` : ctx.x);
  const head = ctx.comp ? `${ctx.comp} instance` : ctx.tag ?? ctx.t;
  return `${head}${ctx.c?.length ? ` .${ctx.c.join(".")}` : ""}`;
}

const clip = (t, n = 50) => (String(t).length > n ? `${String(t).slice(0, n)}…` : String(t));
const words = (t) => new Set(String(t).toLowerCase().match(/[a-z0-9]+/g) ?? []);
/** Do two strings share enough words to be the same text edited (not two unrelated texts)? */
const related = (a, b) => {
  const x = words(a);
  const y = words(b);
  if (!x.size || !y.size) return true;
  const common = [...x].filter((w) => y.has(w)).length;
  return common / (x.size + y.size - common) >= 0.25;
};

const AREA_ORDER = ["Elements", "Styles", "Variables", "Components", "Pages", "Custom code", "Interactions", "Assets", "Site and CMS"];

const memo = (fn) => {
  const m = new Map();
  return (...a) => {
    const k = a.join("\u0000");
    if (!m.has(k)) m.set(k, fn(...a));
    return m.get(k);
  };
};
const readNow = memo(readNowRaw);
const showFile = memo(showFileRaw);

export class Rows {
  constructor(ctx) {
    this.ctx = ctx;
    this.rows = [];
    this.footer = { noise: [], accepted: 0, signals: [], goneFromRender: 0, versionOnly: [], unlocated: [], bound: [], preexisting: [], misaligned: [] };
    this.order = 0;
  }

  add(row) {
    this.rows.push({ order: this.order++, notes: [], ...row });
  }

  // ---- Elements --------------------------------------------------------------------------------
  elements(changes) {
    const by = new Map();
    for (const c of changes) by.set(c.where, [...(by.get(c.where) ?? []), c]);
    for (const [where, cs] of by) {
      const sets = { added: new Map(), removed: new Map() };
      for (const c of cs) if (c.field === "added" || c.field === "removed") sets[c.field].set(c.id, c);
      const topIn = (field, id) => {
        let cur = sets[field].get(id);
        if (!cur) return null;
        while (sets[field].has(cur.parent)) cur = sets[field].get(cur.parent);
        return cur;
      };
      const subtree = new Map();
      for (const c of cs) if ((c.field === "added" || c.field === "removed") && sets[c.field].has(c.parent)) subtree.set(topIn(c.field, c.id).id, (subtree.get(topIn(c.field, c.id).id) ?? 1) + 1);
      // A move caused by an add / remove (into a new parent, out of a removed one) belongs to that row.
      const absorbed = new Map();
      const isAbsorbed = new Set();
      for (const c of cs) {
        if (c.field !== "moved" || !c.parentChanged) continue;
        const top = topIn("added", c.new.parent) ?? topIn("removed", c.base.parent);
        if (!top) continue;
        absorbed.set(top.id, [...(absorbed.get(top.id) ?? []), c]);
        isAbsorbed.add(c);
      }
      const structural = [];
      // Webflow writes a link's resolved href into the attributes too: one edit of the target is one row.
      const linkEdited = new Set(cs.filter((c) => c.field === "settings.link").map((c) => c.id));
      for (const c of cs) {
        if (c.field === "attr.href" && linkEdited.has(c.id)) continue;
        if (isAbsorbed.has(c)) continue;
        if ((c.field === "added" || c.field === "removed") && sets[c.field].has(c.parent)) continue;
        const key = `${c.area}|${where}|${c.id}|${c.field}`;
        const base = { key, area: "Elements", sub: c.field, where, element: describe(c.ctx), id: c.id, change: c };
        if (c.field === "text") this.add({ ...base, ...this.textRow(c) });
        else if (c.field === "classes") this.add({ ...base, ...this.classRow(c) });
        else if (c.field.startsWith("prop.")) this.add({ ...base, ...this.propRow(c) });
        else if (c.field === "added" || c.field === "removed") structural.push({ c, base, parent: c.parent, row: this.structureRow(c, subtree.get(c.id) ?? 1, absorbed.get(c.id) ?? []) });
        else if (c.field === "moved") structural.push({ c, base, parent: c.new.parent, row: this.moveRow(c) });
        else if (/^(attr|settings)\./.test(c.field)) {
          const row = this.fieldRow(c);
          if (row) this.add({ ...base, ...row });
        } else this.add({ ...base, ...this.otherRow(c) });
      }
      // Several adds / removes / moves under one parent are one restructure of that parent.
      const groups = new Map();
      for (const it of structural) groups.set(it.parent, [...(groups.get(it.parent) ?? []), it]);
      for (const [parent, items] of groups) {
        if (items.length === 1) this.add({ ...items[0].base, ...items[0].row });
        else this.add(this.restructureRow(where, parent, items, absorbed));
      }
    }
  }

  /** Common wrapper: edit location for an element change when the repo side cannot be compared. */
  loc(c) {
    return entryAt(this.ctx.locMaps, c.where, c.id) ?? entryAt(this.ctx.baseMaps, c.where, c.id);
  }

  componentNote(c) {
    return c.where.startsWith("component:") ? ["edits the component definition: applies to every instance"] : [];
  }

  textRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    // The alignment with the NEW tree is the better witness of what the repo has now (a restructure loses the one with the base tree).
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const loc = nme ?? ne ?? be;
    const notes = [...this.componentNote(c)];
    if (c.idChanged) notes.push("Webflow re-created this text run (new element id)");
    if (!loc) {
      // Unmapped (a re-created text run in a part of the tree the alignment could not pair): the repo already has the
      // new text when the page's / component's source file holds it and no longer holds the old one.
      const src = [this.ctx.newMaps, this.ctx.nowMaps, this.ctx.baseMaps].map((m) => m?.[c.where.startsWith("page:") ? "pages" : "components"]?.[c.where.slice(c.where.indexOf(":") + 1)]?.header?.source).find(Boolean);
      const file = src?.replace(/:\d+$/, "");
      const hasNew = file && typeof c.new === "string" && c.new && findString(file, c.new);
      if (hasNew && !hasNew.partial && hasNew.lines.length && !(typeof c.base === "string" && c.base && (() => { const f = findString(file, c.base); return f.lines.length && !f.partial; })())) {
        return { webflow: c.new, base: c.base, direction: "CONVERGED", mode: "assisted", edit: null, notes: [...notes, `the repo already has this text (${file}:${hasNew.lines[0]}); the element is not mapped`] };
      }
      return { webflow: c.new, base: c.base, direction: "PULL", mode: "assisted", edit: null, notes: [...notes, "no repo location in the map (element not mapped): find the text by hand"] };
    }
    const repoBase = be ? be.repoText ?? be.text : c.base;
    const repoNow = nowMaps ? (nme ? nme.repoText ?? nme.text : ne ? ne.repoText ?? ne.text : GONE) : repoBase;
    const repoChanged = repoNow === GONE || norm(repoNow) !== norm(repoBase);
    const converged = repoNow !== GONE && norm(repoNow) === norm(c.new);
    const dir = direction(true, repoChanged, converged);
    const edit = { op: "replace-text", file: loc.file, line: loc.line, locate: loc.locate, old: c.base, new: c.new };
    if (loc.of) Object.assign(edit, { occ: loc.occ, of: loc.of, alts: loc.alts });
    if (be?.repoText !== undefined) notes.push(`the repo builds this text from parts (repo renders ${JSON.stringify(be.repoText)})`);
    if (loc.of) notes.push(`${loc.of} places hold this string; the map picked occurrence ${loc.occ}${loc.alts?.length ? ` (others: ${loc.alts.join(", ")})` : ""}`);
    if (loc.locate === "manual") notes.push("text not found as a literal: edit by hand in the element's file");
    if (loc.locate === "partial") notes.push("only the start or end of the text was found on that line");
    const verified = loc.file && loc.line && !["manual"].includes(loc.locate) && findString(loc.file, c.base).lines.includes(loc.line);
    const auto = dir === "PULL" && (loc.locate === "literal" || loc.locate === "data") && !loc.of && be?.repoText === undefined && !loc.part && verified;
    return { webflow: c.new, base: c.base, repo: dir === "CONFLICT" ? (repoNow === GONE ? "(element not found in the repo render)" : repoNow) : undefined, direction: dir, mode: auto ? "auto" : "assisted", edit, notes };
  }

  classRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const loc = nme ?? ne ?? be;
    const notes = [...this.componentNote(c)];
    const wfBase = cls(c.base);
    const wfNew = cls(c.new);
    const repoBase = be ? (be.rc ?? wfBase) : wfBase;
    // What the repo has now: read off the alignment with the NEW tree (the base-tree one is lost by a restructure).
    const repoNow = nowMaps ? (nme ? nme.rc ?? wfNew : ne ? ne.rc ?? wfBase : GONE) : repoBase;
    const repoChanged = repoNow === GONE || repoNow.join(" ") !== repoBase.join(" ");
    const converged = repoNow !== GONE && repoNow.join(" ") === wfNew.join(" ");
    const dir = loc ? direction(true, repoChanged, converged) : "PULL";
    const removed = wfBase.filter((x) => !wfNew.includes(x));
    const added = wfNew.filter((x) => !wfBase.includes(x));
    const res = { base: c.base.join(" "), webflow: c.new.join(" "), repo: dir === "CONFLICT" ? (repoNow === GONE ? "(element not found in the repo render)" : repoNow.join(" ")) : undefined, direction: dir, notes };
    if (!loc) return { ...res, mode: "assisted", edit: null, notes: [...notes, "no repo location in the map (element not mapped)"] };
    const edit = { op: "change-classes", file: loc.file, line: loc.line, remove: removed, add: added, tag: loc.k };
    let line = null;
    if (removed.length === 1 && added.length === 1 && loc.file) {
      line = findPattern(loc.file, new RegExp(`(^|[^a-z0-9-])${esc(removed[0])}($|[^a-z0-9-])`), loc.line, 40);
      if (line) edit.line = line;
    }
    if (!line) notes.push(`class token not found near ${loc.file}:${loc.line}: ${loc.file?.includes("/lib/") ? "the element is rendered by a shared helper, edit its caller" : "classes may come from a helper or a utility list"}`);
    if (be?.rc) notes.push("the repo's class list differs from Webflow's for this element already");
    return { ...res, mode: dir === "PULL" && line && !be?.rc && removed.length === 1 && added.length === 1 ? "auto" : "assisted", edit };
  }

  propRow(c) {
    const { baseMaps, nowMaps } = this.ctx;
    const name = c.field.slice(5);
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const loc = nme ?? ne ?? be;
    const notes = [...this.componentNote(c)];
    const val = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v);
    const res = { base: val(c.base) ?? null, webflow: val(c.new) ?? null, direction: "PULL", notes, mode: "assisted", edit: null };
    const bp = be?.props?.[name];
    const np = ne?.props?.[name];
    const mp = nme?.props?.[name];
    const p = np ?? bp ?? mp; // where and how the repo writes it: the entry of the repo as it stands, else the new alignment's
    if (!loc || !p) return { ...res, notes: [...notes, "no repo location for this instance prop in the map (a new override, a prop the repo does not pass, or an instance the repo renders as plain markup): edit by hand"] };
    const repoBase = bp ? bp.repoValue ?? bp.value : c.base;
    const repoNow = nowMaps ? (mp ? mp.repoValue ?? mp.value : np ? np.repoValue ?? np.value : GONE) : repoBase;
    const repoChanged = repoNow === GONE || !same(repoNow, repoBase);
    const converged = repoNow !== GONE && same(repoNow, c.new);
    const dir = direction(true, repoChanged, converged);
    const edit = { op: "set-prop", comp: loc.comp, prop: name, repoProp: p.prop, file: p.file, line: p.line, locate: p.locate, old: c.base ?? null, new: c.new ?? null };
    if (p.locate === "default") notes.push(`the repo does not pass this prop: the edit is the component default in ${p.file}:${p.line} and changes every instance that relies on it`);
    if (p.locate === "manual" || !p.file) notes.push("prop not found in the repo (CMS-bound, derived or computed): edit by hand");
    if (p.repoValue !== undefined) notes.push(`the repo passes ${JSON.stringify(p.repoValue)} (Webflow stores it differently)`);
    const plain = ["string", "number", "boolean"].includes(typeof c.new) || c.new === null;
    return { ...res, repo: dir === "CONFLICT" ? (repoNow === GONE ? "(instance not found in the repo render)" : val(repoNow)) : undefined, direction: dir, edit, mode: dir === "PULL" && ["attr", "literal", "data"].includes(p.locate) && plain && p.repoValue === undefined ? "auto" : "assisted" };
  }

  // ---- Structure: added, removed, moved, restructured --------------------------------------------
  tree(snap, where) {
    return (where.startsWith("page:") ? snap.pages : snap.components)[where.slice(where.indexOf(":") + 1)];
  }

  nodeDesc(where, id) {
    const n = this.tree(this.ctx.nw, where)?.byId.get(id) ?? this.tree(this.ctx.base, where)?.byId.get(id);
    return n ? describe({ t: n.t, tag: n.s?.tag, c: n.c, x: n.x, comp: n.i?.name }) : String(id).slice(0, 8);
  }

  /** The nearest ancestor of `id` (itself included) in `tree` that has an entry in `elements`; null at the root. */
  mappedUp(tree, id, elements) {
    let cur = id;
    while (cur) {
      if (elements?.[cur] && elements[cur].k !== "body") return cur;
      cur = tree?.byId.get(cur)?.p ?? null;
    }
    return null;
  }

  structureRow(c, count, absorbed = []) {
    const { baseMaps, nw } = this.ctx;
    const notes = [...this.componentNote(c)];
    if (count > 1) notes.push(`${count} elements (the element and its descendants)`);
    for (const m of absorbed) notes.push(c.field === "added" ? `also moves ${describe(m.ctx)} into it` : `also moves ${describe(m.ctx)} out of it`);
    if (c.field === "added") {
      // Aligning the working-tree render with the NEW tree shows whether the repo already has the element.
      const nme = entryAt(this.ctx.newMaps, c.where, c.id);
      if (nme && nme.k !== "body") {
        const same1 = nme.k === "el" ? !nme.rc : nme.k === "inst" ? true : nme.repoText === undefined;
        return { base: null, webflow: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), repo: same1 ? undefined : nme.rc ? nme.rc.join(" ") : "(differs)", direction: same1 ? "CONVERGED" : "CONFLICT", mode: "assisted", edit: { op: "add-element", file: nme.file, line: nme.line, parent: c.parent, index: c.index, element: c.new }, notes: [...notes, "the repo already has a matching element here"] };
      }
      // The nearest mapped ancestor tells where to insert it.
      const tree = this.tree(nw, c.where);
      let cur = c.parent;
      let at = null;
      while (cur && !at) {
        at = entryAt(this.ctx.locMaps, c.where, cur) ?? entryAt(baseMaps, c.where, cur);
        cur = at ? cur : tree?.byId.get(cur)?.p;
      }
      const edit = { op: "add-element", file: at?.file ?? null, line: at?.line ?? null, parent: c.parent, index: c.index, element: c.new };
      return { base: null, webflow: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), direction: "PULL", mode: "assisted", edit, notes: [...notes, at ? "insert inside the nearest mapped ancestor" : "no mapped ancestor: place by hand", "repo side not compared for new elements"] };
    }
    const be = entryAt(baseMaps, c.where, c.id);
    const loc = entryAt(this.ctx.locMaps, c.where, c.id) ?? be;
    const edit = { op: "remove-element", file: loc?.file ?? null, line: loc?.line ?? null, base: c.base, new: c.new };
    if (!loc) notes.push("element not mapped: locate by hand");
    const state = this.removedState(c, be);
    if (state === "converged") notes.push("the repo no longer has this element");
    return { base: describe(c.ctx) + (count > 1 ? ` (+${count - 1} inside)` : ""), webflow: null, direction: state === "converged" ? "CONVERGED" : "PULL", mode: "assisted", edit, notes };
  }

  /** Is the removed element already gone from the repo? Read off the repo nodes that no new-tree element claims. */
  removedState(c, be) {
    const { nowMaps, newMaps } = this.ctx;
    if (!be) return "unknown";
    if (!nowMaps || !newMaps) return "present";
    if (be.k === "text") return entryAt(nowMaps, c.where, c.id) ? "present" : "converged";
    const i = c.where.indexOf(":");
    const orphans = newMaps[c.where.startsWith("page:") ? "pages" : "components"]?.[c.where.slice(i + 1)]?.repoOnly;
    if (!orphans) return "present";
    const want = cls(c.base.c);
    const tag = wfTag(c.base);
    const pp = entryAt(this.ctx.baseMaps, c.where, c.parent)?.path;
    const like = orphans.some((o) => {
      const oc = o.cls ?? [];
      const sameLook = want.length ? oc.join(" ") === want.join(" ") : o.tag === tag && !oc.length;
      return sameLook && (!pp || !o.path || (pp.length < o.path.length && pp.every((v, k) => o.path[k] === v)));
    });
    return like ? "present" : "converged";
  }

  /** A sibling reorder or a move to another parent, three-way: the repo's parent and order in the base, now and against the new tree. */
  moveRow(c) {
    const { baseMaps, nowMaps, newMaps, nw } = this.ctx;
    const kind = c.where.startsWith("page:") ? "pages" : "components";
    const slug = c.where.slice(c.where.indexOf(":") + 1);
    const bEls = baseMaps?.[kind]?.[slug]?.elements;
    const nEls = nowMaps?.[kind]?.[slug]?.elements;
    const wEls = newMaps?.[kind]?.[slug]?.elements;
    const x = c.id;
    const tree = this.tree(nw, c.where);
    const notes = [...this.componentNote(c)];
    const pNew = c.new.parent;
    const pBase = c.base.parent;
    notes.push(c.parentChanged ? `moves from ${this.nodeDesc(c.where, pBase)} to ${this.nodeDesc(c.where, pNew)}` : `reordered inside ${this.nodeDesc(c.where, pNew)}`);
    // The neighbour it now follows (nearest earlier sibling with a repo location), else its parent.
    const kidsNew = tree?.byId.get(pNew)?.kids ?? [];
    let target = null;
    for (let k = kidsNew.findIndex((n) => n.id === x) - 1; k >= 0 && !target; k--) {
      const e = entryAt(this.ctx.locMaps, c.where, kidsNew[k].id) ?? entryAt(baseMaps, c.where, kidsNew[k].id);
      if (e?.file) target = { position: "after", id: kidsNew[k].id, desc: this.nodeDesc(c.where, kidsNew[k].id), file: e.file, line: e.line };
    }
    if (!target) {
      const e = entryAt(this.ctx.locMaps, c.where, pNew) ?? entryAt(baseMaps, c.where, pNew);
      target = { position: "first-child-of", id: pNew, desc: this.nodeDesc(c.where, pNew), file: e?.file ?? null, line: e?.line ?? null };
    }
    const loc = entryAt(this.ctx.locMaps, c.where, x) ?? bEls?.[x];
    const edit = { op: "move-element", file: loc?.file ?? null, line: loc?.line ?? null, target, base: c.base, new: c.new };
    if (!loc) notes.push("element not mapped: locate by hand");
    const res = { base: `${this.nodeDesc(c.where, pBase)} #${c.base.index}`, webflow: `${this.nodeDesc(c.where, pNew)} #${c.new.index}`, mode: "assisted", edit, notes };
    if (!bEls?.[x]) return { ...res, direction: "PULL", notes: [...notes, "repo side not compared (element not in the base map)"] };
    // Did the repo move it since the base?
    let repoMoved = false;
    const lb = layoutOf(bEls);
    const ln = layoutOf(nEls);
    if (ln) {
      if (!nEls[x]) repoMoved = true;
      else {
        const pb = lb.parent.get(x);
        const pn = ln.parent.get(x);
        const kb = lb.kids.get(pb) ?? [];
        if (pb !== pn) repoMoved = true;
        else {
          const seq = (ln.kids.get(pn) ?? []).filter((id) => kb.includes(id));
          if (!lis(seq.map((id) => kb.indexOf(id))).has(seq.indexOf(x))) repoMoved = true;
        }
      }
    }
    // Does the repo already have the new position? (aligned against the NEW tree, parent and order)
    let converged = false;
    const lw = layoutOf(wEls);
    if (lw && wEls[x]) {
      const expect = this.mappedUp(tree, pNew, wEls);
      const got = lw.parent.get(x) ?? null;
      const order = kidsNew.map((n) => n.id).filter((id) => lw.parent.get(id) === got);
      const repoOrder = (lw.kids.get(got) ?? []).filter((id) => order.includes(id));
      const siblingsKept = kidsNew.every((n) => !bEls[n.id] || wEls[n.id]);
      converged = got === expect && order.join() === repoOrder.join() && siblingsKept;
    }
    if (converged) return { ...res, direction: "CONVERGED", notes: [...notes, "the repo already has this order"] };
    if (repoMoved) return { ...res, direction: "CONFLICT", repo: "(moved differently in the repo)", notes: [...notes, "the element is elsewhere in the repo render now; compare by hand"] };
    return { ...res, direction: "PULL" };
  }

  /** Several adds / removes / moves under one parent: one row listing them, with the direction of the whole. */
  restructureRow(where, parentId, items) {
    const { baseMaps, newMaps } = this.ctx;
    const members = items.map(({ c, base, row }) => ({
      change: c.field,
      element: base.element,
      id: c.id,
      direction: row.direction,
      op: row.edit?.op ?? null,
      file: row.edit?.file ?? null,
      line: row.edit?.line ?? null,
      ...(row.edit?.target ? { target: row.edit.target } : {}),
      ...(row.notes?.length ? { notes: row.notes.filter((n) => !/^edits the component definition/.test(n)) } : {}),
    }));
    const n = (f) => members.filter((m) => m.change === f).length;
    const dirs = new Set(members.map((m) => m.direction));
    const direction = dirs.has("CONFLICT") ? "CONFLICT" : dirs.has("PULL") ? "PULL" : "CONVERGED";
    const parentDesc = this.nodeDesc(where, parentId);
    const at = entryAt(this.ctx.locMaps, where, parentId) ?? entryAt(baseMaps, where, parentId) ?? entryAt(newMaps, where, parentId);
    const notes = [...(where.startsWith("component:") ? ["edits the component definition: applies to every instance"] : [])];
    notes.push(`${members.length} structural changes under ${parentDesc}: ${["removed", "added", "moved"].filter((f) => n(f)).map((f) => `${n(f)} ${f}`).join(", ")}`);
    const done = members.filter((m) => m.direction === "CONVERGED").length;
    if (direction !== "CONVERGED" && done) notes.push(`${done} of ${members.length} already match the repo`);
    if (direction === "CONVERGED") notes.push("the repo already has the new structure");
    return {
      key: `element|${where}|${parentId}|restructure`,
      area: "Elements",
      sub: "restructure",
      where,
      element: `restructure of ${parentDesc}`,
      id: parentId,
      base: `${n("removed")} removed, ${n("moved")} moved`,
      webflow: `${n("added")} added`,
      direction,
      mode: "assisted",
      edit: { op: "restructure", file: at?.file ?? null, line: at?.line ?? null, parent: parentId, members },
      notes,
      members,
      change: { area: "element", where, id: parentId, field: "restructure" },
    };
  }

  /** Attributes and settings (link, image asset / alt, loading, ids, form field), compared by value with the render. */
  fieldRow(c) {
    const { baseMaps, nowMaps, base, nw, fcBase, fcNew } = this.ctx;
    const F = c.field;
    const slug = c.where.slice(c.where.indexOf(":") + 1);
    // A component's ID prop binds the input's id and the label's for: Webflow shows no static attribute for them.
    if ((F === "attr.id" || F === "attr.for") && c.where.startsWith("component:") && c.new == null && (nw.components[slug] ?? base.components[slug])?.props?.some((p) => p.type === "id")) {
      this.footer.bound.push(`${c.where} ${describe(c.ctx)} ${F}: ${JSON.stringify(c.base)} is now bound to the component's ID prop (not a change)`);
      return null;
    }
    const type = c.ctx?.t;
    const be = entryAt(baseMaps, c.where, c.id);
    const ne = nowMaps ? entryAt(nowMaps, c.where, c.id) : be;
    const nme = entryAt(this.ctx.newMaps, c.where, c.id);
    const loc = nme ?? ne ?? be;
    const notes = [...this.componentNote(c)];
    const wfB = wfCmp(F, c.base, fcBase, type);
    const wfN = wfCmp(F, c.new, fcNew, type);
    const repoVal = (e, wf) => (F in (e.ra ?? {}) ? e.ra[F] ?? undefined : wf);
    const repoBase = be ? repoVal(be, wfB) : wfB;
    const repoNow = nowMaps ? (nme ? repoVal(nme, wfN) : ne ? repoVal(ne, wfB) : GONE) : repoBase;
    const repoChanged = repoNow === GONE || repoNow !== repoBase;
    const converged = repoNow !== GONE && repoNow === wfN;
    const dir = loc ? direction(true, repoChanged, converged) : "PULL";
    const res = { base: wfShow(F, c.base, fcBase) ?? null, webflow: wfShow(F, c.new, fcNew) ?? null, direction: dir, notes };
    if (dir === "CONFLICT") res.repo = repoNow === GONE ? "(element not found in the repo render)" : repoNow ?? "(none)";
    if (!loc) return { ...res, mode: "assisted", edit: null, notes: [...notes, "no repo location in the map (element not mapped): locate by hand"] };
    if (be && F in (be.ra ?? {})) notes.push(`the repo differed from Webflow here already: it renders ${JSON.stringify(be.ra[F])}`);
    const edit = { op: `set-${F}`, file: loc.file ?? null, line: loc.line ?? null, old: res.base, new: res.webflow };
    let mode = "assisted";
    const oldStr = typeof c.base === "string" ? c.base : null;
    const prop = F.startsWith("attr.") ? F.slice(5) : F === "settings.altText" ? "alt" : null;
    if (loc.file && prop && oldStr && typeof c.new === "string" && dir === "PULL") {
      const line = findPattern(loc.file, new RegExp(`\\b${esc(prop)}\\s*=\\s*[{"']*${esc(oldStr)}`), loc.line, 30);
      if (line) {
        edit.line = line;
        mode = "auto";
      }
    }
    if (mode === "assisted" && dir !== "CONVERGED") notes.push(F === "settings.link" || F === "attr.href" ? "the repo writes the target in the component call (href / link prop) or a data array: search the old target" : "edit the attribute in the element's JSX");
    return { ...res, mode, edit, notes };
  }

  otherRow(c) {
    const loc = this.loc(c);
    const notes = [...this.componentNote(c)];
    if (this.ctx.nowMaps) notes.push("repo side not compared for this field");
    const v = (x) => (x && typeof x === "object" ? JSON.stringify(x) : x ?? null);
    const edit = loc ? { op: `set-${c.field}`, file: loc.file ?? null, line: loc.line ?? null, old: c.base ?? null, new: c.new ?? null } : null;
    if (!loc) notes.push("element not mapped: locate by hand");
    return { base: v(c.base), webflow: v(c.new), direction: "PULL", mode: "assisted", edit, notes };
  }

  /** Repo-ahead elements: a mapped element whose repo text, classes, attribute or prop value changed while Webflow's did not. */
  elementsRepoAhead() {
    const { baseMaps, nowMaps, newMaps, base, nw, webflowChangeKeys, fcBase, fcNew } = this.ctx;
    if (!newMaps) return;
    // The alignment with the NEW tree says what the repo has at each Webflow element now.
    for (const kind of ["pages", "components"]) {
      for (const [slug, { elements }] of Object.entries(baseMaps[kind] ?? {})) {
        const where = `${kind === "pages" ? "page" : "component"}:${slug}`;
        const tree = (kind === "pages" ? nw.pages : nw.components)[slug];
        const baseTree = (kind === "pages" ? base.pages : base.components)[slug];
        for (const id of Object.keys(elements)) if (nowMaps && !nowMaps[kind]?.[slug]?.elements?.[id]) this.footer.goneFromRender++;
        for (const [id, ne] of Object.entries(newMaps[kind]?.[slug]?.elements ?? {})) {
          const be = elements[id];
          const node = tree?.byId.get(id);
          if (!be || !node || be.k !== ne.k) continue;
          const mk = (field, sub, baseV, nowV, wfV, edit) =>
            this.add({ key: `repo|${where}|${id}|${field}`, area: "Elements", sub, where, id, element: describe({ t: node.t, tag: node.s?.tag, c: node.c, x: node.x, comp: node.i?.name }), base: wfV, webflow: wfV, repo: nowV, repoBase: baseV, direction: "REPO AHEAD", mode: "assisted", edit, notes: [] });
          if (be.k === "text") {
            const b = be.repoText ?? be.text;
            const n = ne.repoText ?? ne.text;
            if (norm(b) !== norm(n) && norm(n) !== norm(node.x ?? "") && !webflowChangeKeys.has(`${where}|${id}|text`)) {
              // An edit keeps some of the string; a text that shares nothing with Webflow's is a pair the alignment got wrong.
              if (!related(node.x ?? "", n)) this.footer.misaligned.push(`${where} ${JSON.stringify(clip(node.x ?? ""))} paired with ${JSON.stringify(clip(n))} (${ne.file}:${ne.line})`);
              else mk("text", "text", b, n, node.x, { op: "replace-text", file: ne.file, line: ne.line });
            }
          } else if (be.k === "el" && !/^(Form|Dynamo|Pagination|Dropdown|HtmlEmbed|Slot|RichText)/.test(node.t)) {
            const bc = be.rc ?? cls(baseTree?.byId.get(id)?.c ?? node.c);
            const nc = ne.rc ?? cls(node.c);
            if (bc.join(" ") !== nc.join(" ") && nc.join(" ") !== clsJoin(node.c) && !webflowChangeKeys.has(`${where}|${id}|classes`)) mk("classes", "classes", bc.join(" "), nc.join(" "), clsJoin(node.c), { op: "change-classes", file: ne.file, line: ne.line });
            const bNode = baseTree?.byId.get(id);
            for (const F of new Set([...Object.keys(be.ra ?? {}), ...Object.keys(ne.ra ?? {})])) {
              if (webflowChangeKeys.has(`${where}|${id}|${F}`)) continue;
              const raw = (n, field) => (field.startsWith("attr.") ? n?.a?.[field.slice(5)] : n?.s?.[field.slice(9)]);
              const wfB = wfCmp(F, raw(bNode, F), fcBase, node.t);
              const wfN = wfCmp(F, raw(node, F), fcNew, node.t);
              const b = F in (be.ra ?? {}) ? be.ra[F] ?? undefined : wfB;
              const n = F in (ne.ra ?? {}) ? ne.ra[F] ?? undefined : wfN;
              if (b !== n && n !== wfN) mk(F, F, b ?? null, n ?? "(none)", wfShow(F, raw(node, F), fcNew) ?? null, { op: `set-${F}`, file: ne.file, line: ne.line });
            }
          } else if (be.k === "inst") {
            for (const [name, bp] of Object.entries(be.props ?? {})) {
              const np = ne.props?.[name];
              if (!np) continue;
              const b = bp.repoValue ?? bp.value;
              const n = np.repoValue ?? np.value;
              if (!same(b, n) && !same(n, node.i?.props?.[name]) && !webflowChangeKeys.has(`${where}|${id}|prop.${name}`)) mk(`prop.${name}`, `prop.${name}`, b, n, node.i?.props?.[name], { op: "set-prop", file: np.file, line: np.line });
            }
          }
        }
      }
    }
  }

  /**
   * Pre-existing differences: the repo and Webflow differ here in the base and still do in the new dump, and Webflow did not
   * change it (so it is not a row). Read off `ra` (attributes and settings) and `rc` (classes) of the map; listed once.
   */
  preexisting() {
    const { baseMaps, newMaps, nw, webflowChangeKeys, acceptedElements } = this.ctx;
    const maps = newMaps ?? baseMaps;
    const seen = new Set();
    for (const kind of ["pages", "components"]) {
      for (const [slug, { elements }] of Object.entries(maps[kind] ?? {})) {
        const where = `${kind === "pages" ? "page" : "component"}:${slug}`;
        const tree = (kind === "pages" ? nw.pages : nw.components)[slug];
        for (const [id, e] of Object.entries(elements)) {
          if (e.k !== "el") continue;
          const node = tree?.byId.get(id);
          const before = baseMaps[kind]?.[slug]?.elements?.[id];
          if (!node || !before) continue;
          const fields = [...Object.keys(e.ra ?? {}), ...(e.rc ? ["classes"] : [])];
          for (const F of fields) {
            const wasThere = F === "classes" ? !!before.rc : F in (before.ra ?? {});
            if (!wasThere || webflowChangeKeys.has(`${where}|${id}|${F}`)) continue;
            const repo = F === "classes" ? e.rc.join(" ") : e.ra[F];
            const wf = F === "classes" ? clsJoin(node.c) : wfShow(F, F.startsWith("attr.") ? node.a?.[F.slice(5)] : node.s?.[F.slice(9)], this.ctx.fcNew);
            const line = `${where} ${describe({ t: node.t, tag: node.s?.tag, c: node.c })} ${F}: ${repo ?? "(none)"} → ${wf ?? "(none)"}`;
            const k = `${where}|${id}|${F}`;
            if (seen.has(k)) continue;
            seen.add(k);
            if (acceptedElements?.has(line)) {
              this.footer.accepted++;
              continue;
            }
            if (acceptedElements?.unaligned?.(where)) {
              this.footer.unalignedPre = (this.footer.unalignedPre ?? 0) + 1;
              continue;
            }
            this.footer.preexisting.push({ where, id, element: describe({ t: node.t, tag: node.s?.tag, c: node.c }), field: F, repo: repo ?? null, webflow: wf ?? null, file: e.file ?? null, line: e.line ?? null, acceptLine: line });
          }
        }
      }
    }
    this.footer.preexisting.sort((a, b) => (a.where + a.field + a.id < b.where + b.field + b.id ? -1 : 1));
  }

  // ---- Styles ----------------------------------------------------------------------------------
  cssValue(v) {
    return v === null || v === undefined ? v : String(v).replace(/var\(([^)]+)\)/g, "var(--$1)");
  }

  /** Hint when a raw Webflow value equals exactly one token (rule 2: tokens for system values). */
  snapHint(value) {
    if (value === null || value === undefined || /var\(/.test(String(value))) return null;
    const canon = String(value).replace(/\s+/g, "").toLowerCase();
    const hits = [...this.ctx.tokens.r1].filter(([, t]) => String(t.value).replace(/\s+/g, "").toLowerCase() === canon);
    return hits.length === 1 ? `value equals token --${hits[0][0]}: snap to var(--${hits[0][0]})?` : null;
  }

  styleLine(sel, bp, pseudo, prop, repo, wf) {
    return `${sel} @${bp}:${pseudo} ${prop}: ${repo === undefined ? "(not in repo)" : repo} → ${wf === undefined ? "(missing)" : wf}`;
  }

  /** The CSS file that holds a rule for exactly this class chain (any state), else null. */
  ruleFile(sel) {
    for (const rel of this.ctx.files) if (parseCssRules(rel).some((r) => r.sel === sel)) return rel;
    return null;
  }

  styles(changes) {
    const { css, accepted, files } = this.ctx;
    for (const c of changes) {
      const sel = c.where;
      const key = `style|${sel}|${c.field}|${c.bp ?? ""}|${c.pseudo ?? ""}`;
      const notes = [];
      if (c.field === "added" || c.field === "removed") {
        const style = c.field === "added" ? c.new : c.base;
        const props = [];
        for (const [pseudo, p] of Object.entries(style.base ?? {})) for (const [k, v] of Object.entries(p)) props.push(["main", pseudo, k, normalizeValue(v), v]);
        for (const [bp, ps] of Object.entries(style.bp ?? {})) for (const [pseudo, p] of Object.entries(ps)) for (const [k, v] of Object.entries(p)) props.push([bp, pseudo, k, normalizeValue(v), v]);
        // Webflow adds a few defaults to every grid; a repo rule without them is the same style.
        const real = props.filter(([, , k, v]) => WEBFLOW_DEFAULTS[k] !== v);
        const has1 = real.filter(([bp, ps, k]) => repoValue(css.r1, sel, bp, ps, k) !== undefined).length;
        const eq1 = real.filter(([bp, ps, k, v]) => repoValue(css.r1, sel, bp, ps, k) === v).length;
        const has0 = [...css.r0.keys()].some((k) => k.startsWith(`${sel}\u0000`));
        const now = [...css.r1.keys()].some((k) => k.startsWith(`${sel}\u0000`));
        const fam = familyFile(sel, files);
        const hereAt = locateCss(files, sel, "main", "noPseudo", "display") ?? locateCss(files, sel, "main", "noPseudo", props[0]?.[2]);
        if (c.field === "added") {
          const dir = !now ? "PULL" : eq1 === real.length ? "CONVERGED" : "CONFLICT";
          const repoChanged = now && !has0;
          const rowDir = direction(true, repoChanged || (now && has0), eq1 === real.length && now);
          // A brand-new class goes into its family's CSS file (never the generated one); the registry row is the agent's follow-up.
          const auto = rowDir === "PULL" && !hereAt && !!fam.file && !/utilities\.css$/.test(fam.file) && /^(\.[a-z0-9-]+)+$/.test(sel) && real.length > 0;
          this.add({ key, area: "Styles", sub: "added", where: sel, element: `new style (${props.length} properties)`, base: null, webflow: props.map(([bp, ps, k, v]) => `${k}: ${v}${bp !== "main" || ps !== "noPseudo" ? ` [${bp}/${ps}]` : ""}`).slice(0, 6).join("; ") + (props.length > 6 ? "; …" : ""), repo: dir === "CONFLICT" ? `${has1}/${real.length} properties set, ${eq1} equal` : undefined, direction: rowDir, mode: auto ? "auto" : "assisted", edit: { op: "add-rule", file: hereAt?.rule?.file ?? fam.file, line: hereAt?.rule?.line ?? null, selector: sel, properties: props.map(([bp, pseudo, prop, , raw]) => ({ bp, pseudo, prop, value: this.cssValue(raw) })) }, notes: hereAt ? ["the repo has this rule"] : fam.file ? [] : ["no component CSS file for this class family: see classes.md"], change: c });
        } else {
          const unchanged = [...css.r0].filter(([k]) => k.startsWith(`${sel}\u0000`)).every(([k, v]) => css.r1.get(k) === v);
          const dir = !now ? "CONVERGED" : unchanged ? "PULL" : "CONFLICT";
          this.add({ key, area: "Styles", sub: "removed", where: sel, element: `style removed (${props.length} properties)`, base: `${props.length} properties`, webflow: null, direction: dir, mode: "assisted", edit: { op: "remove-rule", file: fam.file, selector: sel }, notes: [], change: c });
        }
        continue;
      }
      if (c.field === "type") continue;
      const bp = c.bp;
      const pseudo = c.pseudo;
      const prop = c.field;
      const wf = c.new === null ? undefined : normalizeValue(c.new);
      const wfBase = c.base === null ? undefined : normalizeValue(c.base);
      if (WEBFLOW_DEFAULTS[prop] && (wf === WEBFLOW_DEFAULTS[prop] || wfBase === WEBFLOW_DEFAULTS[prop]) && (wf === undefined || wfBase === undefined)) {
        this.footer.noise.push(`${sel} @${bp}:${pseudo} ${prop} (Webflow grid default)`);
        continue;
      }
      const r0 = repoValue(css.r0, sel, bp, pseudo, prop);
      const r1 = repoValue(css.r1, sel, bp, pseudo, prop);
      const repoChanged = r0 !== r1;
      const converged = r1 === wf;
      if (r1 !== wf && accepted.has(this.styleLine(sel, bp, pseudo, prop, r1, wf))) {
        this.footer.accepted++;
        continue;
      }
      const dir = direction(true, repoChanged, converged);
      const found = locateCss(files, sel, bp, pseudo, prop);
      let edit;
      let mode = "assisted";
      const newCss = this.cssValue(c.new);
      if (found?.line) {
        edit = { op: c.new === null ? "remove-declaration" : "set-declaration", file: found.file, line: found.line, decl: found.decl, old: found.value, new: newCss };
        if (found.shorthand) notes.push(`the repo sets this through the shorthand \`${found.decl}\``);
        if (/utilities\.css$/.test(found.file)) notes.push("generated: change the token or scripts/gen-utilities.mjs, then regenerate");
        else if (!found.shorthand) mode = "auto";
      } else if (found?.rule) {
        edit = { op: "add-declaration", file: found.rule.file, line: found.rule.line, decl: prop, new: newCss };
        mode = c.new !== null && !/utilities\.css$/.test(found.rule.file) ? "auto" : "assisted";
      } else {
        const fam = familyFile(sel, files);
        // A new state of a class the repo already styles goes beside its other rules, else into the family file.
        const home = this.ruleFile(sel) ?? fam.file;
        edit = { op: "add-rule", file: home, line: null, selector: sel, bp, pseudo, decl: prop, new: newCss };
        notes.push("no rule for this selector/state in src/styles");
        if (dir === "PULL" && home && !/utilities\.css$/.test(home) && c.new !== null && /^(\.[a-z0-9-]+)+$/.test(sel)) mode = "auto";
      }
      const hint = this.snapHint(c.new);
      if (hint) notes.push(hint);
      this.add({ key, area: "Styles", sub: prop, where: sel, element: `${prop}${bp !== "main" || pseudo !== "noPseudo" ? ` [${bp}/${pseudo}]` : ""}`, base: c.base, webflow: c.new, repo: dir === "CONFLICT" ? r1 ?? "(not set)" : undefined, direction: dir, mode, edit, notes, change: c });
    }
  }

  /** Repo-ahead styles: a property whose repo value changed since the base while Webflow's did not. */
  stylesRepoAhead() {
    const { css, accepted, webflowStyleKeys, wfNewStyles } = this.ctx;
    const keys = new Set([...css.r0.keys(), ...css.r1.keys()]);
    const bySel = new Map();
    for (const k of [...keys].sort()) {
      const [sel, bp, pseudo, prop] = k.split("\u0000");
      const r0 = css.r0.get(k);
      const r1 = css.r1.get(k);
      if (r0 === r1) continue;
      if (webflowStyleKeys.has(k) || webflowStyleKeys.has(`${sel}\u0000*`)) continue;
      const wf = wfNewStyles.get(k) ?? (prop === "overflow-x" || prop === "overflow-y" ? undefined : undefined);
      if (r1 === wf) continue;
      if (accepted.has(this.styleLine(sel, bp, pseudo, prop, r1, wf))) {
        this.footer.accepted++;
        continue;
      }
      bySel.set(sel, [...(bySel.get(sel) ?? []), { bp, pseudo, prop, r0, r1, wf }]);
    }
    for (const [sel, list] of bySel) {
      const noneBefore = [...css.r0.keys()].every((k) => !k.startsWith(`${sel}\u0000`));
      const noneNow = [...css.r1.keys()].every((k) => !k.startsWith(`${sel}\u0000`));
      if (noneBefore || noneNow) {
        this.add({ key: `repo|style|${sel}|${noneBefore ? "added" : "removed"}`, area: "Styles", sub: noneBefore ? "added" : "removed", where: sel, element: `${noneBefore ? "new" : "removed"} style (${list.length} properties)`, base: null, webflow: null, repo: noneBefore ? `${list.length} properties` : "removed", direction: "REPO AHEAD", mode: "assisted", edit: null, notes: ["push at the next sync"] });
        continue;
      }
      for (const p of list) this.add({ key: `repo|style|${sel}|${p.bp}|${p.pseudo}|${p.prop}`, area: "Styles", sub: p.prop, where: sel, element: `${p.prop}${p.bp !== "main" || p.pseudo !== "noPseudo" ? ` [${p.bp}/${p.pseudo}]` : ""}`, base: p.wf ?? null, webflow: p.wf ?? null, repo: p.r1 ?? "(removed)", repoBase: p.r0 ?? null, direction: "REPO AHEAD", mode: "assisted", edit: null, notes: [] });
    }
  }

  // ---- Variables -------------------------------------------------------------------------------
  variables(changes) {
    const { tokens, base, nw } = this.ctx;
    const tokensMd = readNow("docs/webflow/tokens.md")?.split("\n") ?? [];
    for (const c of changes) {
      const name = c.where;
      const type = (c.field === "removed" ? c.base?.type : c.new?.type ?? c.base?.type) ?? nw.variables[name]?.type ?? base.variables[name]?.type;
      const tn = tokenName(name);
      const t0 = tokens.r0.get(tn);
      const t1 = tokens.r1.get(tn);
      const canon = (t) => (t ? canonToken(type, t.value) : null);
      const wfVal = (v) => canonToken(type, v);
      const css = (v) => (v && typeof v === "object" && "value" in v ? `${v.value}${v.unit ?? ""}` : v);
      const key = `variable|${name}|${c.field}`;
      const mdLine = tokensMd.findIndex((l) => l.includes(`\`${name}\``) || l.includes(`\`${tn}\``)) + 1;
      const notes = ["run `node scripts/gen-utilities.mjs` if a spacing or color token changes (utilities.css is generated)"];
      const edit = { op: "", file: "src/styles/tokens.css", line: t1?.line ?? null, tokensMd: mdLine ? `docs/webflow/tokens.md:${mdLine}` : null, token: `--${tn}` };
      let dir;
      let mode = "assisted";
      let b = c.base;
      let w = c.new;
      let repo;
      if (c.field === "added") {
        const eq = t1 && canon(t1) === wfVal(c.new.value);
        dir = !t1 ? "PULL" : eq ? "CONVERGED" : "CONFLICT";
        Object.assign(edit, { op: "add-token", new: css(c.new.value), type: c.new.type });
        w = `${c.new.type} ${JSON.stringify(c.new.value)}`;
        if (dir === "CONFLICT") repo = t1.value;
        notes.push("add the token in its section of tokens.css and a row in tokens.md");
        edit.variableId = c.id;
        if (dir === "PULL" && ["Color", "Size"].includes(c.new.type) && /^[a-z0-9-]+$/.test(tn) && typeof css(c.new.value) === "string") mode = "auto";
        if (!/-/.test(tn) || tn !== name) notes.push(`Webflow name ${JSON.stringify(name)} is spelled --${tn} in the repo`);
      } else if (c.field === "removed") {
        dir = !t1 ? "CONVERGED" : canon(t1) === canon(t0) ? "PULL" : "CONFLICT";
        Object.assign(edit, { op: "remove-token", old: t1?.value ?? null });
        b = `${c.base.type} ${JSON.stringify(c.base.value)}`;
        if (t1) notes.push("check that nothing in src/ still uses it");
      } else if (c.field === "value") {
        dir = direction(true, canon(t0) !== canon(t1), canon(t1) === wfVal(c.new));
        Object.assign(edit, { op: "set-token", old: t1?.value ?? null, new: css(c.new) });
        if (dir === "CONFLICT") repo = t1?.value ?? "(not in tokens.css)";
        mode = t1 && ["Color", "Size"].includes(type) && !/var\(/.test(t1.value) ? "auto" : "assisted";
        b = JSON.stringify(c.base);
        w = JSON.stringify(c.new);
        if (!t1) notes.push("token not in tokens.css");
      } else if (c.field === "name") {
        const oldT = tokens.r1.get(tokenName(c.base));
        const newT = tokens.r1.get(tn);
        dir = newT && !oldT ? "CONVERGED" : "PULL";
        Object.assign(edit, { op: "rename-token", old: `--${tokenName(c.base)}`, new: `--${tn}`, line: (oldT ?? newT)?.line ?? null });
        notes.push("rename every `var(--old)` in src/ too");
      } else {
        dir = "PULL";
        Object.assign(edit, { op: `set-${c.field}`, old: c.base, new: c.new });
      }
      this.add({ key, area: "Variables", sub: c.field, where: name, element: c.field === "value" ? type : c.field, base: b, webflow: w, repo, direction: dir, mode, edit, notes, change: c });
    }
  }

  tokensRepoAhead() {
    const { tokens, nw, webflowVarNames } = this.ctx;
    const wfByToken = new Map(Object.entries(nw.variables).map(([n, v]) => [tokenName(n), { name: n, ...v }]));
    for (const tn of [...new Set([...tokens.r0.keys(), ...tokens.r1.keys()])].sort()) {
      const t0 = tokens.r0.get(tn);
      const t1 = tokens.r1.get(tn);
      const wf = wfByToken.get(tn);
      const canon = (t) => (t ? canonToken(wf?.type, t.value) : null);
      if (canon(t0) === canon(t1)) continue;
      if (webflowVarNames.has(tn)) continue;
      if (wf && canon(t1) === canonToken(wf.type, wf.value)) continue;
      this.add({ key: `repo|variable|${tn}`, area: "Variables", sub: "value", where: wf?.name ?? tn, element: wf ? wf.type : "token", base: wf ? JSON.stringify(wf.value) : null, webflow: wf ? JSON.stringify(wf.value) : null, repo: t1?.value ?? "(removed)", repoBase: t0?.value ?? null, direction: "REPO AHEAD", mode: "assisted", edit: null, notes: [wf ? "" : "no such variable on Webflow: push at the next sync"].filter(Boolean) });
    }
  }

  // ---- Components ------------------------------------------------------------------------------
  compFile(name) {
    return componentFile(String(name).replace(/[^A-Za-z0-9]/g, ""));
  }

  registryLine(group, name) {
    const lines = readNow("docs/webflow/components.md")?.split("\n") ?? [];
    const i = lines.findIndex((l) => l.includes(`${group} / ${name}`));
    return i >= 0 ? `docs/webflow/components.md:${i + 1}` : null;
  }

  components(changes) {
    const { commit, base, nw } = this.ctx;
    for (const c of changes) {
      const slug = c.where.slice("component:".length);
      const comp = nw.components[slug] ?? base.components[slug];
      const name = (nw.components[slug] ?? base.components[slug])?.name;
      const baseName = base.components[slug]?.name ?? name;
      const file = this.compFile(name);
      const oldFile = this.compFile(baseName);
      const reg = this.registryLine(comp?.group ?? "UI", name);
      const key = `component|${c.where}|${c.field}`;
      const notes = [];
      const textNow = file ? readNow(file) ?? "" : "";
      const textThen = oldFile ? showFile(commit, oldFile) ?? "" : "";
      const has = (text, ident) => !!ident && new RegExp(`\\b${esc(ident)}\\b`).test(text);
      const camel = (s) => (/^[A-Z0-9]+$/.test(s) ? String(s).toLowerCase() : String(s).replace(/\s+(.)/g, (_, ch) => ch.toUpperCase()).replace(/^./, (ch) => ch.toLowerCase()));
      let dir;
      let b = c.base;
      let w = c.new;
      let repo;
      let element = c.field;
      let edit = { op: `set-${c.field}`, file, registry: reg, old: c.base, new: c.new };
      if (c.field === "added") {
        dir = file ? "CONVERGED" : "PULL";
        w = `${c.new.group} / ${c.new.name} (${c.new.props?.length ?? 0} props, ${c.new.variants?.length ?? 0} variants, ${c.elements} elements)`;
        edit = { op: "add-component", file: file ?? `src/components/${(c.new.group ?? "ui").toLowerCase()}/${name.replace(/\s+/g, "")}.tsx`, registry: reg, new: c.new };
        element = "new component";
      } else if (c.field === "removed") {
        dir = file ? "PULL" : "CONVERGED";
        b = `${c.base.group} / ${c.base.name}`;
        edit = { op: "remove-component", file: oldFile, registry: reg };
        element = "component removed";
      } else if (c.field === "name") {
        dir = file && !oldFile ? "CONVERGED" : file && oldFile && file !== oldFile ? "CONFLICT" : "PULL";
        edit = { op: "rename-component", file: oldFile, registry: reg, old: c.base, new: c.new };
        notes.push("rename the file, its export, its imports and the classes that carry the name");
      } else if (/^props\[[^\]]+\]$/.test(c.field)) {
        const prop = c.new ?? c.base;
        const id = camel(prop.name);
        element = c.new ? "prop added" : "prop removed";
        const nowHas = has(textNow, id);
        dir = c.new ? (nowHas ? "CONVERGED" : "PULL") : nowHas ? "PULL" : "CONVERGED";
        b = c.base ? `${c.base.name} (${c.base.type})` : null;
        w = c.new ? `${c.new.name} (${c.new.type})` : null;
        edit = { op: c.new ? "add-prop" : "remove-prop", file, registry: reg, prop: prop.name, repoProp: id };
        if (!file) notes.push("no component file found by name");
      } else if (/^props\[[^\]]+\]\.name$/.test(c.field)) {
        element = "prop renamed";
        const nowNew = has(textNow, camel(c.new));
        const nowOld = has(textNow, camel(c.base));
        dir = nowNew && !nowOld ? "CONVERGED" : nowOld ? "PULL" : "CONFLICT";
        edit = { op: "rename-prop", file, registry: reg, old: c.base, new: c.new, repoOld: camel(c.base), repoNew: camel(c.new) };
        notes.push("rename the prop at every call site too");
      } else {
        // Other prop keys, variants, description, variant styles: compared where the repo shows the value, else by file change.
        const touched = file && textNow !== textThen;
        const def = /^props\[([^\]]+)\]\.default$/.exec(c.field);
        if (c.field === "description") {
          const snippet = String(c.new ?? "").slice(0, 50);
          const reg0 = (readNow("docs/webflow/components.md") ?? "").includes(snippet);
          // What Webflow dropped from the description (the base ends with the new text plus a tail) is gone from the registry too.
          const tail = typeof c.base === "string" && typeof c.new === "string" && c.base.startsWith(c.new) ? c.base.slice(c.new.length).replace(/^[\s.]+/, "") : "";
          const tailGone = tail.length > 8 && !(readNow("docs/webflow/components.md") ?? "").includes(tail.slice(0, 40)) && (showFile(commit, "docs/webflow/components.md") ?? "").includes(tail.slice(0, 40));
          // The sync writes `<Group> / <Name>. Repo: <file>`; a description equal to that is derived from the repo file.
          const generic = file && comp ? `${comp.group} / ${comp.name}. Repo: ${file}` : null;
          const isGeneric = !!generic && c.new === generic;
          dir = (reg0 && snippet && !tail) || tailGone || isGeneric ? "CONVERGED" : touched ? "CONFLICT" : "PULL";
          if (tailGone) notes.push("the part Webflow dropped is gone from components.md too");
          if (isGeneric) notes.push("the description is the one derived from the component file (the sync pattern)");
        } else if (def) {
          // A text prop's default is the default parameter of the repo prop of the same name.
          const pr = (nw.components[slug] ?? base.components[slug])?.props?.find((p) => p.id === def[1]);
          const repoDefault = (text) => (pr ? new RegExp(`\\b${esc(camel(pr.name))}\\s*=\\s*"([^"]*)"`).exec(text)?.[1] : undefined);
          const rNow = repoDefault(textNow);
          const rThen = repoDefault(textThen);
          dir = rNow !== undefined && rNow === c.new ? "CONVERGED" : rNow !== undefined && rNow === rThen ? "PULL" : touched ? "CONFLICT" : "PULL";
          if (rNow !== undefined) {
            repo = rNow;
            notes.push(`the repo default of \`${camel(pr.name)}\` is ${JSON.stringify(rNow)}`);
          }
        } else dir = touched ? "CONFLICT" : "PULL";
        if (dir === "CONFLICT") notes.push("the component file changed in the repo since the base; this field was not compared: check by hand");
      }
      if (dir === "CONFLICT") repo ??= "(see notes)";
      this.add({ key, area: "Components", sub: c.field.replace(/\[[^\]]*\]/g, "[]"), where: c.where, element: element === c.field ? c.field : element, base: b, webflow: w, repo, direction: dir, mode: "assisted", edit, notes, change: c });
    }
  }

  // ---- Generic areas (pages, code, interactions, assets, site, cms) ---------------------------------
  /** Presence-based repo side for a scalar Webflow value: is the base / new string in the target files? */
  presence(targets, baseVal, newVal) {
    const { commit } = this.ctx;
    const text = (get) => targets.map((f) => get(f) ?? "").join("\n");
    const now = text(readNow);
    const then = text((f) => showFile(commit, f));
    const has = (t, v) => typeof v === "string" && v.length > 2 && t.includes(v);
    const known = has(then, baseVal) || has(now, baseVal);
    const repoChanged = has(then, baseVal) && !has(now, baseVal);
    const converged = typeof newVal === "string" ? has(now, newVal) && (!has(then, newVal) || repoChanged) : newVal === null && !has(now, baseVal);
    const newAlready = has(now, newVal) && !has(then, newVal);
    return { known, repoChanged: repoChanged || newAlready, converged: converged || newAlready, searchable: typeof baseVal === "string" || typeof newVal === "string" };
  }

  lineOf(files, str) {
    if (typeof str !== "string" || str.length < 3) return null;
    for (const f of files) {
      const lines = readNow(f)?.split("\n") ?? [];
      const i = lines.findIndex((l) => l.includes(str));
      if (i >= 0) return `${f}:${i + 1}`;
    }
    return null;
  }

  pageRows(changes) {
    const { base, nw } = this.ctx;
    const targets = ["docs/webflow/components.md", "docs/webflow/seo.md"];
    const codeFields = new Set(["head", "footer", "scripts"]);
    const groups = new Map();
    for (const c of changes) {
      const top = c.field.split(/[.[]/)[0];
      const k = `${c.where}|${["seo", "openGraph"].includes(top) ? c.field : top}`;
      groups.set(k, [...(groups.get(k) ?? []), c]);
    }
    for (const [gk, cs] of groups) {
      const c0 = cs[0];
      const top = c0.field.split(/[.[]/)[0];
      const slug = c0.where.slice("page:".length);
      const bp = base.pages[slug];
      const np = nw.pages[slug];
      if (codeFields.has(top)) {
        this.codeRow(c0.where, top, bp?.[top], np?.[top], c0.id);
        continue;
      }
      const key = `page|${gk}`;
      if (c0.field === "added" || c0.field === "removed") {
        const title = (c0.new ?? c0.base).title;
        const pageFile = allSourceFiles().find((f) => /^src\/pages\//.test(f) && path.basename(f).toLowerCase() === `${String(title).replace(/[^A-Za-z0-9]/g, "").toLowerCase()}page.tsx`);
        const dir = c0.field === "added" ? (pageFile ? "CONVERGED" : "PULL") : pageFile ? "PULL" : "CONVERGED";
        this.add({ key, area: "Pages", sub: c0.field, where: c0.where, element: `page ${JSON.stringify(title)}`, base: c0.base ? JSON.stringify(c0.base) : null, webflow: c0.new ? JSON.stringify(c0.new) : null, direction: dir, mode: "assisted", edit: { op: `${c0.field}-page`, file: pageFile ?? "src/pages/", registry: this.lineOf(["docs/webflow/components.md"], title) }, notes: [`${c0.elements ?? "?"} elements`], change: c0 });
        continue;
      }
      const valueOf = (p, field) => field.split(/\.|\[|\]/).filter(Boolean).reduce((o, k) => o?.[k], p);
      const b = valueOf(bp, c0.field);
      const n = valueOf(np, c0.field);
      const scalar = typeof b === "string" || typeof n === "string" || b === null || n === null || b === undefined || n === undefined;
      let dir = "PULL";
      let repo;
      const notes = [];
      let line = this.lineOf(targets, typeof b === "string" ? b : n);
      if (top === "jsonLd" || top === "jsonLdRaw") {
        const touched = ["src/content", "docs/webflow/custom-code", "scripts/build-x-schema-site.mjs", "scripts/build-x-schema-faq.mjs"].some((p) => (this.ctx.changedPaths(p).length ?? 0) > 0);
        dir = touched ? "CONFLICT" : "PULL";
        repo = touched ? "(see notes)" : undefined;
        notes.push("schema is generated from src/content and the x-schema build scripts: change the source, then regenerate", ...(touched ? ["a schema source changed in the repo since the base; not compared field by field"] : []));
        line = null;
      } else if (scalar && typeof b === "string") {
        const p = this.presence(targets, b, n);
        dir = direction(true, p.repoChanged, p.converged);
        if (!p.known) notes.push("the base value was not found in components.md / seo.md: locate by hand");
      } else notes.push("repo side not compared (not a text value)");
      if (dir === "CONFLICT") repo ??= "(repo value changed)";
      const show = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v ?? null);
      this.add({ key, area: "Pages", sub: c0.field, where: c0.where, element: c0.field, base: show(b), webflow: show(n), repo, direction: dir, mode: "assisted", edit: { op: "set-page-setting", field: c0.field, file: line?.split(":")[0] ?? "docs/webflow/components.md", line: line ? +line.split(":")[1] : null, old: show(b), new: show(n) }, notes, change: c0 });
    }
  }

  /** Custom code block (page head / footer / scripts, site code): which repo file generates it. */
  codeRow(where, field, b, n, id) {
    const { commit } = this.ctx;
    const text = (v) => (typeof v === "string" ? v : null);
    const hashOf = (v) => (v && typeof v === "object" && v.sha256 ? v.sha256 : text(v) ? sha256(text(v)) : null);
    const list = (get) => {
      const out = [];
      const names = (this.ctx.git(["ls-tree", "-r", "--name-only", commit, "--", "docs/webflow/custom-code"]) ?? "").split("\n").filter(Boolean);
      for (const f of names) out.push([f, get(f)]);
      return out;
    };
    const then = list((f) => showFile(commit, f));
    const baseHash = hashOf(b);
    const newHash = hashOf(n);
    const match = then.find(([, t]) => t != null && (sha256(t) === baseHash || sha256(t.trim()) === baseHash || (text(b) && t.includes(text(b).trim()))));
    const notes = ["custom code is generated from its source: change the source, run the build script, then push"];
    let repo;
    let dir = "PULL";
    let edit = { op: "set-custom-code", field, file: null, builder: null, old: baseHash, new: newHash };
    const builder = (text(b) ?? text(n) ?? "").match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] ?? (match ? (match[1] ?? "").match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] : null);
    const source = (text(b) ?? text(n) ?? "").match(/from (src\/[^\s:]+)/)?.[1] ?? null;
    if (match) {
      const nowText = readNow(match[0]);
      const changed = nowText !== match[1];
      const eq = nowText != null && (sha256(nowText) === newHash || sha256(nowText.trim()) === newHash || (text(n) && nowText.includes(text(n).trim())));
      dir = direction(true, changed, eq);
      edit = { ...edit, file: match[0], builder: builder ?? (match[1].match(/scripts\/build-x-[a-z-]+\.mjs/)?.[0] ?? null), source };
      if (dir === "CONFLICT") repo = "(the repo copy of this block changed too)";
    } else {
      this.footer.unlocated.push(`${where} ${field}`);
      edit = { ...edit, builder, source };
      notes.push("no file in docs/webflow/custom-code matches the base code: find its source by hand");
    }
    const show = (v) => (v == null ? null : typeof v === "string" ? (v.length > 80 ? `${v.slice(0, 80)}… (${v.length} chars)` : v) : `${v.length} chars, sha256 ${v.sha256.slice(0, 8)}`);
    this.add({ key: `code|${where}|${field}`, area: "Custom code", sub: field, where, element: field, base: show(b), webflow: show(n), repo, direction: dir, mode: "assisted", edit, notes, change: { area: "code", where, id, field } });
  }

  siteRows(changes) {
    for (const c of changes) {
      if (c.area === "site" && /^(code|siteScripts|registeredScripts)/.test(c.field)) {
        this.codeRow("site", c.field.split(/[.[]/)[0], c.base, c.new, null);
        continue;
      }
      if (c.area === "cms" && c.field === "fields" && c.base === null) {
        this.footer.signals.push("CMS field schemas: the base dump had none (manifest gap), the new dump has them; not a Webflow edit");
        continue;
      }
      const show = (v) => (v && typeof v === "object" ? JSON.stringify(v) : v ?? null);
      const targets = c.area === "cms" ? ["docs/webflow/cms.md"] : ["docs/webflow/components.md", "docs/webflow/seo.md", "docs/webflow/interactions.md"];
      let dir = "PULL";
      const notes = [];
      if (typeof c.base === "string") {
        const p = this.presence(targets, c.base, c.new);
        dir = direction(true, p.repoChanged, p.converged);
        if (!p.known) notes.push(`base value not found in ${targets.join(", ")}`);
      } else notes.push("repo side not compared");
      this.add({ key: `${c.area}|${c.field}`, area: "Site and CMS", sub: c.area, where: c.area, element: c.field, base: show(c.base), webflow: show(c.new), direction: dir, mode: "assisted", edit: { op: `set-${c.area}`, file: targets[0], line: null, field: c.field }, notes, change: c });
    }
  }

  interactions(changes) {
    const { commit } = this.ctx;
    const by = new Map();
    for (const c of changes) by.set(c.where, [...(by.get(c.where) ?? []), c]);
    const reg = (src) => src?.split("\n") ?? [];
    for (const [name, cs] of by) {
      const whole = cs.find((c) => c.field === "added" || c.field === "removed");
      const fields = cs.map((c) => c.field).filter((f) => f !== "added" && f !== "removed");
      if (!whole && fields.every((f) => f === "version")) {
        this.footer.versionOnly.push(name);
        continue;
      }
      const row = (src) => reg(src).find((l) => l.includes(`\`${name}\``) || l.includes(name)) ?? null;
      const then = row(showFile(commit, "docs/webflow/interactions.md"));
      const nowText = readNow("docs/webflow/interactions.md");
      const now = row(nowText);
      const lineNo = nowText ? nowText.split("\n").findIndex((l) => l === now) + 1 : 0;
      let dir;
      if (whole?.field === "added") dir = now ? "CONVERGED" : "PULL";
      else if (whole?.field === "removed") dir = now ? "PULL" : "CONVERGED";
      else dir = then !== now ? "CONFLICT" : "PULL";
      const real = fields.filter((f) => f !== "version");
      this.add({ key: `interaction|${name}`, area: "Interactions", sub: whole?.field ?? real.join(","), where: name, element: whole ? `interaction ${whole.field}` : real.join(", "), base: whole?.base ? "(present)" : whole ? null : `version ${cs.find((c) => c.field === "version")?.base ?? "?"}`, webflow: whole?.new ? "(present)" : whole ? null : `version ${cs.find((c) => c.field === "version")?.new ?? "?"}`, repo: dir === "CONFLICT" ? "(registry row changed)" : undefined, direction: dir, mode: "assisted", edit: { op: whole ? `${whole.field}-interaction` : "set-interaction", file: "docs/webflow/interactions.md", line: lineNo || null, also: "src/ix/", fields: real, interactionId: cs[0].id }, notes: ["registry row and the preview runtime (src/ix) need the same change; the repo side compares the registry row only"], change: cs[0] });
    }
  }

  assets(changes) {
    const { commit } = this.ctx;
    const idsThen = showFile(commit, "docs/webflow/webflow-ids.json") ?? "";
    const idsNow = readNow("docs/webflow/webflow-ids.json") ?? "";
    for (const c of changes) {
      const key = `asset|${c.id}|${c.field}`;
      const notes = [];
      let dir = "PULL";
      let b = c.base;
      let w = c.new;
      if (c.field === "added") {
        dir = idsNow.includes(c.id) && !idsThen.includes(c.id) ? "CONVERGED" : "PULL";
        w = `${c.new.contentType ?? ""} ${c.new.displayName}`.trim();
        notes.push("download the file to public/assets/ on approval and add its id to webflow-ids.json");
      } else if (c.field === "removed") {
        dir = idsNow.includes(c.id) ? "PULL" : "CONVERGED";
        b = c.base.displayName;
      } else if (c.field === "altText") {
        const p = this.presence(["docs/webflow/alt-review.md"].concat(allSourceFiles().filter((f) => f.startsWith("src/"))), c.base, c.new);
        dir = p.known || p.converged ? direction(true, p.repoChanged, p.converged) : "PULL";
        if (!p.known) notes.push("old alt text not found in src/: locate the image by name");
      }
      this.add({ key, area: "Assets", sub: c.field, where: c.where, element: c.field, base: typeof b === "object" ? JSON.stringify(b) : b, webflow: typeof w === "object" ? JSON.stringify(w) : w, direction: dir, mode: "assisted", edit: { op: `asset-${c.field}`, file: "docs/webflow/webflow-ids.json", assetId: c.id, name: c.where }, notes, change: c });
    }
  }

  // ---- Repo-only changes: components, pages, interactions, custom code ---------------------------------
  aheadRow(row) {
    this.add({ notes: ["push at the next sync"], mode: "assisted", direction: "REPO AHEAD", base: null, webflow: null, repoBase: null, edit: null, ...row });
  }

  componentsRepoAhead() {
    const { commit, base, nw, changes } = this.ctx;
    const camel = (s) => (/^[A-Z0-9]+$/.test(s) ? String(s).toLowerCase() : String(s).replace(/\s+(.)/g, (_, ch) => ch.toUpperCase()).replace(/^./, (ch) => ch.toLowerCase()));
    for (const { status, file } of changedStatus(commit, ["src/components", "src/sections"])) {
      if (!/\.tsx$/.test(file)) continue;
      const stem = path.basename(file, ".tsx");
      const find = (snap) => Object.entries(snap.components).find(([, c]) => normName(c.name) === normName(stem));
      const wfBase = find(base);
      const wfNew = find(nw);
      const slug = (wfNew ?? wfBase)?.[0] ?? stem.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      const where = `component:${slug}`;
      if (!wfBase && !wfNew) {
        if (status === "A" && file.startsWith("src/components/")) this.aheadRow({ key: `repo|component|${file}|added`, area: "Components", sub: "added", where, element: "component file added", repo: file, edit: { op: "add-component", file }, notes: ["not on Webflow yet: create it at the next sync"] });
        continue;
      }
      if (status === "D") {
        this.aheadRow({ key: `repo|component|${file}|removed`, area: "Components", sub: "removed", where, element: "component file removed", repoBase: file, repo: "(removed)", edit: { op: "remove-component", file } });
        continue;
      }
      if (status !== "M") continue;
      const before = componentSurface(showFile(commit, file));
      const after = componentSurface(readNow(file));
      const wfTouched = new Set(changes.filter((c) => c.area === "component" && c.where === where && /^props\[/.test(c.field)).flatMap((c) => [c.base?.name, c.new?.name, c.field.endsWith(".name") ? c.base : null, c.field.endsWith(".name") ? c.new : null].filter(Boolean).map(camel)));
      // Webflow's component only has some of the repo's props (CMS-bound or layout props never became Webflow props).
      const wfProps = new Set(((wfNew ?? wfBase)[1].props ?? []).map((p) => camel(p.name)));
      const emit = (sub, name, repoBase, repo) => {
        if (wfTouched.has(name)) return;
        const prop = name.split("=")[0];
        if (sub === "prop removed" && !wfProps.has(prop)) return;
        if (sub === "prop added" && wfProps.has(prop)) return;
        this.aheadRow({ key: `repo|component|${file}|${sub}|${name}`, area: "Components", sub, where, element: `${sub}: ${name}`, repoBase, repo, edit: { op: sub.startsWith("variant") ? "set-variant" : sub === "prop removed" ? "remove-prop" : "add-prop", file, prop: name } });
      };
      for (const [name, p] of after) if (!before.has(name)) emit("prop added", name, null, `${name}: ${p.type}`);
      for (const [name, p] of before) if (!after.has(name)) emit("prop removed", name, `${name}: ${p.type}`, "(removed)");
      for (const [name, a] of after) {
        const b = before.get(name);
        if (!b?.values || !a.values) continue;
        for (const v of a.values) if (!b.values.has(v)) emit("variant added", `${name}=${v}`, `${name}: ${[...b.values].join(" | ")}`, `${name}: ${[...a.values].join(" | ")}`);
        for (const v of b.values) if (!a.values.has(v)) emit("variant removed", `${name}=${v}`, `${name}: ${[...b.values].join(" | ")}`, `${name}: ${[...a.values].join(" | ")}`);
      }
    }
  }

  pagesRepoAhead() {
    const { commit } = this.ctx;
    const done = new Set();
    for (const [slug, [file]] of Object.entries(repoPages())) {
      if (done.has(file)) continue;
      done.add(file);
      const before = showFile(commit, file);
      const after = readNow(file);
      if (before === after || before == null || after == null) continue;
      const d = sequenceDiff(pageSequence(before), pageSequence(after));
      const where = `page:${slug}`;
      for (const [sub, list] of [["section added", d.added], ["section removed", d.removed], ["section reordered", d.moved]]) {
        for (const name of list) this.aheadRow({ key: `repo|page|${slug}|${sub}|${name}`, area: "Pages", sub, where, element: `${sub}: ${name}`, repo: name, repoBase: null, edit: { op: sub.replace(" ", "-"), file, section: name } });
      }
    }
  }

  interactionsRepoAhead() {
    const { commit, nw, base, changes } = this.ctx;
    const before = registryRows(showFile(commit, "docs/webflow/interactions.md"));
    const after = registryRows(readNow("docs/webflow/interactions.md"));
    const wfSide = new Set(changes.filter((c) => c.area === "interaction").map((c) => c.where));
    for (const name of [...new Set([...before.keys(), ...after.keys()])].sort()) {
      const b = before.get(name);
      const a = after.get(name);
      if (b?.text === a?.text || wfSide.has(name)) continue;
      const sub = !b ? "added" : !a ? "removed" : "changed";
      this.aheadRow({ key: `repo|interaction|${name}`, area: "Interactions", sub, where: name, element: `registry row ${sub}`, repo: sub === "removed" ? "(removed)" : `${name} (registry row)`, repoBase: b ? `${name} (registry row)` : null, edit: { op: "set-interaction", file: "docs/webflow/interactions.md", line: a?.line ?? null }, notes: [nw.interactions[name] || base.interactions[name] ? "push at the next sync (the interaction exists on Webflow)" : "not on Webflow yet: create it at the next sync"] });
    }
    for (const { status, file } of changedStatus(commit, ["src/ix"])) {
      if (/^src\/ix\/x[A-Z]\w*\.ts$/.test(file)) continue; // shipped scripts: custom code
      this.aheadRow({ key: `repo|ix|${file}`, area: "Interactions", sub: "runtime", where: file, element: "preview runtime", repo: status === "A" ? "(added)" : status === "D" ? "(removed)" : "changed", edit: { op: "set-interaction-runtime", file }, notes: ["the local preview only; the Webflow interaction follows the registry row"] });
    }
  }

  codeRepoAhead() {
    const { commit } = this.ctx;
    const isCode = (f) => /^docs\/webflow\/custom-code\//.test(f) || /^scripts\/build-x-[a-z-]+\.mjs$/.test(f) || /^src\/ix\/x[A-Z]\w*\.ts$/.test(f) || /^src\/styles\/exceptions\//.test(f);
    for (const { status, file } of changedStatus(commit, ["docs/webflow/custom-code", "scripts", "src/ix", "src/styles/exceptions"]).filter((f) => isCode(f.file))) {
      this.aheadRow({ key: `repo|code|${file}`, area: "Custom code", sub: "source", where: file, element: path.basename(file), repo: status === "A" ? "(added)" : status === "D" ? "(removed)" : "changed", edit: { op: "set-custom-code", file }, notes: ["rebuild with its build script, then push the code at the next sync"] });
    }
  }

  // ---- Assembly --------------------------------------------------------------------------------
  /** Sorts the rows and numbers them (stable for the same inputs). */
  finish() {
    const rank = (r) => AREA_ORDER.indexOf(r.area);
    const dirRank = { PULL: 0, CONFLICT: 0, CONVERGED: 1, "REPO AHEAD": 2 };
    this.rows.sort((a, b) => dirRank[a.direction] - dirRank[b.direction] || rank(a) - rank(b) || (a.where < b.where ? -1 : a.where > b.where ? 1 : 0) || a.order - b.order);
    this.rows.forEach((r, i) => {
      r.n = i + 1;
      if (r.direction === "CONVERGED" || r.direction === "REPO AHEAD") r.mode = "—";
      delete r.order;
      if (r.change) r.ref = Object.fromEntries(["area", "where", "id", "field", "bp", "pseudo"].filter((k) => r.change[k] !== undefined && r.change[k] !== null).map((k) => [k, r.change[k]]));
      delete r.change;
    });
    return this.rows;
  }
}

export { AREA_ORDER, flatKey, parseTokens };
