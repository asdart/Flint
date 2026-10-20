---
name: flint-reconcile
description: The on-demand /reconcile: pulls Webflow Designer edits back into the Flint repo through a changes report the user approves row by row. Use when the user says "reconcile" or "/reconcile", asks what changed on Webflow, or fears someone edited it; ALWAYS as the gate before any sync stage write and before any publish; at the end of a sync to refresh the base; and when a reconcile report exists and rows are approved, or when asked to apply, refresh or commit reconcile rows.
---

# Flint reconcile: pulling Webflow changes into the repo

The repo is the source of truth (`AGENTS.md` §1); Webflow can be edited by anyone. A reconcile compares three states (base snapshot =
Webflow at the last sync, the new Webflow dump, the repo) and writes a **changes report**. The user decides; nothing is applied to
`src/` without an approved row. Plan: `docs/webflow/plans/reconcile.md`. Formats and every flag:
`docs/webflow/snapshot/README.md` ("Reconcile report", "Apply and refresh"). Webflow MCP recipes for the dump:
[`flint-webflow-sync`](../flint-webflow-sync/SKILL.md) ("Reading the whole site").

## Run a reconcile (the /reconcile recipe)

On demand only: nobody schedules it. The user asks for it, or a sync stage or publish starts with it (the gate, below).

1. **Pick the dump.** `node scripts/webflow-gate.mjs --plan <new folder>` says whether a **gate dump** is enough (a base exists and its
   raw dump is still in `.cache/`) or a **full dump** is required (exit 3, with the reason; no base means the rebuild warning
   applies). Use the full dump when the user asks for a full audit, or when the last full one is old.
2. **Dump agent.** Spawn one **Sonnet agent at low effort** (the user's standing preference; no Haiku) with the brief below. The agent only
   reads and saves files; it interprets nothing. It runs while nobody edits the Designer.
3. **Check and, for a gate dump, compose.** Gate: `node scripts/webflow-gate.mjs --plan <dir>` (it lists the reads still to make; repeat
   steps 2 and 3 for them), then `--compose <dir>`. Full: `node scripts/webflow-snapshot.mjs <dump> --check`. A failure means someone
   edited during the dump or a read is missing: repeat it, never patch a dump by hand.
4. **Report**, **approval**, **apply**, **refresh**, **commit only when asked**: the flow below.

**Dump agent brief** (fill the angle brackets; for a gate dump paste the plan's read list under "Reads"):

> You are a read-only dump runner for the Flint Webflow site `6ab9ba4aeffb3329202448ee`. Call `data_sites_tool` `list_sites` first and stop if that id
> is not returned. Make no write call and never publish. Reads to make, each saved as its own file in `<abs dir>/` with exactly these names: `<the plan's
> list, or the full list from the flint-webflow-sync skill → "Reading the whole site">`. **Force every result into a file; never retype one.** The client
> saves a result only above about 90 KB, so repeat the same action inside one call until the call's output is well over 90 KB (the
> skill row "A dump needs every read result saved to a file" has the repeat counts), then write one copy of the result with a short script and
> check that all copies are equal. Send `session_id: "start"` on the first call, reuse the returned id. When every file exists, run `node scripts/webflow-snapshot.mjs
> <dump dir> --check` (full dump) or `node scripts/webflow-gate.mjs --plan <dir>` (gate), print the counts, and answer with those counts and the list of files only.
> Do not paste tree or style content into your answer. If a read fails, say which and stop.

## Gate: before any sync write and any publish

A reconcile gate protects the Webflow edits from being overwritten by a push (AGENTS.md rule 11).

1. Run the recipe above (gate dump when possible) and `node scripts/webflow-reconcile.mjs <dump> --json`.
2. Read the report header and counts. **PULL or CONFLICT rows: stop.** Show them to the user (area, where, base to Webflow, proposed edit),
   and write nothing to Webflow until the user has decided each one: pull it (apply + refresh, flow below), keep the repo's value (it
   is pushed at the sync and the report says so), or defer. REPO AHEAD and CONVERGED rows do not block. Pre-existing differences do not block.
3. No base (fresh clone, cloud session, lost disk): there is nothing to compare. Say so plainly, take a full dump and rebuild
   (`node scripts/webflow-snapshot.mjs <dump> --rebuild --yes`), and tell the user: **rebuilding resets the base, so any Webflow edit made since the last sync is absorbed
   silently instead of reported**. Ask first when the old `data/` still exists: run the reconcile on it before rebuilding.
