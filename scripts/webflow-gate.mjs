#!/usr/bin/env node
// The reconcile gate's partial dump (reconcile phase 5). A gate does not need the full ~58-call dump: the dump agent reads
// five quick-check signals, this script says which other reads the signals ask for (`--plan`), and `--compose` assembles a
// complete raw dump from those reads plus the unchanged files of the base's raw dump. The normal reconcile then runs on it.
// Offline: no Webflow MCP call. See docs/webflow/snapshot/README.md ("The gate: a partial dump").
//
// Usage:
//   node scripts/webflow-gate.mjs --plan <partial-dir> [--base <data dir>] [--from <base raw dump>] [--json]
//   node scripts/webflow-gate.mjs --compose <partial-dir> [--out <full dump dir>] [--base <data dir>] [--from <base raw dump>] [--force]
//     --out    default .cache/webflow-dump/<UTC timestamp> (a name webflow-snapshot.mjs reads the taken-at time from)
//     --from   the base's raw dump folder (default: the manifest's `dump`)
// Exit codes: 0 ok; 3 a FULL dump is required (the reasons are printed); 2 the partial dir lacks reads or the usage is wrong;
// 1 the composed dump fails `webflow-snapshot.mjs --check` or something was edited during the dump.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { composeGate, formatPlan, planGate } from "./reconcile/gate.mjs";
import { ROOT } from "./reconcile/paths.mjs";
import { DEFAULT_DATA } from "./reconcile/snapshot-io.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const usage = "Usage: node scripts/webflow-gate.mjs --plan <partial-dir> | --compose <partial-dir> [--out <dir>] [--base <data dir>] [--from <base raw dump>] [--json] [--force]";
const planDir = opt("--plan");
const composeDir = opt("--compose");
if ((!planDir && !composeDir) || (planDir && composeDir)) {
  console.error(usage);
  process.exit(2);
}
const baseDir = path.resolve(opt("--base") ?? DEFAULT_DATA);
const fromDir = opt("--from");

if (planDir) {
  const plan = planGate(planDir, { baseDir, fromDir });
  if (args.includes("--json")) {
    const rest = { ...plan };
    delete rest.pages;
    console.log(JSON.stringify(rest, null, 2));
  } else console.log(formatPlan(plan, planDir));
  process.exit(plan.mode === "full" ? 3 : plan.mode === "signals" ? 2 : 0);
}

const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
const out = path.resolve(opt("--out") ?? path.join(ROOT, ".cache/webflow-dump", stamp()));
try {
  const r = composeGate(composeDir, out, { baseDir, fromDir, force: args.includes("--force") });
  console.log(`Composed ${path.relative(ROOT, r.out) || r.out}: ${r.reread.length} files re-read, ${r.reused.length} taken from the base dump (${r.reused.join(", ") || "none"}).`);
  const check = spawnSync("node", [path.join(ROOT, "scripts/webflow-snapshot.mjs"), r.out, "--check"], { cwd: ROOT, encoding: "utf8" });
  process.stdout.write(check.stdout ?? "");
  process.stderr.write(check.stderr ?? "");
  if (check.status !== 0) {
    console.error("The composed dump fails the check: do not use it. Repeat the gate reads, or take a full dump.");
    process.exit(1);
  }
  console.log(`Next: node scripts/webflow-reconcile.mjs ${path.relative(ROOT, r.out) || r.out} --json`);
} catch (e) {
  console.error(e.message);
  process.exit(e.code === "full" ? 3 : e.code === "edited" ? 1 : 2);
}
