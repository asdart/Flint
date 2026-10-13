// Applies approved report rows to the repo (scripts/webflow-reconcile-apply.mjs is the CLI). A row is edited
// only when the report marked it `auto`, it is a PULL, and its guard holds (the old value is still at the
// recorded place). Everything else becomes a task for the agent with the exact place and what to do; nothing is
// edited for it. Generated files are never touched: the task says which source and which generator to use.
import fs from "node:fs";
import path from "node:path";
import {
  Workspace,
  addDeclaration,
  addRules,
  addToken,
  cssFromWebflow,
  normCssValue,
  removeDeclaration,
  replaceClass,
  replaceInLine,
  replaceText,
  setDeclaration,
  setToken,
  setTokenDoc,
} from "./edit-ops.mjs";
import { WEBFLOW_DEFAULTS } from "./repo-state.mjs";

const GENERATED = [/(^|\/)utilities\.css$/, /^docs\/webflow\/custom-code\//];
const isGenerated = (f) => !!f && GENERATED.some((re) => re.test(f));
const at = (e) => (e?.file ? `${e.file}${e.line ? `:${e.line}` : ""}` : "(no location in the map)");
const show = (v, n = 90) => {
  if (v === null || v === undefined) return "(none)";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return JSON.stringify(s.length > n ? `${s.slice(0, n)}…` : s);
};
const fail = (reason) => ({ ok: false, reason });
const done = (files, extra = {}) => ({ ok: true, files, ...extra });

// ---- handlers: (row, ctx) -> { ok, files, followUps?, warnings?, post? } | { ok: false, reason } ---------------

/** Replaces a text on the recorded line, or on the one line of the file that holds it (another row moved it). */
function textAt(ctx, file, line, old, neu, opts = {}) {
  const text = ctx.ws.read(file);
  if (text == null) return fail(`${file} does not exist`);
  const json = file.endsWith(".json");
  let r = replaceText(text, line, old, neu, { ...opts, json });
  if (r.ok) return { ok: true, text: r.value };
  const lines = text.split("\n");
  const hits = [];
  lines.forEach((l, i) => {
    const t = replaceInLine(l, old, neu, { ...opts, json });
    if (t.ok) hits.push({ i, line: t.value });
  });
  if (hits.length === 1) {
    lines[hits[0].i] = hits[0].line;
    return { ok: true, text: lines.join("\n"), note: `found at line ${hits[0].i + 1}, not ${line}` };
  }
  return fail(r.reason);
}

const HANDLERS = {
  "replace-text"(row, ctx) {
    const e = row.edit;
    if (typeof e.old !== "string" || typeof e.new !== "string") return fail("not a text value");
    if (e.of) return fail(`${e.of} places hold this string: say which one`);
    const r = textAt(ctx, e.file, e.line, e.old, e.new);
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.text);
    return done([e.file], { note: r.note });
  },

  "change-classes"(row, ctx) {
    const e = row.edit;
    if (e.remove?.length !== 1 || e.add?.length !== 1) return fail("more than one class changes");
    const text = ctx.ws.read(e.file);
    if (text == null) return fail(`${e.file} does not exist`);
    const r = replaceClass(text, e.line, e.remove[0], e.add[0]);
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.value);
    return done([e.file]);
  },

  "set-prop"(row, ctx) {
    const e = row.edit;
    if (typeof e.old !== "string" || typeof e.new !== "string") return fail("only text props are changed mechanically");
    if (!["attr", "literal", "data"].includes(e.locate)) return fail(`the prop is written as \`${e.locate}\``);
    let r = null;
    if (e.locate === "attr" && e.repoProp) {
      for (const d of [0, 1, 2, 3, -1, -2, -3]) {
        r = textAt(ctx, e.file, e.line + d, e.old, e.new, { attr: e.repoProp });
        if (r.ok) break;
      }
    } else r = textAt(ctx, e.file, e.line, e.old, e.new);
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.text);
    return done([e.file], { note: r.note });
  },

  "set-attr"(row, ctx) {
    const e = row.edit;
    const field = row.edit.op.replace(/^set-/, "");
    const attr = field.startsWith("attr.") ? field.slice(5) : field === "settings.altText" ? "alt" : null;
    if (!attr || typeof e.old !== "string" || typeof e.new !== "string") return fail("not a text attribute");
    let r = null;
    for (const d of [0, 1, 2, 3, -1, -2, -3]) {
      r = textAt(ctx, e.file, e.line + d, e.old, e.new, { attr });
      if (r.ok) break;
    }
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.text);
    return done([e.file], { note: r.note });
  },

  "set-declaration"(row, ctx) {
    const e = row.edit;
    if (isGenerated(e.file)) return fail("generated file");
    const text = ctx.ws.read(e.file);
    if (text == null) return fail(`${e.file} does not exist`);
    const neu = cssFromWebflow(e.new);
    const r = setDeclaration(text, { line: e.line, decl: e.decl, old: e.old, neu });
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.value);
    return done([e.file], { warnings: rawSizeWarning(row, neu) });
  },

  "remove-declaration"(row, ctx) {
    const e = row.edit;
    if (isGenerated(e.file)) return fail("generated file");
    const text = ctx.ws.read(e.file);
    if (text == null) return fail(`${e.file} does not exist`);
    const r = removeDeclaration(text, { line: e.line, decl: e.decl, old: e.old });
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.value);
    return done([e.file], { followUps: r.followUp ? [r.followUp] : [] });
  },

  "add-declaration"(row, ctx) {
    const e = row.edit;
    if (isGenerated(e.file)) return fail("generated file");
    const text = ctx.ws.read(e.file);
    if (text == null) return fail(`${e.file} does not exist`);
    const neu = cssFromWebflow(e.new);
    const r = addDeclaration(text, { line: e.line, selector: row.where, decl: e.decl, neu });
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.value);
    return done([e.file], { warnings: rawSizeWarning(row, neu) });
  },

  "add-rule"(row, ctx) {
    const e = row.edit;
    if (!e.file || isGenerated(e.file)) return fail("no CSS file of its own for this class family");
    const text = ctx.ws.read(e.file);
    if (text == null) return fail(`${e.file} does not exist`);
    const props = e.properties ?? [{ bp: e.bp, pseudo: e.pseudo, prop: e.decl, value: e.new }];
    // Guard: the class must still have no rule of its own (the whole-style add) or no rule for this state.
    for (const rel of ctx.styleFiles()) {
      const t = ctx.ws.read(rel) ?? "";
      const re = e.properties ? new RegExp(`(^|\\n)\\s*${escRe(e.selector)}(?![a-z0-9-])\\s*[{,:]`) : new RegExp(`(^|\\n)\\s*${escRe(e.selector)}${e.pseudo && e.pseudo !== "noPseudo" ? `:{1,2}${escRe(e.pseudo)}` : ""}\\s*[{,]`);
      if ((e.properties || e.bp === "main") && re.test(t)) return fail(`${rel} has a rule for ${e.selector}${e.properties ? "" : ` (${e.pseudo})`} now`);
    }
    const r = addRules(text, { selector: e.selector, properties: props.map((p) => ({ ...p, value: cssFromWebflow(p.value) })), skip: (p) => WEBFLOW_DEFAULTS[p.prop] !== undefined && normCssValue(p.value) === WEBFLOW_DEFAULTS[p.prop] });
    if (!r.ok) return r;
    ctx.ws.write(e.file, r.value);
    const followUps = e.properties ? [`register \`${e.selector}\` in docs/webflow/classes.md (rule 1: a class is listed before it is used) and say which component or section uses it`] : [];
    return done([e.file], { followUps, warnings: props.flatMap((p) => rawSizeWarning(row, cssFromWebflow(p.value), p.prop)) });
  },

  "set-token"(row, ctx) {
    const e = row.edit;
    const name = e.token.replace(/^--/, "");
    const css = ctx.ws.read("src/styles/tokens.css");
    if (css == null) return fail("src/styles/tokens.css does not exist");
    const r = setToken(css, { name, old: e.old, neu: e.new });
    if (!r.ok) return r;
    ctx.ws.write("src/styles/tokens.css", r.value);
    const md = ctx.ws.read("docs/webflow/tokens.md");
    const d = md == null ? fail("docs/webflow/tokens.md does not exist") : setTokenDoc(md, { name, old: e.old, neu: e.new });
    const files = ["src/styles/tokens.css"];
    const followUps = [];
    if (d.ok) {
      ctx.ws.write("docs/webflow/tokens.md", d.value);
      files.push("docs/webflow/tokens.md");
    } else followUps.push(`update the \`${name}\` row of docs/webflow/tokens.md to ${e.new} (${d.reason})`);
    return done(files, { followUps });
  },

  "add-token"(row, ctx) {
    const e = row.edit;
    const name = e.token.replace(/^--/, "");
    if (typeof e.new !== "string") return fail("no plain value");
    const css = ctx.ws.read("src/styles/tokens.css");
    if (css == null) return fail("src/styles/tokens.css does not exist");
    const r = addToken(css, { name, neu: e.new });
    if (!r.ok) return r;
    ctx.ws.write("src/styles/tokens.css", r.value);
    const files = ["src/styles/tokens.css"];
    const followUps = [`add a \`${name}\` row (${e.new}, what it is for) to docs/webflow/tokens.md (rule 1: a token is listed before it is used)`];
    // The Webflow variable already exists: record its id where the sync reads it.
    const ids = ctx.ws.read("docs/webflow/webflow-ids.json");
    const id = e.variableId ?? row.ref?.id;
    const ins = ids && id ? addVariableId(ids, row.where, id) : null;
    if (ins) {
      ctx.ws.write("docs/webflow/webflow-ids.json", ins);
      files.push("docs/webflow/webflow-ids.json");
    } else followUps.push(`add "${row.where}": "${id}" to the variables of docs/webflow/webflow-ids.json`);
    // utilities.css and the utilities table of classes.md are generated from tokens.css: the CLI runs the generator after writing.
    const post = name.startsWith("space-") ? ["node scripts/gen-utilities.mjs"] : [];
    return done(files, { followUps, post, note: post.length ? "node scripts/gen-utilities.mjs runs after the write (review its diff)" : null });
  },
};

