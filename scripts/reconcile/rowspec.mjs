// Shared by the apply and refresh tools: reads the report's JSON rows and a `--rows` selection.
import fs from "node:fs";
import path from "node:path";

export function loadReport(file) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) throw new Error(`no such report: ${file}`);
  if (!abs.endsWith(".json")) throw new Error(`pass the report's JSON (${path.basename(abs, ".md")}.json, written by webflow-reconcile.mjs --json), not the markdown`);
  const report = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (report.schema !== 1 || !Array.isArray(report.rows)) throw new Error(`${file} is not a reconcile report`);
  return { file: abs, report };
}

/**
 * "1-5,8" (row numbers), "auto" (every PULL row the report marks auto) or "all" (every row that is not repo-ahead).
 * Returns the sorted row numbers; throws on a number the report does not have.
 */
export function parseRows(spec, rows) {
  if (!spec) throw new Error("--rows is required (for example --rows 1-5,8, or --rows auto)");
  const have = new Set(rows.map((r) => r.n));
  if (spec === "auto") return rows.filter((r) => r.direction === "PULL" && r.mode === "auto").map((r) => r.n);
  if (spec === "all") return rows.filter((r) => r.direction !== "REPO AHEAD").map((r) => r.n);
  const out = new Set();
  for (const part of spec.split(",").map((p) => p.trim()).filter(Boolean)) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!m) throw new Error(`cannot read "${part}" in --rows`);
    const a = Number(m[1]);
    const b = Number(m[2] ?? m[1]);
    if (b < a) throw new Error(`"${part}" runs backwards`);
    for (let n = a; n <= b; n++) {
      if (!have.has(n)) throw new Error(`the report has no row ${n} (it has ${rows.length ? `1-${rows.length}` : "none"})`);
      out.add(n);
    }
  }
  return [...out].sort((x, y) => x - y);
}

export const formatRows = (nums) => {
  const parts = [];
  for (let i = 0; i < nums.length; ) {
    let j = i;
    while (nums[j + 1] === nums[j] + 1) j++;
    parts.push(j > i ? `${nums[i]}-${nums[j]}` : `${nums[i]}`);
    i = j + 1;
  }
  return parts.join(",");
};
