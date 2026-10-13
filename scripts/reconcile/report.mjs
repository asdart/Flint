// Renders the reconcile rows as the changes report (markdown) and as the machine-readable list (JSON).
import { AREA_ORDER } from "./rows.mjs";

const OPS = {
  "replace-text": "replace the text",
  "change-classes": "change the classes",
  "set-prop": "set the prop",
  "add-element": "insert the element",
  "remove-element": "remove the element",
  "move-element": "move the element",
  restructure: "restructure",
  "set-declaration": "set the declaration",
  "remove-declaration": "remove the declaration",
  "add-declaration": "add a declaration to the rule",
  "add-rule": "add the rule",
  "remove-rule": "remove the rule",
  "set-token": "set the token",
  "add-token": "add the token",
  "remove-token": "remove the token",
  "rename-token": "rename the token",
  "add-component": "create the component",
  "remove-component": "remove the component",
  "rename-component": "rename the component",
  "add-prop": "add the prop",
  "remove-prop": "remove the prop",
  "rename-prop": "rename the prop",
  "set-custom-code": "change the source, rebuild",
};

const clip = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const val = (v, n = 70) => {
  if (v === null || v === undefined) return "∅";
  const s = typeof v === "string" ? v : Array.isArray(v) ? v.join(" ") : JSON.stringify(v);
  if (s === "") return '""';
  const c = cell(clip(s, n));
  return c.includes("`") ? c : `\`${c}\``;
};

