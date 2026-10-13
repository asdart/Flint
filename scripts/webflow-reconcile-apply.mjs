#!/usr/bin/env node
// Applies approved rows of a reconcile report to the repo (reconcile phase 4). Offline: no Webflow MCP call, no git commit.
// Usage: node scripts/webflow-reconcile-apply.mjs <report.json> --rows <1-5,8|auto|all> [--dry-run] [--refresh] [--build]
//          [--base <snapshot dir>] [--new <dump or snapshot>] [--tasks-json <file>] [--force] [--no-verify]
//        node scripts/webflow-reconcile-apply.mjs <report.json> --record-commit [<hash>]
//   <report.json>  the file `webflow-reconcile.mjs --json` wrote next to the report.
//   --rows         row numbers of the report ("1-5,8"), "auto" (every PULL row marked auto) or "all" (everything but repo-ahead rows).
//   --dry-run      print the diff and the task list, write nothing.
//   --refresh      after writing, refresh the base snapshot for the rows applied by this run and the approved rows that were
//                  already converged (webflow-snapshot.mjs --refresh does the same later, for the rows the agent edited).
//   --build        run `npm run build` and `npm run lint` afterwards (off by default: the agent runs them once, after its own edits).
//   --record-commit  note the commit that holds the applied edits in the report's "Applied" section (HEAD when no hash is given).
// An `auto` PULL row whose old value is still where the report says is edited. Anything else (assisted, manual, a failed
// guard, a CONFLICT, structure, components, interactions, custom code) is not edited: it is printed as a task for the agent.
// Exit codes: 0 everything approved is applied or already in sync; 3 some rows (or follow-ups of applied rows) need the
// agent; 2 refused (usage, stale report); 4 build or lint failed.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { applyRows } from "./reconcile/apply.mjs";
import { loadApplied, recordApplied } from "./reconcile/applied.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { printRefresh, refreshBase } from "./reconcile/refresh.mjs";
import { formatRows, loadReport, parseRows } from "./reconcile/rowspec.mjs";
import { DEFAULT_DATA } from "./reconcile/snapshot-io.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && !args[i + 1]?.startsWith("--") ? args[i + 1] : undefined;
};
const VALUE_FLAGS = new Set(["--rows", "--base", "--new", "--tasks-json", "--record-commit"]);
const positional = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.has(args[i - 1]));
const flag = (n) => args.includes(n);
const refuse = (msg) => {
  console.error(`Refused: ${msg}`);
  process.exit(2);
};
if (positional.length !== 1) refuse("usage: node scripts/webflow-reconcile-apply.mjs <report.json> --rows <1-5,8|auto|all> [--dry-run] [--refresh] [--build]");

let loaded;
try {
  loaded = loadReport(positional[0]);
} catch (e) {
  refuse(e.message);
}
const { file: reportFile, report } = loaded;

if (flag("--record-commit")) {
  const hash = opt("--record-commit") ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const rec = loadApplied(reportFile);
  if (!rec.rows.length) refuse("nothing is recorded as applied for this report");
  recordApplied(reportFile, report, [], { commit: hash });
  console.log(`Recorded commit ${hash.slice(0, 7)} in the Applied section of ${path.relative(ROOT, reportFile.replace(/\.json$/, ".md"))}.`);
  process.exit(0);
}

const baseDir = path.resolve(opt("--base") ?? DEFAULT_DATA);
const manifestFile = path.join(baseDir, "manifest.json");
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : null;
if (manifest && !flag("--force") && (manifest.dump !== report.meta.base.dump || manifest.repoCommit !== report.meta.base.repoCommit)) {
  refuse(`the report was made against the base ${report.meta.base.dump} at ${report.meta.base.repoCommit.slice(0, 7)}; the base is ${manifest.dump} at ${String(manifest.repoCommit).slice(0, 7)} now, so the report is stale. Run the reconcile again (or --force to edit anyway).`);
}

let nums;
try {
  nums = parseRows(opt("--rows"), report.rows);
} catch (e) {
  refuse(e.message);
}
if (!nums.length) {
  console.log("No rows selected.");
  process.exit(0);
}
const rows = report.rows.filter((r) => nums.includes(r.n));
const alreadyDone = new Set((manifest?.refreshedRows ?? []).filter((x) => x.newDump === report.meta.new.dump).flatMap((x) => x.keys));
const dry = flag("--dry-run");
const { ws, results } = applyRows(rows, { root: ROOT, alreadyDone });