4. Publishing: run the gate immediately before invoking `/safe-publish` (a plugin skill we do not edit); the publish waits for a clean gate.

## Refresh at the end of every sync

After the sync's writes are read back and the repo changes are **committed** (the user asks for the commit): take a gate or full dump and rebuild the
base so base = the agreed state: `node scripts/webflow-snapshot.mjs <dump> --rebuild --yes --commit HEAD`, then `node scripts/webflow-map.mjs` (the id map for the new
base; a repo that equals Webflow). Run the reconcile on that dump first: anything it shows besides the sync's own writes is an edit made by someone else meanwhile; show it
before rebuilding. This also clears `refreshedRows` and `repoBase` of earlier partial refreshes. A dump taken before the sync's last write is not a base.

## The flow

1. **Dump** (reads only: a full dump is about 58 MCP calls, a gate dump about 11 to 20, see "Run a reconcile"). Run it in a throwaway **Sonnet agent at low effort**
   while nobody edits the Designer; it saves one file per call to `.cache/webflow-dump/<UTC timestamp>/` and prints counts. Then
   `node scripts/webflow-snapshot.mjs <dump> --check` (a gate dump: `webflow-gate.mjs --compose`, which runs the check). Repeat the dump if it fails.
2. **Report.** `node scripts/webflow-reconcile.mjs <dump> --json [--summary docs/webflow/reconcile/<date>.summary.md]` writes
   `docs/webflow/reconcile/<date>.md` (committed record) and `.json` (working data). Read the **Pull or decide** tables with the user.
   Rows are PULL (Webflow changed), CONFLICT (both sides changed: the user picks a side), CONVERGED and REPO AHEAD (nothing to do).
   "Pre-existing differences" are drift that was already there: triage them separately.
3. **Approval.** The user names rows ("rows 1-5, 8", or "all auto"). Nothing else is touched. A conflict row needs a stated winner.
4. **Apply the mechanical rows.** `node scripts/webflow-reconcile-apply.mjs docs/webflow/reconcile/<date>.json --rows <rows> --dry-run`
   first (it prints the diff and the task list), then without `--dry-run`. It edits only `auto` PULL rows whose old value is still where
   the report says (text, classes, string props and attributes, CSS declarations, new classes, tokens). Exit codes: 0 all done, 3 the
   agent has work left, 2 refused (stale report, bad rows), 4 build or lint failed. Do not hand-edit what it applied.
5. **Do the task list** (exit 3): the rows it did not edit, and the follow-ups of rows it did (class registry row, `tokens.md` row).
   Each task has `file:line`, old → new and what to do. Rules while you edit:
   - **Tokens for system values** (rule 2): a raw px or hex only if it is local to one block; a value that equals a token is `var(--x)`.
     Ask the user when the task says "snap to token".
   - **Registries first** (rule 1): a new class, token, component, prop or variant is listed in `classes.md`, `tokens.md`,
     `components.md` in the same change; the report row says which line.
   - **Never edit generated files**: `utilities.css` (change the token or `scripts/gen-utilities.mjs`, run it), custom code in
     `docs/webflow/custom-code/` and the page head/footer blocks (change the source in `src/` or `src/styles/exceptions/`, run its
     `scripts/build-x-*.mjs`).
   - **Structure** (added, removed, moved elements, restructure rows) follows the contract: semantic tags, one `h1`, registered classes,
     icons as SVG images. A Webflow-only component or prop becomes a component file and a registry row.
   - **Record what fails or needed a workaround** (rule 13) in this skill, the playbook or the registries before you report back.
6. **Build and lint.** `npm run build` and `npm run lint`, once, after all edits (the baseline has 3 lint warnings in
   `scripts/webflow-tree-diff.mjs`; add none). `--build` on the apply script runs both if you want it in one go.