const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

function addVariableId(text, name, id) {
  if (text.includes(`"${name}":`)) return null;
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^\s*"variables"\s*:\s*\{\s*$/.test(l));
  if (start < 0) return null;
  const indent = /^\s*/.exec(lines[start])[0];
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (new RegExp(`^${indent}\\}`).test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end < 0 || end === start + 1) return null;
  lines[end - 1] = lines[end - 1].replace(/,?\s*$/, ",");
  lines.splice(end, 0, `${indent}  "${name}": "${id}"`);
  return lines.join("\n");
}

function rawSizeWarning(row, value, prop = null) {
  if (!/^-?\d+(\.\d+)?px$/.test(String(value)) && !/^#[0-9a-f]{3,8}$/i.test(String(value))) return [];
  return [`#${row.n} ${row.where} ${prop ?? row.edit.decl ?? ""}: ${value} is a raw ${String(value).startsWith("#") ? "color" : "size"}; rule 2 allows it only when it is local to this block and no token matches`];
}

// ---- what the agent has to do, per op ----------------------------------------------------------------------

const DO = {
  "replace-text": (e) => `replace the text at ${at(e)}: ${show(e.old)} → ${show(e.new)}${e.of ? ` (${e.of} places hold this string; the map picked occurrence ${e.occ}${e.alts?.length ? `, others: ${e.alts.join(", ")}` : ""})` : ""}${e.locate === "manual" ? ". Not found as a literal: the text is built from parts or bound; find where it is written" : ""}`,
  "change-classes": (e) => `change the classes at ${at(e)}: ${e.remove?.length ? `remove ${e.remove.join(" ")}` : ""}${e.remove?.length && e.add?.length ? ", " : ""}${e.add?.length ? `add ${e.add.join(" ")}` : ""}. A class that is not registered in docs/webflow/classes.md needs its registry row first (rule 1)`,
  "set-prop": (e) => `set the prop \`${e.repoProp ?? e.prop}\` of <${e.comp}> at ${at(e)}: ${show(e.old)} → ${show(e.new)}${e.locate === "default" ? ". The repo does not pass it: this changes the component default and so every instance that relies on it" : ""}`,
  "set-declaration": (e) => `${isGenerated(e.file) ? "do NOT edit the generated file; change the token or scripts/gen-utilities.mjs and run node scripts/gen-utilities.mjs. " : ""}set \`${e.decl}\` at ${at(e)}: ${show(e.old)} → ${show(e.new)}`,
  "remove-declaration": (e) => `remove \`${e.decl}\` at ${at(e)} (was ${show(e.old)})`,
  "add-declaration": (e) => `add \`${e.decl}: ${e.new}\` to the rule at ${at(e)}`,
  "add-rule": (e) => `add the rule for \`${e.selector}\` to ${e.file ?? "the CSS file of its family (none found: classes.md says where it belongs)"}: ${(e.properties ?? [{ prop: e.decl, value: e.new, bp: e.bp, pseudo: e.pseudo }]).slice(0, 8).map((p) => `${p.prop}: ${p.value}${p.bp && p.bp !== "main" ? ` [${p.bp}]` : ""}${p.pseudo && p.pseudo !== "noPseudo" ? ` [${p.pseudo}]` : ""}`).join("; ")}; then register the class in docs/webflow/classes.md`,
  "remove-rule": (e) => `remove the rule for \`${e.selector}\` (${e.file ?? "find it with grep"}) after checking that nothing in src/ still uses the class; update docs/webflow/classes.md`,
  "set-token": (e) => `set \`${e.token}\` in src/styles/tokens.css${e.line ? `:${e.line}` : ""}: ${show(e.old)} → ${show(e.new)}; update the row at ${e.tokensMd ?? "docs/webflow/tokens.md"}; node scripts/gen-utilities.mjs if utilities depend on it`,
  "add-token": (e) => `add \`${e.token}: ${e.new}\` to src/styles/tokens.css and a row to docs/webflow/tokens.md; node scripts/gen-utilities.mjs for a spacing token; record the variable id in docs/webflow/webflow-ids.json`,
  "remove-token": (e) => `remove \`${e.token}\` from src/styles/tokens.css and tokens.md after checking that nothing in src/ uses var(${e.token})`,
  "rename-token": (e) => `rename \`${e.old}\` to \`${e.new}\` in src/styles/tokens.css, in tokens.md and in every var() in src/; node scripts/gen-utilities.mjs`,
  "add-element": (e) => `insert the new element inside the nearest mapped ancestor (${at(e)}): ${JSON.stringify(e.element?.t ?? e.element)?.slice(0, 120)}. Build it as the contract says (semantic tags, registered classes)`,
  "remove-element": (e) => `remove the element at ${at(e)}`,
  "move-element": (e) => `move the element at ${at(e)} ${e.target?.position === "after" ? "after" : "to be the first child of"} ${e.target?.file ? `${e.target.file}:${e.target.line} ` : ""}(${e.target?.desc ?? "?"})`,
  restructure: (e) => `restructure under ${at(e)}:\n${(e.members ?? []).map((m) => `      ${m.direction === "CONVERGED" ? "(already done)" : "-"} ${m.change} ${m.element}${m.file ? ` ${m.file}:${m.line}` : ""}${m.target ? ` → after ${m.target.file}:${m.target.line}` : ""}`).join("\n")}`,
  "add-component": (e) => `create the component file ${e.file} for the new Webflow component and a row in docs/webflow/components.md (${e.registry ?? "registry"})`,
  "remove-component": (e) => `remove ${e.file ?? "the component file"} and its registry row (${e.registry ?? "components.md"}) after checking its users`,
  "rename-component": (e) => `rename ${e.file} (file, export, imports and the classes that carry the name) and the registry row: ${show(e.old)} → ${show(e.new)}`,
  "add-prop": (e) => `add the prop \`${e.repoProp ?? e.prop}\` to ${e.file ?? "the component file"} and its registry row (${e.registry ?? "components.md"})`,
  "remove-prop": (e) => `remove the prop \`${e.repoProp ?? e.prop}\` from ${e.file ?? "the component file"} and its call sites; update ${e.registry ?? "components.md"}`,
  "rename-prop": (e) => `rename the prop \`${e.repoOld}\` to \`${e.repoNew}\` in ${e.file ?? "the component file"} and at every call site; update ${e.registry ?? "components.md"}`,
  "set-custom-code": (e) => `custom code is generated: change its source${e.source ? ` (${e.source})` : ""}${e.file ? ` (${e.file} is the output: never edit it by hand)` : ""}, then run ${e.builder ? `node ${e.builder}` : "its scripts/build-x-*.mjs"}`,
  "set-page-setting": (e) => `change the page setting \`${e.field}\` in ${e.file ?? "docs/webflow/components.md"}${e.line ? `:${e.line}` : ""}: ${show(e.old)} → ${show(e.new)}${/jsonLd/.test(e.field ?? "") ? "; schema is generated from src/content and the x-schema build scripts: change the source and regenerate" : ""}`,
  "set-interaction": (e) => `update docs/webflow/interactions.md${e.line ? `:${e.line}` : ""} and the preview runtime in src/ix/ to match the interaction (${(e.fields ?? []).join(", ") || "added or removed"})`,
  "added-interaction": () => "add the interaction to docs/webflow/interactions.md and src/ix/",
  "removed-interaction": () => "remove the interaction row from docs/webflow/interactions.md and its src/ix/ code",
};

function describeEdit(row) {
  const e = row.edit;
  if (!e) return `edit by hand: ${row.element} ${show(row.base)} → ${show(row.webflow)}`;
  const f = DO[e.op];
  if (f) return f(e);
  if (/^set-(attr|settings)\./.test(e.op)) return `set ${e.op.slice(4)} at ${at(e)}: ${show(e.old)} → ${show(e.new)}`;
  return `${e.op.replace(/-/g, " ")} (${at(e)}): ${show(row.base)} → ${show(row.webflow)}`;
}

function reminders(row) {
  const out = [];
  const e = row.edit ?? {};
  if (isGenerated(e.file) || e.op === "set-custom-code") out.push("generated output: edit the source and rerun its generator (never the output)");
  if (row.area === "Styles" || row.area === "Variables") out.push("rule 2: tokens for system values; a raw px only if it is local to one block");
  if (row.area === "Components" || (row.area === "Elements" && /^(add|remove|restructure)/.test(e.op ?? ""))) out.push("rule 1: registries (components.md, classes.md) updated in the same change");
  return out;
}

function task(row, reason) {
  const e = row.edit;
  return {
    n: row.n,
    status: "task",
    key: row.key,
    area: row.area,
    where: row.where,
    element: row.element,
    direction: row.direction,
    reason,
    change: { base: row.base, webflow: row.webflow, repo: row.repo },
    do: describeEdit(row),
    file: e?.file ?? null,
    line: e?.line ?? null,
    notes: row.notes ?? [],
    reminders: reminders(row),
  };
}

// ---- the entry point ----------------------------------------------------------------------------------------

/**
 * Applies `rows` (report rows) to the files under `root`. Returns the per-row results and the workspace
 * (nothing is on disk until the caller flushes it).
 */
export function applyRows(rows, { root, alreadyDone = new Set() }) {
  const ws = new Workspace(root);
  const ctx = {
    ws,
    styleFiles: () => {
      const dir = path.join(root, "src/styles");
      const comps = fs.existsSync(path.join(dir, "components")) ? fs.readdirSync(path.join(dir, "components")).filter((f) => f.endsWith(".css")).map((f) => `src/styles/components/${f}`) : [];
      return [...["base.css", "layout.css", "typography.css"].map((f) => `src/styles/${f}`), ...comps].filter((f) => fs.existsSync(path.join(root, f)));
    },
  };
  // Edits that only change a line in place go first; those that add or remove lines last, bottom up, so a recorded line stays right.
  const shifts = (r) => /^(add-declaration|remove-declaration|add-rule|add-token)$/.test(r.edit?.op ?? "");
  const order = [...rows].sort((a, b) => Number(shifts(a)) - Number(shifts(b)) || (a.edit?.file ?? "").localeCompare(b.edit?.file ?? "") || (b.edit?.line ?? 0) - (a.edit?.line ?? 0));
  const results = new Map();
  for (const row of order) {
    const base = { n: row.n, key: row.key, area: row.area, where: row.where, element: row.element };
    let res;
    if (alreadyDone.has(row.key)) res = { ...base, status: "noop", note: "already applied and refreshed from this dump" };
    else if (row.direction === "REPO AHEAD") res = { ...base, status: "skipped", note: "repo ahead: nothing to apply, it is pushed at the next sync" };
    else if (row.direction === "CONVERGED") res = { ...base, status: "noop", note: "the repo already has this value" };
    else if (row.direction === "CONFLICT") res = task(row, "CONFLICT: both sides changed this. Ask the user which value wins; to take Webflow's, make the edit below by hand (the report shows the repo value)");
    else if (row.mode !== "auto") res = task(row, row.edit ? "not mechanical (the report marks it assisted)" : "no repo location: the element is not in the map");
    else if (row.notes?.some((n) => /^value equals token/.test(n))) res = task(row, `rule 2: ${row.notes.find((n) => /^value equals token/.test(n))} Ask the user, then write var(--token) or the raw value`);
    else {
      const op = row.edit?.op ?? "";
      const h = HANDLERS[op] ?? (/^set-(attr|settings)\./.test(op) ? HANDLERS["set-attr"] : null);
      if (!h) res = task(row, `no mechanical handler for \`${op}\``);
      else {
        let r;
        try {
          r = h(row, ctx);
        } catch (err) {
          r = fail(`${err.message}`);
        }
        res = r.ok ? { ...base, status: "applied", files: r.files, followUps: r.followUps ?? [], warnings: r.warnings ?? [], post: r.post ?? [], note: r.note ?? null } : task(row, `guard failed: ${r.reason}`);
      }
    }
    results.set(row.n, res);
  }
  return { ws, results: rows.map((r) => results.get(r.n)) };
}