// ---- print ------------------------------------------------------------------------------------------------
const by = (s) => results.filter((r) => r.status === s);
const applied = by("applied");
const tasks = by("task");
const followUps = applied.filter((r) => r.followUps?.length);
const noops = by("noop");
const skipped = by("skipped");
const rel = (f) => path.relative(ROOT, path.resolve(f)) || f;
console.log(`${dry ? "DRY RUN. " : ""}${rel(reportFile)}: rows ${formatRows(nums)} approved (${rows.length}).`);
if (applied.length) {
  console.log(`\n${dry ? "WOULD APPLY" : "APPLIED"} (${applied.length}):`);
  for (const r of applied) console.log(`  #${r.n} ${r.area} ${r.where}: ${r.element}  → ${r.files.join(", ")}${r.note ? `  (${r.note})` : ""}`);
}
if (noops.length) console.log(`\nALREADY IN SYNC, nothing to edit (${noops.length}): ${noops.map((r) => `#${r.n}${r.note?.startsWith("already applied") ? " (applied and refreshed earlier)" : ""}`).join(", ")}`);
if (skipped.length) console.log(`\nSKIPPED (${skipped.length}): ${skipped.map((r) => `#${r.n} ${r.note}`).join("; ")}`);
const warnings = applied.flatMap((r) => r.warnings ?? []);
if (warnings.length) {
  console.log("\nCHECK:");
  for (const w of warnings) console.log(`  ${w}`);
}
if (tasks.length || followUps.length) {
  console.log(`\n=== TASKS FOR THE AGENT (${tasks.length} row(s) not edited${followUps.length ? `, ${followUps.length} applied row(s) with follow-ups` : ""}) ===`);
  for (const t of tasks) {
    console.log(`\n#${t.n} [${t.direction}] ${t.area} · ${t.where} · ${t.element}`);
    console.log(`  why not automatic: ${t.reason}`);
    console.log(`  change:  ${JSON.stringify(t.change.base)} → ${JSON.stringify(t.change.webflow)}${t.change.repo !== undefined ? `   (repo has ${JSON.stringify(t.change.repo)})` : ""}`);
    console.log(`  do:      ${t.do}`);
    for (const n of t.notes.slice(0, 4)) console.log(`  note:    ${n}`);
    for (const m of t.reminders) console.log(`  remember: ${m}`);
  }
  for (const r of followUps) {
    console.log(`\n#${r.n} (applied) still needs:`);
    for (const f of r.followUps) console.log(`  - ${f}`);
  }
  console.log("\nContract: tokens for system values (rule 2), every class/token/component registered (rule 1), nothing generated edited by hand, record any failure or workaround you hit (rule 13).");
}

if (dry) {
  const diff = ws.diff();
  console.log(`\n--- diff (${ws.changed().length} file(s), nothing written) ---\n${diff || "(no change)"}`);
  const post = [...new Set(applied.flatMap((r) => r.post ?? []))];
  if (post.length) console.log(`then it would run: ${post.join("; ")}`);
} else {
  ws.flush();
  const post = [...new Set(applied.flatMap((r) => r.post ?? []))];
  for (const cmd of post) {
    const [bin, ...rest] = cmd.split(" ");
    const r = spawnSync(bin, rest, { cwd: ROOT, encoding: "utf8" });
    console.log(`\nran ${cmd}: ${r.status === 0 ? "ok" : `FAILED (${r.status})\n${r.stderr}`}`);
    if (r.status === 0) {
      const gen = execFileSync("git", ["status", "--porcelain", "--", "src/styles/utilities.css", "docs/webflow/classes.md"], { cwd: ROOT, encoding: "utf8" }).trim();
      if (gen) console.log(`  generated files changed:\n${gen.replace(/^/gm, "    ")}`);
    }
  }
  if (applied.length) recordApplied(reportFile, report, applied.map((r) => ({ n: r.n, key: r.key, where: r.where, element: r.element, how: "script", files: r.files })));
  console.log(`\n${ws.changed().length} file(s) changed${ws.changed().length ? `: ${ws.changed().join(", ")}` : ""}.`);
}

// ---- refresh and build -------------------------------------------------------------------------------------
let refreshed = false;
if (flag("--refresh") && !dry) {
  const ready = [...applied, ...noops.filter((r) => !r.note?.startsWith("already applied"))].map((r) => r.n);
  if (!ready.length) console.log("\nNothing to refresh yet.");
  else {
    try {
      const r = await refreshBase({ reportFile, rows: formatRows(ready), baseDir, input: opt("--new") ?? null, verify: !flag("--no-verify"), force: false });
      console.log("");
      printRefresh(r);
      if (r.refreshed.length) {
        recordApplied(reportFile, report, r.refreshed.map((n) => ({ n, refreshed: true, how: "script", files: [] })));
        refreshed = true;
      }
    } catch (e) {
      console.error(`\nThe base was NOT refreshed: ${e.message}`);
    }
  }
}
let buildFailed = false;
if (flag("--build") && !dry) {
  for (const script of ["build", "lint"]) {
    console.log(`\nnpm run ${script} …`);
    const r = spawnSync("npm", ["run", script], { cwd: ROOT, encoding: "utf8" });
    const tail = `${r.stdout}${r.stderr}`.trim().split("\n").slice(-12).join("\n");
    console.log(r.status === 0 ? `ok\n${script === "lint" ? tail.split("\n").slice(-3).join("\n") : ""}` : `FAILED (exit ${r.status})\n${tail}`);
    if (r.status !== 0) buildFailed = true;
  }
}
if (!dry) {
  const need = [];
  if (!flag("--build")) need.push("npm run build && npm run lint");
  if (!refreshed && (applied.length || noops.length)) need.push(`node scripts/webflow-snapshot.mjs --refresh ${rel(reportFile)} --rows <the rows that are done>`);
  if (need.length) console.log(`\nNext: ${need.join(", then ")} (after the agent finished its own edits).`);
}
if (flag("--tasks-json")) fs.writeFileSync(path.resolve(opt("--tasks-json")), `${JSON.stringify({ report: rel(reportFile), tasks, followUps: followUps.map((r) => ({ n: r.n, followUps: r.followUps })) }, null, 1)}\n`);
process.exit(buildFailed ? 4 : tasks.length || followUps.length ? 3 : 0);