export function editCell(r) {
  const e = r.edit;
  const note = r.notes?.length ? `<br>_${cell(clip(r.notes.slice(0, 2).join("; "), 170))}_` : "";
  if (!e) return `edit by hand${note}`;
  const op = OPS[e.op] ?? e.op.replace(/-/g, " ");
  const where = e.file ? `\`${e.file}${e.line ? `:${e.line}` : ""}\`` : "";
  const parts = [where ? `${where} ${op}` : op];
  if (e.tokensMd) parts.push(`\`${e.tokensMd}\``);
  if (e.registry) parts.push(`\`${e.registry}\``);
  if (e.builder) parts.push(`then \`node ${e.builder}\``);
  if (e.op === "change-classes") parts.push(`${e.remove?.length ? `−${e.remove.join(" ")}` : ""}${e.add?.length ? ` +${e.add.join(" ")}` : ""}`.trim());
  if (e.target) parts.push(`${e.target.position === "after" ? "after" : "as first child of"} ${e.target.file ? `\`${e.target.file}:${e.target.line}\` ` : ""}(${cell(clip(e.target.desc, 50))})`);
  if (e.members) {
    const mark = { PULL: "pull", CONFLICT: "conflict", CONVERGED: "done" };
    const list = e.members.slice(0, 10).map((m) => `${mark[m.direction]}: ${m.change} ${cell(clip(m.element, 45))}${m.file ? ` \`${m.file}:${m.line}\`` : ""}${m.target ? ` → after \`${m.target.file}:${m.target.line}\`` : ""}`);
    if (e.members.length > 10) list.push(`… ${e.members.length - 10} more`);
    return `${parts.join("; ")}${note}<br>${list.join("<br>")}`;
  }
  return `${parts.join("; ")}${note}`;
}

function change(r) {
  if (r.direction === "REPO AHEAD") return `Webflow ${val(r.webflow)}<br>repo ${val(r.repoBase)} → ${val(r.repo)}`;
  const main = `${val(r.base)} → ${val(r.webflow)}`;
  return r.direction === "CONFLICT" ? `${main}<br>repo: ${val(r.repo)}` : main;
}

function table(rows) {
  const out = ["| # | Area | Where | Element | Base → Webflow | Direction | Proposed repo edit | Mode |", "| --- | --- | --- | --- | --- | --- | --- | --- |"];
  for (const r of rows) out.push(`| ${r.n} | ${cell(r.sub)} | ${cell(r.where)} | ${cell(clip(r.element, 60))} | ${change(r)} | ${r.direction} | ${editCell(r)} | ${r.mode} |`);
  return out.join("\n");
}

export function renderMarkdown(rep) {
  const { meta, rows, counts, footer } = rep;
  const L = [];
  L.push(`# Reconcile report ${meta.date}`, "");
  L.push("Webflow-side changes since the last sync, compared with what the repo did meanwhile (three-way, see `docs/webflow/plans/reconcile.md`). Approve rows by number (\"rows 1-5, 8\"); nothing has been applied.", "");
  L.push("| | |", "| --- | --- |");
  L.push(`| Base snapshot | \`${meta.base.dump}\`, taken ${meta.base.takenAt}, repo commit \`${meta.base.repoCommit.slice(0, 7)}\` |`);
  L.push(`| New dump | \`${meta.new.dump}\`, taken ${meta.new.takenAt} |`);
  L.push(`| Repo HEAD | \`${meta.repo.head.slice(0, 7)}\`${meta.repo.srcDirty ? ", uncommitted changes in src/" : ""} |`);
  L.push(`| src/ since the base | ${meta.repo.srcChangedFiles ? `${meta.repo.srcChangedFiles} file(s) changed (committed or not): the repo side was compared by re-rendering the working tree` : "unchanged: the stored map is valid, the repo side equals the base"} |`);
  L.push(`| Map | ${meta.repo.mapNote} |`);
  L.push(`| Counts | **PULL ${counts.PULL}**, **CONFLICT ${counts.CONFLICT}**, CONVERGED ${counts.CONVERGED}, REPO AHEAD ${counts["REPO AHEAD"]} |`, "");

  const action = rows.filter((r) => r.direction === "PULL" || r.direction === "CONFLICT");
  const info = rows.filter((r) => r.direction === "CONVERGED" || r.direction === "REPO AHEAD");
  const areas = (list) => AREA_ORDER.filter((a) => list.some((r) => r.area === a));
  L.push("## Pull or decide", "");
  if (!action.length) L.push("Nothing to pull: Webflow has no change that the repo lacks.", "");
  for (const a of areas(action)) {
    const rs = action.filter((r) => r.area === a);
    L.push(`### ${a} (${rs.length})`, "", table(rs), "");
  }
  L.push("## In sync or repo ahead (no action)", "");
  const conv = info.filter((r) => r.direction === "CONVERGED");
  const ahead = info.filter((r) => r.direction === "REPO AHEAD");
  L.push(`### Converged (${conv.length})`, "", "Both sides changed and ended at the same value.", "");
  if (conv.length) L.push(table(conv), "");
  L.push(`### Repo ahead (${ahead.length})`, "", "The repo changed, Webflow did not: pushed at the next sync.", "");
  if (ahead.length) L.push(table(ahead), "");

  L.push("## Signals and noise", "");
  L.push(`- Accepted differences subtracted (\`accepted.json\`): ${footer.accepted}`);
  if (footer.noise.length) L.push(`- Webflow grid defaults ignored: ${footer.noise.length}`);
  if (footer.versionOnly.length) L.push(`- Interactions whose only change is the version counter: ${footer.versionOnly.join(", ")}`);
  if (footer.goneFromRender) L.push(`- Mapped elements no longer found in the repo render: ${footer.goneFromRender} (removed, or the alignment lost them: not listed as rows)`);
  if (footer.unlocated.length) L.push(`- Custom code with no matching file in docs/webflow/custom-code: ${footer.unlocated.join(", ")}`);
  if (footer.bound?.length) L.push(`- Attributes now bound to a component prop, not changes: ${footer.bound.length}${footer.bound.length <= 3 ? ` (${footer.bound.join("; ")})` : ""}`);
  if (footer.unalignedPre) L.push(`- Pre-existing differences not listed because the page is marked \`unaligned\` in \`accepted.json\` (the repo page and the Webflow page differ too much to pair elements): ${footer.unalignedPre}`);
  if (footer.misaligned?.length) L.push(`- Repo-ahead text rows dropped because the alignment paired unrelated strings (${footer.misaligned.length}): ${footer.misaligned.slice(0, 6).join("; ")}${footer.misaligned.length > 6 ? "; …" : ""}`);
  for (const s of footer.signals) L.push(`- ${s}`);
  L.push("");
  const pre = footer.preexisting ?? [];
  L.push(`## Pre-existing differences (${pre.length})`, "");
  L.push("The repo and Webflow differ here in the base and still do; Webflow did not change it, so it is not a row. Review them, fix one side, or list the line (or a `pattern`) in `accepted.json` (`element`).", "");
  if (pre.length) {
    const groups = new Map();
    for (const p of pre) {
      const k = `${p.where}\u0000${p.field}`;
      groups.set(k, [...(groups.get(k) ?? []), p]);
    }
    L.push("| Where | Field | Repo | Webflow | Elements | Example |", "| --- | --- | --- | --- | --- | --- |");
    for (const list of groups.values()) {
      const p = list[0];
      const same = (f) => list.every((x) => x[f] === p[f]);
      L.push(`| ${cell(p.where)} | ${cell(p.field)} | ${val(p.repo, 50)}${same("repo") ? "" : " …"} | ${val(p.webflow, 50)}${same("webflow") ? "" : " …"} | ${list.length}${list.length > 1 ? "" : ` (${cell(clip(p.element, 40))})`} | ${p.file ? `\`${p.file}:${p.line}\`` : ""} |`);
    }
    L.push("");
  }
  return `${L.join("\n")}\n`;
}
