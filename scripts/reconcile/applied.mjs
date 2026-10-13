// The "Applied" record of a report: a sidecar `<report>.applied.json` (working data, gitignored with the other
// report JSON) and the `## Applied` section of the committed markdown report, rebuilt from it.
import fs from "node:fs";
import path from "node:path";
import { formatRows } from "./rowspec.mjs";

const sidecarOf = (reportJson) => reportJson.replace(/\.json$/, ".applied.json");
const mdOf = (reportJson) => reportJson.replace(/\.json$/, ".md");

export function loadApplied(reportJson) {
  const f = sidecarOf(reportJson);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { rows: [], commit: null };
}

/** Records rows as applied (`how`: "script" or "agent"), then rewrites the markdown section. */
export function recordApplied(reportJson, report, entries, { commit } = {}) {
  const rec = loadApplied(reportJson);
  for (const e of entries) {
    const row = report.rows.find((r) => r.n === e.n);
    const prev = rec.rows.find((r) => r.n === e.n);
    const next = { n: e.n, key: row?.key ?? e.key, where: row?.where ?? e.where, element: row?.element ?? e.element, how: prev?.how ?? e.how, files: [...new Set([...(prev?.files ?? []), ...(e.files ?? [])])], refreshed: e.refreshed ?? prev?.refreshed ?? false, at: e.at ?? prev?.at ?? new Date().toISOString() };
    if (prev) Object.assign(prev, next);
    else rec.rows.push(next);
  }
  if (commit !== undefined) rec.commit = commit;
  rec.rows.sort((a, b) => a.n - b.n);
  fs.writeFileSync(sidecarOf(reportJson), `${JSON.stringify(rec, null, 1)}\n`);
  writeSection(reportJson, rec);
  return rec;
}

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function sectionText(rec) {
  const L = ["## Applied", ""];
  if (!rec.rows.length) {
    L.push("Nothing applied yet.", "");
  } else {
    L.push(`Rows ${formatRows(rec.rows.map((r) => r.n))} were applied to the repo (\`how\`: \`script\` = webflow-reconcile-apply.mjs, \`agent\` = edited by hand from the task list). "Base refreshed" means the snapshot base now holds Webflow's value for the row, so the next reconcile reports it as in sync.`, "");
    L.push("| # | Where | Element | How | Files | Base refreshed |", "| --- | --- | --- | --- | --- | --- |");
    for (const r of rec.rows) L.push(`| ${r.n} | ${cell(r.where)} | ${cell(r.element).slice(0, 60)} | ${r.how} | ${cell((r.files ?? []).map((f) => `\`${f}\``).join(", "))} | ${r.refreshed ? "yes" : "no"} |`);
    L.push("");
  }
  L.push(rec.commit ? `Commit: \`${rec.commit}\`` : "Commit: not committed yet (committed only when the user asks; then `node scripts/webflow-reconcile-apply.mjs <report.json> --record-commit` notes the hash here).", "");
  return L.join("\n");
}

export function writeSection(reportJson, rec) {
  const md = mdOf(reportJson);
  if (!fs.existsSync(md)) return;
  let text = fs.readFileSync(md, "utf8");
  const section = sectionText(rec);
  const existing = /^## Applied\n[\s\S]*?(?=^## |(?![\s\S]))/m;
  if (existing.test(text)) text = text.replace(existing, `${section}\n`);
  else if (/^## Pull or decide/m.test(text)) text = text.replace(/^## Pull or decide/m, `${section}\n## Pull or decide`);
  else text = `${text.replace(/\n*$/, "\n")}\n${section}`;
  fs.writeFileSync(md, text);
}

export const reportName = (reportJson) => path.basename(reportJson, ".json");