7. **Refresh the base** for the rows that are now done: `node scripts/webflow-snapshot.mjs --refresh docs/webflow/reconcile/<date>.json --rows <rows>`
   (the apply script's `--refresh` did it for the rows it applied). The refresh first re-runs the reconcile and refuses a row that is still
   PULL or CONFLICT; fix the repo, then retry. Afterwards `node scripts/webflow-reconcile.mjs <same dump> --out /tmp/check.md` shows the
   refreshed rows gone and only the rows you did not take. Never use `--force` or `--no-verify` to get past a refusal without telling the user.
8. **Report back.** The report's `## Applied` section lists rows, how (script or agent), files and "base refreshed". Tell the user what
   was applied, what is left and any follow-up. **Commit only when the user asks**; then
   `node scripts/webflow-reconcile-apply.mjs <report.json> --record-commit` notes the hash in the report, and the report `.md` is committed
   with the change.

## Rules of thumb

- `repoCommit` in the manifest does not move on a partial refresh; the next sync stage ends with a rebuild
  (`webflow-snapshot.mjs <dump> --rebuild --yes --commit HEAD`, "Refresh at the end of every sync", after the applied edits are committed and pushed to Webflow), which resets the base and clears
  `refreshedRows` / `repoBase`. Do not rebuild before then: it would absorb every unreported Webflow edit silently. While `refreshedRows` exists the gate asks for a full dump (the base's raw dump no longer equals the base).
- A Webflow edit the user does **not** want to keep is not pulled: it is pushed back at the next sync (the repo wins). Say so in the report summary.
- Deleting anything on Webflow, and publishing, still need the user's explicit yes (rule 12). Reconcile never writes to Webflow.
- When a result surprises you (a row that should be auto and isn't, a refresh that is refused), read the row's `notes` and the README
  before improvising, and fix the tool or the docs rather than working around it silently.
- A PULL row whose "Webflow" value is what the repo already renders is a tool bug, not a Webflow edit (found 2026-10-14: 50 rows after a
  sync that made Webflow match the repo). The rule: repo value now = new Webflow value means CONVERGED, whatever the base repo value was
  (`direction()` in `scripts/reconcile/rows.mjs`). Check this before asking the user to approve a PULL list that looks like "the sync's own writes".
- **Learnings from the 2026-10-17 run (68 rows, rule 13):**
  - *Same string in two places.* The map picks an occurrence by order, and can pick the wrong one (Webinar: the report pointed the page paragraph at the modal title on line 87; the page text is the `body` prop on line 22). Read the row's `occ` / `alts` and open both lines before an assisted text row; the script only guards that the old text is on the line.
  - *`\n` is not a `<br>`.* A string with `\n` renders as one text run; Webflow's text, `<br>`, text is three nodes. To converge, write the `<br />` in JSX (a `ReactNode` prop, as in `TwoWays` `body`), not a newline.
  - *Rows `--refresh` cannot take (the repo may be right, the tool can't see it):* a removed text run inside a string (row 66, "&" and "A webinar"), a Webflow structure the repo deliberately does not copy (row 5, a `strong` and span in the About h1), a removed element the map cannot place (row 17, "element not mapped", a stat passed as a prop), and a section removed behind a condition (row 9). Leave the row unrefreshed, record it as applied with "Base refreshed: no", and say so: it shows as PULL until the sync's rebuild.
  - *Declining a row after its base was refreshed.* Remove the edit from `src/`, drop the row from `<report>.applied.json` and rewrite the section (`writeSection` in `scripts/reconcile/applied.mjs`). A refreshed base with a repo that lacks the value is "repo ahead" and the next page sync overwrites Webflow silently; for a new element (row 19, a `<br>`) the compare doesn't even list it. Tell the user it stays on Webflow until the next page sync.
  - *Undoing a refresh.* Back up `docs/webflow/snapshot/data/`, rebuild from the old raw dump (`webflow-snapshot.mjs <old dump> --rebuild --yes --commit <the base's repoCommit>`), then `--refresh` again with only the rows to keep. Verify with `diff -rq` against the backup: only the manifest and the pages of the undone rows may differ.
  - *Stage by file, not by directory,* when another process may be editing `src/` (a `git add src` once committed two edits made elsewhere). Check `git status` and `git diff` before each commit.
- **2026-10-20 run (rule 13):** `--refresh` refuses every assisted row whose repo side is "not compared" (page settings `openGraph.imageAssetId` / `includeInSitemap`, asset `altText`, site custom code) even when the repo already records the value (`components.md`, the page's `imageAlt`, `schema.ts`): it shows as PULL until the sync's rebuild. Record them as applied with "Base refreshed: no". A site-code row can also be labelled with the first block's comment (`x-button-gradient`) while the change sits in another block (`x-schema-site` `sameAs`): diff the whole `site-freeform` of the base and new dumps before hunting for a source.
